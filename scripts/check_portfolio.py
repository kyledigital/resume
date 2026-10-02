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
assert len(data)==20
assert len({p['id'] for p in data})==len(data)
assert sum(p['label']=='Campaign' for p in data)==5
assert {p['id'] for p in data if 'websites' in p['categories']} == {'vw-plus','ashers-fleet','new-best-decorators'}
for project in data:
    assert all(project.get(key) for key in ['role','evidence','status','question'])
    assert (ROOT/'work'/f'{project["id"]}.html').exists()
    for item in project.get('media',[]):
        assert all(item.get(key) for key in ['title','kind','url','description','source_name'])
        assert item['kind'] in ['Video','Image','Carousel']
        assert urlsplit(item['url']).scheme=='https'
        if item.get('image'):
            assert item.get('alt')
            assert (ROOT/'assets/images/projects'/item['image']).is_file()
        assert item['url'] in (ROOT/'work'/f'{project["id"]}.html').read_text(encoding='utf-8')
    for metric in project.get('metrics',[]):
        assert all(metric.get(key) for key in ['label','value','scope','source_label'])
        if metric.get('source_url'):
            assert urlsplit(metric['source_url']).scheme=='https'
assert 'not leads or sales' in next(p['evidence'] for p in data if p['id']=='yello-hub')
assert 'not hours worked' in next(p['evidence'] for p in data if p['id']=='workload-dashboard')
enersave=next(p for p in data if p['id']=='enersave')
assert enersave['group']=='independent'
assert set(enersave['categories'])=={'marketing','independent'}
assert enersave['client_relationship']=='Independent freelance client'
index=(ROOT/'index.html').read_text(encoding='utf-8')
yello_details=index.split('id="exp-details-earlier-yello"',1)[1].split('</ul>',1)[0]
assert 'Enersave' not in yello_details
assert 'exp-details-freelance-enersave' in index
assert 'independent freelance client' in (ROOT/'work/enersave.html').read_text(encoding='utf-8')
assert len(pages)==len(data)+1
copy='\n'.join(path.read_text(encoding='utf-8') for path in pages)
for unsupported in ['231K+', '$1.19M', '8.4x', '185M+', '65+', '35%', 'Official certificate pending', '2018 – 2021', '2021 – 2025']:
    assert unsupported not in copy, f'Unsupported or stale claim: {unsupported}'
assert 'May 2026 – Present' in copy
assert 'Certified Digital Marketing Professional' in copy
assert 'Issued · 14 Sep 2026' in copy
assert (ROOT/'assets/Kyle_Hector_Resume.pdf').read_bytes().startswith(b'%PDF-')
print(f'Passed: {len(pages)} pages, local links, fragments, IDs, disclosure targets and evidence boundaries.')
