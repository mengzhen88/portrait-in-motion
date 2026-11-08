/* Original GIF content, encoded as a controllable loop. No media fetch until interaction. */
(() => {
  const slots = document.querySelectorAll('[data-cover-video]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  slots.forEach(slot => {
    const cover = slot.closest('.project-art');
    const link = cover.closest('a');
    const video = slot.querySelector('video');
    let pointerInside = false;
    let keyboardFocus = false;
    let requested = false;
    video.muted = true;
    const stop = () => {
      requested = false;
      slot.classList.remove('is-playing');
      video.pause();
      if (video.readyState > 0) video.currentTime = 0;
    };
    const update = () => {
      if ((!pointerInside && !keyboardFocus) || reducedMotion.matches || document.hidden) {
        stop();
        return;
      }
      requested = true;
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      video.play().then(() => { if (!requested) stop(); }).catch(stop);
    };
    video.addEventListener('playing', () => {
      if (requested) slot.classList.add('is-playing');
      else stop();
    });
    video.addEventListener('error', stop);
    cover.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      pointerInside = true;
      update();
    });
    cover.addEventListener('pointerleave', () => { pointerInside = false; update(); });
    link.addEventListener('focus', () => { keyboardFocus = link.matches(':focus-visible'); update(); });
    link.addEventListener('blur', () => { keyboardFocus = false; update(); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { pointerInside = false; keyboardFocus = false; stop(); }
    });
    reducedMotion.addEventListener('change', update);
    // Stop when a filter hides this card or it scrolls out of view.
    new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) {
        pointerInside = false;
        keyboardFocus = false;
        stop();
      }
    }).observe(cover);
  });
})();
