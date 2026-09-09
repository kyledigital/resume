"""Check static page integrity without requiring a running browser."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json

ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(); self.ids=[]; self.links=[]; self.controls=[]; self.h1=0
        self.feed(path.read_text(encoding='utf-8'))
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        if tag=='h1': self.h1+=1
        if tag=='a' and 'href' in attrs: self.links.append(attrs['href'])
        if tag=='img': self.links.append(attrs['src']); assert attrs.get('alt'), 'Missing image description'
        if 'aria-controls' in attrs: self.controls.append(attrs['aria-controls'])

pages={p:Page(p) for p in [ROOT/'index.html',*sorted((ROOT/'work').glob('*.html'))]}
for path,page in pages.items():
    assert len(page.ids)==len(set(page.ids)), f'Duplicate IDs: {path}'
    assert page.h1==1, f'Expected one main heading: {path}'
    assert all(x in page.ids for x in page.controls), f'Broken disclosure target: {path}'
    for link in page.links:
        url=urlsplit(link)
        if url.scheme or url.netloc: continue
        target=(path.parent/unquote(url.path)).resolve() if url.path else path
        assert target.exists(), f'Missing local target: {link} in {path}'
        if url.fragment and target in pages:
            assert unquote(url.fragment) in pages[target].ids, f'Broken fragment: {link}'
data=json.loads((ROOT/'assets/data/projects.json').read_text(encoding='utf-8'))
assert len(data)==17
assert len({p['id'] for p in data})==17
assert sum(p['label']=='Campaign' for p in data)==6
for project in data:
    assert all(project.get(key) for key in ['role','evidence','status','question'])
    assert (ROOT/'work'/f'{project["id"]}.html').exists()
assert 'not leads or sales' in next(p['evidence'] for p in data if p['id']=='yello-hub')
assert 'not hours worked' in next(p['evidence'] for p in data if p['id']=='workload-dashboard')
print(f'Passed: {len(pages)} pages, local links, fragments, IDs, disclosure targets and evidence boundaries.')
