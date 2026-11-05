/* Progressive enhancement: no scroll interception or third-party dependencies. */
(() => {
  'use strict';
  const main = document.querySelector('main');
  if (!main || document.querySelector('.case-reading-nav')) return;
  const sectionLabels = {
    'presentation-01': '01 降低理解和配置门槛',
    'presentation-02': '02 优化使用链路与体验',
    'presentation-03': '03 优化信息组织与操作',
    'usability-testing': '可用性测试',
    overview: '项目背景与目标', problem: '现状问题', design: '关键设计决策',
    management: '需求管理', review: '评审与发布', validation: '验证与反思',
    background: '项目背景与目标', process: '设计过程与判断',
    presentation: '方案与产出', outcome: '项目结果', reflection: '总结与思考'
  };
  const sections = [...main.querySelectorAll(':scope > section, :scope > .presentation-group')];
  if (sections.filter(section => !section.contains(main.querySelector('h1'))).length < 2) return;
  const intro = main.querySelector('.case-intro, h1');
  const entries = [];
  const add = (target, label, id) => {
    if (!target.id) {
      let unique = id, n = 2;
      while (document.getElementById(unique)) unique = `${id}-${n++}`;
      target.id = unique;
    }
    entries.push({ target, label });
  };
  if (intro) add(intro, '项目概览', 'case-overview');
  sections.forEach(section => {
    if (section === intro || section.contains(intro)) return;
    if (section.classList.contains('presentation-group')) {
      add(section, '设计方案', 'design-solution');
      return;
    }
    let label = sectionLabels[section.id];
    if (section.classList.contains('background')) label = '项目背景';
    if (section.classList.contains('discover')) label = '问题与设计目标';
    if (!label) label = section.querySelector('h2')?.textContent.trim();
    if (label) add(section, label, `case-section-${entries.length}`);
  });
  if (entries.length < 2) return;

  const nav = document.createElement('nav');
  nav.className = 'case-reading-nav';
  nav.setAttribute('aria-label', '作品章节导航');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'case-reading-toggle';
  toggle.setAttribute('aria-label', '展开作品目录');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'case-reading-list');
  const currentLabel = document.createElement('span');
  currentLabel.className = 'case-reading-toggle-label';
  const count = document.createElement('span');
  count.className = 'case-reading-toggle-count';
  toggle.append(currentLabel, count);
  const list = document.createElement('ul');
  list.id = 'case-reading-list';
  const links = entries.map(({ target, label }) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${target.id}`;
    link.setAttribute('aria-label', label);
    const mark = document.createElement('span');
    mark.className = 'case-reading-mark';
    mark.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.className = 'case-reading-label';
    text.textContent = label;
    link.append(mark, text); li.append(link); list.append(li);
    return link;
  });
  nav.append(toggle, list);
  const progress = document.createElement('div');
  progress.className = 'case-reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  const fill = document.createElement('span');
  progress.append(fill);
  document.body.append(nav, progress);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // A soft lens follows the pointer vertically, strongest at its center.
  let lensFrame = 0, pointerY = null;
  function resetLens() {
    pointerY = null;
    cancelAnimationFrame(lensFrame); lensFrame = 0;
    links.forEach(link => link.style.removeProperty('--case-lens'));
  }
  function renderLens() {
    lensFrame = 0;
    if (pointerY === null || reducedMotion.matches || document.documentElement.hasAttribute('data-case-reader-compact')) return;
    links.forEach(link => {
      const rect = link.getBoundingClientRect();
      const distance = rect.top + rect.height / 2 - pointerY;
      const influence = Math.exp(-(distance * distance) / (2 * 30 * 30));
      link.style.setProperty('--case-lens', influence.toFixed(4));
    });
  }
  function moveLens(event) {
    if (event.pointerType === 'touch') return;
    pointerY = event.clientY;
    if (!lensFrame) lensFrame = requestAnimationFrame(renderLens);
  }
  nav.addEventListener('pointerenter', moveLens);
  nav.addEventListener('pointermove', moveLens);
  nav.addEventListener('pointerleave', resetLens);
  let active = -1, frame = 0, jump = null;
  const headerHeight = () => document.querySelector('body > .detail-nav, body > .nav')?.getBoundingClientRect().height || 68;
  function setActive(index) {
    if (active === index) return;
    active = index;
    links.forEach((link, i) => i === index ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
    currentLabel.textContent = entries[index].label;
    count.textContent = `${index + 1} / ${entries.length}`;
  }
  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '展开作品目录');
  }
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '收起作品目录' : '展开作品目录');
  });
  function update() {
    frame = 0;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    fill.style.transform = `scaleX(${Math.max(0, Math.min(1, scrollY / max))})`;
    if (jump && performance.now() < jump.expires && Math.abs(scrollY - jump.top) > 2) return;
    jump = null;
    const threshold = Math.max(headerHeight() + 40, innerHeight * .22);
    let index = 0;
    entries.forEach(({ target }, i) => { if (target.getBoundingClientRect().top <= threshold) index = i; });
    if (max - scrollY < 2) index = entries.length - 1;
    setActive(index);
  }
  function scheduleUpdate() { if (!frame) frame = requestAnimationFrame(update); }
  links.forEach((link, index) => {
    link.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const target = entries[index].target;
      const track = target.querySelector('.creation-track, .ppt-track');
      const sticky = target.querySelector('.creation-sticky, .ppt-sticky');
      const pinned = target.classList.contains('is-pinned') && track && sticky;
      const offset = pinned ? parseFloat(getComputedStyle(sticky).top) : headerHeight() + 24;
      const y = scrollY + (pinned ? track : target).getBoundingClientRect().top - offset;
      const top = Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight));
      const url = new URL(location.href); url.hash = target.id;
      history.replaceState(history.state, '', url);
      setActive(index); closeMenu();
      jump = { top, expires: performance.now() + 1500 };
      window.scrollTo({ top, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    });
    link.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown') next = (index + 1) % links.length;
      else if (event.key === 'ArrowUp') next = (index + links.length - 1) % links.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = links.length - 1;
      else return;
      event.preventDefault(); links[next].focus();
    });
  });
  document.addEventListener('click', event => { if (!nav.contains(event.target)) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); toggle.focus(); }
    else if (['PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End', ' '].includes(event.key)) jump = null;
  });
  ['wheel', 'touchstart'].forEach(type => addEventListener(type, () => { jump = null; }, { passive: true }));
  addEventListener('scroll', scheduleUpdate, { passive: true });
  addEventListener('scrollend', () => { jump = null; scheduleUpdate(); });
  function layoutMode() {
    const railLeft = 24;
    const compact = innerWidth < 1200 || matchMedia('(hover: none)').matches || main.getBoundingClientRect().left < railLeft + 64;
    document.documentElement.toggleAttribute('data-case-reader-compact', compact);
    if (compact) resetLens();
    else if (pointerY !== null && !lensFrame) lensFrame = requestAnimationFrame(renderLens);
  }
  addEventListener('resize', () => { layoutMode(); scheduleUpdate(); }, { passive: true });
  addEventListener('hashchange', scheduleUpdate);
  addEventListener('pageshow', scheduleUpdate);
  new ResizeObserver(() => { layoutMode(); scheduleUpdate(); }).observe(main);
  layoutMode();
  update();
})();
