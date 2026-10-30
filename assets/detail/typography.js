// Reduce detail-page text by two CSS pixels; never render below 12px.
(() => {
  const managed = new Set(typeof readableTypeRecords !== 'undefined' ? readableTypeRecords.map(record => record.element) : []);
  const records = [...document.body.querySelectorAll('*')].filter(element =>
    !managed.has(element) && !element.closest('script,style,svg,.creation-window-return') &&
    [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
  ).map(element => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
  function update() {
    records.forEach(({element, size}) => {
      let zoom = 1;
      for (let parent = element; parent && parent !== document.body; parent = parent.parentElement) {
        zoom *= Number(getComputedStyle(parent).zoom) || 1;
      }
      // Artwork zoom affects its text too. Keep the minimum legible on narrow screens.
      element.style.setProperty('font-size', Math.max(12, size * zoom - 2) / zoom + 'px', 'important');
    });
  }
  update();
  new ResizeObserver(update).observe(document.body);
})();
