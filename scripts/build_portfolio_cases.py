"""Build the document-based portfolio cases as ordinary static HTML pages."""
from html import escape
from pathlib import Path
import json
import re
import struct
from project_pagination import render_pager, STYLESHEET

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = json.loads((ROOT / 'assets/portfolio/projects.json').read_text())
VERSION = '20261104-project-library'


def esc(value):
    return escape(str(value), quote=True)


def asset(project, name):
    return f'assets/portfolio/{project["id"]}/{name}.png'


def dimensions(path):
    with (ROOT / path).open('rb') as image:
        header = image.read(24)
    return struct.unpack('>II', header[16:24])


def image(path, alt, eager=False, card_size=False):
    width, height = dimensions(path)
    thumb = str(Path(path).with_name(Path(path).stem + '-640.png'))
    sizes = '(max-width:760px) calc(100vw - 64px), 608px' if card_size else '(max-width:1144px) calc(100vw - 64px), 1080px'
    responsive = f' srcset="{esc(thumb)} 640w, {esc(path)} {width}w" sizes="{sizes}"' if (ROOT / thumb).exists() else ''
    return f'<img src="{esc(path)}"{responsive} width="{width}" height="{height}" alt="{esc(alt)}" decoding="async"' + (' fetchpriority="high"' if eager else ' loading="lazy"') + '>'


def card(project):
    template = project.get('homeCoverTemplate')
    cover = (ROOT / template).read_text().strip() if template else image(asset(project, project['cover']), project['title'], card_size=True)
    cover_class = 'research-cover' if template else 'portfolio-cover'
    return f'''<article class="project-card" data-categories="{project['category']}"><a href="project-{project['id']}.html" aria-label="查看{esc(project['title'])}案例详情"><div class="project-art {cover_class}" data-case-theme="{project['theme']}">{cover}</div><div class="project-copy"><h2>{esc(project['title'])}</h2><p>{esc(project['summary'])}</p></div></a></article>'''


def build_case(project):
    title = esc(project['title'])
    category_url = f'index.html?category={project["category"]}#projects'
    tags = ''.join(f'<span>{esc(t)}</span>' for t in project['tags'])
    goals = ''.join(f'<article><span class="goal-index">0{i}</span><h3>{esc(t)}</h3><p>{esc(p)}</p></article>' for i, (t, p) in enumerate(project['goals'], 1))
    process = ''.join(f'<li><span class="goal-index">0{i}</span><h3>{esc(t)}</h3><p>{esc(p)}</p></li>' for i, (t, p) in enumerate(project['process'], 1))
    figures = ''.join(f'<figure class="case-figure"><button type="button" data-zoom-image="{asset(project, name)}" data-caption="{esc(caption)}" aria-label="放大查看：{esc(caption)}">{image(asset(project, name), caption)}<span class="zoom-mark" aria-hidden="true">放大查看 ↗</span></button><figcaption>{esc(caption)}</figcaption></figure>' for name, caption in project['figures'])
    results = ''.join(f'<article><strong>{esc(value)}</strong><p>{esc(label)}</p></article>' for value, label in project['results'])
    related = project.get('related')
    related_link = f'<a class="case-related" href="{esc(related[0])}">{esc(related[1])} ↗</a>' if related else ''
    html = f'''<!doctype html>
<html lang="zh-CN" data-design-system="miaoda"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="{esc(project['summary'])}"><title>{title} · 邵梦贞</title><link rel="icon" type="image/png" sizes="32x32" href="assets/identity/favicon-32.png?v=20261105-headroom"><link rel="icon" type="image/png" sizes="64x64" href="assets/identity/favicon-64.png?v=20261105-headroom"><link rel="shortcut icon" href="favicon.ico?v=20261105-headroom"><link rel="apple-touch-icon" sizes="180x180" href="assets/identity/apple-touch-icon.png?v=20261105-headroom"><link rel="stylesheet" href="assets/design-system/tokens.css?v=20261106-violet"><link rel="stylesheet" href="assets/portfolio/cases.css?v=20261106-violet"><link rel="stylesheet" href="assets/detail/navigation.css?v=20261105-glass-52-type15"><link rel="stylesheet" href="assets/detail/reading-nav.css?v=20261106-violet">{STYLESHEET}<link rel="stylesheet" href="assets/detail/image-viewer.css?v=20261107-decoded-original"></head>
<body data-case-theme="{project['theme']}"><header class="detail-nav" aria-label="项目导航"><a class="back-link" href="{category_url}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 5-7 7 7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="nav-title">{esc(project['shortTitle'])}</span></a><div class="designer"><span>邵梦贞</span><span class="designer-role">产品设计师·7年设计经验</span></div></header>
<main class="portfolio-case"><section class="case-intro"><p class="case-kicker">{esc(project['eyebrow'])}</p><h1>{title}</h1><p class="case-lead">{esc(project['intro'])}</p><div class="case-tags">{tags}</div><figure class="case-hero">{image(asset(project, project['cover']), project['title']+'方案概览', True)}</figure><dl class="case-facts"><div><dt>项目方向</dt><dd>{project['categoryLabel']}</dd></div><div><dt>我的参与</dt><dd>{esc(project['involvement'])}</dd></div></dl><nav class="case-contents" aria-label="案例目录"><a href="#background">项目背景</a><a href="#process">设计过程</a><a href="#presentation">方案与产出</a><a href="#outcome">结果与反思</a></nav></section>
<section class="case-block" id="background"><h2>项目背景与目标</h2><p class="reading">{esc(project['background'])}</p><div class="case-goals">{goals}</div></section>
<section class="case-block" id="process"><h2>设计过程与关键判断</h2><ol class="case-process">{process}</ol></section>
<section class="case-block" id="presentation"><h2>方案与产出</h2><div class="case-gallery">{figures}</div></section>
<section class="case-block" id="outcome"><h2>项目结果</h2><div class="case-results">{results}</div><p class="result-note">{esc(project['resultNote'])}</p>{related_link}</section>
<section class="case-block" id="reflection"><h2>总结与思考</h2><p class="reading">{esc(project['reflection'])}</p></section>
{render_pager("project-" + project["id"] + ".html")}</main>
<script src="assets/detail/reading-nav.js?v=20261105-parent-chapter" defer></script><script src="assets/detail/image-viewer.js?v=20261107-decoded-original" defer></script></body></html>
'''
    (ROOT / f'project-{project["id"]}.html').write_text(html)


for project in PROJECTS:
    build_case(project)

home = ROOT / 'index.html'
html = home.read_text()
html = re.sub(r'<article class="project-card" data-categories="pending">.*?</article>', '', html, flags=re.S)
html = re.sub(r'<!-- document-projects:start -->.*?<!-- document-projects:end -->', '', html, flags=re.S)
new_cards = '<!-- document-projects:start -->' + ''.join(card(p) for p in PROJECTS) + '<!-- document-projects:end -->'
html = html.replace('</div><p class="empty-state"', new_cards + '</div><p class="empty-state"', 1)
if 'assets/portfolio/home-cards.css' not in html:
    html = html.replace('</head>', f'<link rel="stylesheet" href="assets/portfolio/home-cards.css?v={VERSION}"></head>', 1)
if any(p.get('homeCoverTemplate') for p in PROJECTS) and 'assets/portfolio/research-covers.css' not in html:
    html = html.replace('</head>', '<link rel="stylesheet" href="assets/portfolio/research-covers.css?v=20261107"></head>', 1)
home.write_text(html)
print(f'Built {len(PROJECTS)} project pages and filled homepage categories.')
