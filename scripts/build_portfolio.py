"""Build static project cards and case studies from the curated portfolio data.

Run from the repository root. Generated HTML is committed for GitHub Pages.
"""
from pathlib import Path
import json
from html import escape as e

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'assets/data/projects.json'

def picture(p, prefix=''):
    if not p.get('image'):
        return ''
    responsive = f' srcset="{prefix}assets/images/projects/{e(p["imageSmall"])} 720w, {prefix}assets/images/projects/{e(p["image"])} {p["imageWidth"]}w" sizes="(max-width:768px) calc(100vw - 40px), 520px"' if p.get('imageSmall') else ''
    decoding = ' decoding="async"' if p.get('imageSmall') else ''
    return f'<img class="project-image" src="{prefix}assets/images/projects/{e(p["image"])}"{responsive} alt="{e(p["imageAlt"])}" width="{p.get("imageWidth",1280)}" height="{p.get("imageHeight",800)}" loading="lazy"{decoding}>'

def card(p):
    categories = ' '.join(p['categories'] + (['featured'] if p.get('featured') else []))
    image = picture(p)
    treatment = ' project-artwork-link' if p.get('imageTreatment') == 'artwork' else ''
    visual = f'<a class="project-image-link{treatment}" href="work/{p["id"]}.html" tabindex="-1" aria-hidden="true">{image}</a>' if image else ''
    proof = f'<p class="project-proof">{e(p["proof"])}</p>' if p.get('proof') else ''
    return f'''<article class="project-card" data-project data-category="{categories}">
      {visual}<div class="project-body"><div class="project-meta"><span class="maturity">{e(p['label'])}</span><span>{e(p['discipline'])}</span></div>
      <h3><a href="work/{p['id']}.html">{e(p['title'])}</a></h3><p class="project-hook">{e(p['subtitle'])}</p>
      <p>{e(p['summary'])}</p>{proof}<p class="project-role"><strong>My contribution</strong> {e(p['role'])}</p>
      <a class="project-read" href="work/{p['id']}.html">Explore project <span aria-hidden="true">→</span><span class="sr-only">: {e(p['title'])}</span></a></div></article>'''

def campaign_media(p):
    """Link authentic local previews to their corresponding original posts."""
    if not p.get('media'):
        return ''
    cards=[]
    for item in p['media']:
        date=f'<span>{e(item["published"])}</span>' if item.get('published') else ''
        icon='▶' if item['kind']=='Video' else '↗'
        dimensions = f' width="{item["width"]}" height="{item["height"]}"' if item.get('width') else ''
        responsive = f' srcset="../assets/images/projects/{e(item["imageSmall"])} 720w, ../assets/images/projects/{e(item["image"])} {item["width"]}w" sizes="(max-width:768px) calc(100vw - 40px), 510px"' if item.get('imageSmall') else ''
        badge='' if p.get('imageTreatment')=='artwork' else f'<span class="campaign-media-open" aria-hidden="true">{icon} {e(item["kind"])}</span>'
        visual=f'<div class="campaign-media-frame"><img src="../assets/images/projects/{e(item["image"])}"{responsive}{dimensions} alt="{e(item["alt"])}" loading="lazy" decoding="async">{badge}</div>' if item.get('image') else ''
        kind=f'<span class="maturity">{e(item["kind"])}</span>' if not item.get('image') or p.get('imageTreatment')=='artwork' else ''
        cards.append(f'''<article class="campaign-media-card"><a class="campaign-media-link" href="{e(item['url'])}" target="_blank" rel="noopener noreferrer">{visual}<div class="campaign-media-copy">{kind}<h3>{e(item['title'])}</h3><p>{e(item['description'])}</p><div class="campaign-media-meta"><span>{e(item['source_name'])}</span>{date}</div><span class="campaign-media-cta">Open original post <span aria-hidden="true">↗</span></span><span class="sr-only"> (opens in a new tab)</span></div></a></article>''')
    title=e(p.get('mediaTitle','Campaign moments'))
    intro=e(p.get('mediaIntro','Films and updates from the campaign. Select a card to open the original post on Instagram.'))
    note=f'<p class="visual-source-note">{e(p["mediaNote"])}</p>' if p.get('mediaNote') else ''
    return f'<section class="campaign-media" aria-labelledby="campaign-media-title"><h2 id="campaign-media-title">{title}</h2><p class="campaign-media-intro">{intro}</p><div class="campaign-media-grid">'+''.join(cards)+f'</div>{note}</section>'

def website_visuals(p):
    if not p.get('visuals'):
        return ''
    frames=[]
    for item in p['visuals']:
        frames.append(f'<figure class="website-visual website-visual-{e(item["label"].lower())}"><div class="website-visual-frame"><p class="website-visual-label">{e(item["label"])}</p><img src="../assets/images/projects/{e(item["image"])}" alt="{e(item["alt"])}" width="{item["width"]}" height="{item["height"]}" loading="lazy" decoding="async"></div><figcaption>{e(item["caption"])}</figcaption></figure>')
    return f'<section class="website-visuals" aria-labelledby="website-visuals-title"><h2 id="website-visuals-title">Designed across screens</h2><p class="campaign-media-intro">{e(p["visualIntro"])}</p><div class="website-visual-grid">'+''.join(frames)+'</div></section>'

def campaign_metrics(p):
    if not p.get('metrics'):
        return ''
    cards=[]
    for item in p['metrics']:
        source=f'<a href="{e(item["source_url"])}" target="_blank" rel="noopener noreferrer">{e(item["source_label"])} ↗</a>' if item.get('source_url') else f'<p class="campaign-results-source">{e(item["source_label"])}</p>'
        cards.append(f'<div><dt>{e(item["label"])}</dt><dd><strong>{e(item["value"])}</strong><p>{e(item["scope"])}</p>{source}</dd></div>')
    return '<section class="campaign-results" aria-labelledby="campaign-results-title"><h2 id="campaign-results-title">Reported figures</h2><dl class="campaign-results-grid">'+''.join(cards)+'</dl></section>'

def case_page(p):
    updated = bool(p.get('media') or p.get('visuals'))
    favicon = '<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">' if updated else ''
    cache_version = '?v=20261011' if updated else ''
    focus_target = ' tabindex="-1"' if updated else ''
    links = ''.join(f'<a class="outline-btn" href="{e(url)}" target="_blank" rel="noopener noreferrer">{e(label)} <span aria-hidden="true">↗</span></a>' for label,url in p.get('links',[]))
    sections = [('Context',p['summary']),('Problem',p['problem']),('Idea / Thinking',p['thinking']),('My Role',p['role']),('What I Built / Did',p['built']),('Output',p['output']),('Evidence',p['evidence']),('Status',p['status'])]
    # Do not fabricate a first-person retrospective when none has been supplied.
    if p.get('learning'):
        sections.append(('What I Learned',p['learning']))
    else:
        sections.append(('Learning / Next question',p['question']))
    body=''.join(f'<section id="section-{i}" class="case-section"><h2><span>{i:02}</span> {e(title)}</h2><p>{e(text)}</p></section>' for i,(title,text) in enumerate(sections,1))
    flow=''
    if p['id']=='content-engine':
        flow='<ol class="content-flow" aria-label="Article to discovery workflow">'+''.join(f'<li>{e(x)}</li>' for x in ['Article','Insight','Social concept','Creative','CTA','Paid support, where relevant','FindYello'])+'</ol>'
        body=body.replace('</section>',flow+'</section>',1)
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(p['title'])} | Kyle Hector</title><meta name="description" content="{e(p['summary'])}">
{favicon}<link rel="stylesheet" href="../assets/css/styles.css"><link rel="stylesheet" href="../assets/css/portfolio.css{cache_version}"></head>
<body class="case-page"><a class="skip-link" href="#main">Skip to case study</a>
<header class="case-navigation"><a href="../index.html#portfolio">← Selected Work</a><a href="../index.html#contact">Contact Kyle</a></header>
<main id="main"{focus_target}><header class="case-hero"><p class="eyebrow">{e(p['discipline'])} / <span class="maturity">{e(p['label'])}</span></p><h1>{e(p['title'])}</h1><p class="case-deck">{e(p['subtitle'])}</p><div class="project-links">{links}</div></header>
<figure class="case-cover">{picture(p,'../') if not p.get('media') and not p.get('visuals') else ''}</figure>{campaign_media(p)}{website_visuals(p)}{campaign_metrics(p)}<div class="case-narrative">{body}</div>
<footer class="case-bottom"><p>Explore the rest of my work.</p><a class="cta-btn" href="../index.html#portfolio">Back to Selected Work</a></footer></main></body></html>'''

def main():
    data=json.loads(DATA.read_text(encoding='utf-8'))
    index=ROOT/'index.html'
    text=index.read_text(encoding='utf-8')
    for group in ['selected','independent']:
        cards='\n'.join(card(p) for p in data if p['group']==group)
        start=f'<!-- {group.upper()} PROJECTS START -->'
        end=f'<!-- {group.upper()} PROJECTS END -->'
        a=text.index(start)+len(start); b=text.index(end)
        text=text[:a]+'\n'+cards+'\n'+text[b:]
    index.write_text(text,encoding='utf-8')
    (ROOT/'work').mkdir(exist_ok=True)
    for project in data:
        (ROOT/'work'/f'{project["id"]}.html').write_text(case_page(project),encoding='utf-8')
    print(f'Built {len(data)} project pages and homepage cards.')

if __name__=='__main__':
    main()
