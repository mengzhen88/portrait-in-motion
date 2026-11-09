(() => {
  const tabs = [...document.querySelectorAll('[data-pontus-tab]')];
  function select(index, focus = false) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tabs[index].focus({preventScroll:true});
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next === null) return;
      event.preventDefault(); select(next, true);
    });
  });
  // Load large animated originals only as their illustration approaches the viewport.
  const animations = [...document.querySelectorAll('img[data-animation-src]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const start = img => { if (!reduced.matches) img.src = img.dataset.animationSrc; };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      start(entry.target); observer.unobserve(entry.target);
    }), {rootMargin:'400px'});
    animations.forEach(img => observer.observe(img));
  } else animations.forEach(start);
})();
