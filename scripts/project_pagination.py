"""Static, reciprocal project links in the same order as the homepage."""
from html import escape
from html.parser import HTMLParser
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
STYLESHEET = '<link rel="stylesheet" href="assets/detail/project-pagination.css?v=20261106-violet">'


class ProjectCards(HTMLParser):
    def __init__(self):
        super().__init__()
        self.projects = []
        self.card = None
        self.heading = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'article' and 'project-card' in attrs.get('class', '').split():
            self.card = {'href': '', 'title': ''}
        if self.card is not None:
            if tag == 'a':
                self.card['href'] = attrs.get('href', '')
            if tag in ('h2', 'h3'):
                self.heading = True

    def handle_data(self, text):
        if self.heading and self.card is not None:
            self.card['title'] += text

    def handle_endtag(self, tag):
        if tag in ('h2', 'h3'):
            self.heading = False
        if tag == 'article' and self.card is not None:
            if self.card['href'].startswith('project-') and self.card['title'].strip():
                self.card['title'] = self.card['title'].strip()
                self.projects.append(self.card)
            self.card = None


def project_order():
    parser = ProjectCards()
    parser.feed((ROOT / 'index.html').read_text())
    projects = parser.projects
    # Include new document cases before their homepage cards are rebuilt.
    known = {project['href'] for project in projects}
    for case in json.loads((ROOT / 'assets/portfolio/projects.json').read_text()):
        href = f'project-{case["id"]}.html'
        if href not in known:
            projects.append({'href': href, 'title': case['title']})
            known.add(href)
    return projects


def render_pager(filename):
    projects = project_order()
    index = next(i for i, project in enumerate(projects) if project['href'] == filename)
    links = []
    for direction, offset, label in (('prev', -1, '上一篇'), ('next', 1, '下一篇')):
        project = projects[(index + offset) % len(projects)]
        title, href = escape(project['title'], quote=True), escape(project['href'], quote=True)
        arrow = f'<img class="project-pagination__arrow" src="assets/detail/pagination/arrow-{"left" if direction == "prev" else "right"}.svg" alt="" aria-hidden="true">'
        name = f'<span class="project-pagination__title">{title}</span>'
        body = arrow + name if direction == 'prev' else name + arrow
        links.append(f'<a class="project-pagination__link project-pagination__link--{direction}" href="{href}" rel="{direction}" aria-label="{label}：{title}"><span class="project-pagination__label">{label}</span><span class="project-pagination__body">{body}</span></a>')
    return '<nav class="project-pagination" id="project-pagination" aria-label="项目翻页"><div class="project-pagination__rule" aria-hidden="true"><img src="assets/detail/pagination/divider.svg" alt=""></div><div class="project-pagination__links">' + ''.join(links) + '</div></nav>'


def update_page(filename):
    path = ROOT / filename
    html = path.read_text()
    if 'assets/detail/project-pagination.css' not in html:
        html = html.replace('</head>', STYLESHEET + '</head>', 1)
    html = re.sub(r'<footer class="case-footer">.*?</footer>', '', html, flags=re.S)
    html = re.sub(r'<nav class="project-pagination".*?</nav>', '', html, flags=re.S)
    html = html.replace('</main>', render_pager(filename) + '</main>', 1)
    path.write_text(html)


if __name__ == '__main__':
    for project in project_order():
        update_page(project['href'])
