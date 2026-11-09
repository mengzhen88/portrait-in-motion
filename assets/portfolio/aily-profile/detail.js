(() => {
  'use strict';
  const section = document.querySelector('.profile-key-pages');
  if (!section) return;
  const tabs = [...section.querySelectorAll('[role="tab"]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const select = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tabs[index].focus({preventScroll: true});
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(next, true);
    });
  });
  section.querySelectorAll('.profile-key-panel').forEach(panel => {
    const gallery = panel.querySelector('.profile-key-gallery');
    const bar = panel.querySelector('.profile-gallery-scrollbar');
    gallery.addEventListener('keydown', event => {
      // Screenshot buttons keep their own keyboard activation and focus behavior.
      if (event.target !== gallery) return;
      let target;
      if (event.key === 'ArrowRight') target = gallery.scrollLeft + 338;
      else if (event.key === 'ArrowLeft') target = gallery.scrollLeft - 338;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = gallery.scrollWidth;
      else return;
      event.preventDefault();
      gallery.scrollTo({left: target, behavior: reduced.matches ? 'instant' : 'smooth'});
    });
    gallery.addEventListener('wheel', event => {
      if (!event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const max = gallery.scrollWidth - gallery.clientWidth;
      const target = Math.max(0, Math.min(max, gallery.scrollLeft + event.deltaY));
      if (target !== gallery.scrollLeft) {
        event.preventDefault();
        gallery.scrollLeft = target;
      }
    }, {passive: false});
    bar.addEventListener('input', () => {
      gallery.scrollLeft = Number(bar.value) / 1000 * (gallery.scrollWidth - gallery.clientWidth);
    });
    const syncBar = () => {
      const max = gallery.scrollWidth - gallery.clientWidth;
      bar.value = max > 0 ? String(Math.round(gallery.scrollLeft / max * 1000)) : '0';
    };
    gallery.addEventListener('scroll', syncBar, {passive: true});
    new ResizeObserver(syncBar).observe(gallery);
  });
})();
