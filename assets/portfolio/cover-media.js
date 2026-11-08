/* Native GIF playback for homepage covers; controllable video for detail heroes. */
(() => {
  document.querySelectorAll('.emr-detail-cover').forEach(cover => {
    const fit = () => cover.style.setProperty('--art-scale', cover.clientWidth / 704);
    new ResizeObserver(fit).observe(cover);
    fit();
  });
  // CSS controls visibility; restarting a real GIF avoids browser video-autoplay restrictions.
  document.querySelectorAll('[data-cover-gif]').forEach(slot => {
    const cover = slot.closest('.project-art');
    const link = cover.closest('a');
    const gif = slot.querySelector('.emr-media-gif,.cover-gif-animation');
    const source = gif.getAttribute('src');
    let pendingBlob;
    let preparedBlob;
    let objectUrl;
    let inside = false;
    let sequence = 0;
    const prepare = () => pendingBlob ||= fetch(source, { cache: 'force-cache' })
      .then(response => { if (!response.ok) throw new Error('GIF unavailable'); return response.blob(); })
      .then(blob => (preparedBlob = blob));
    const restart = () => {
      if (inside || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      inside = true;
      const request = ++sequence;
      const show = blob => {
        if (!inside || request !== sequence) return;
        const previous = objectUrl;
        objectUrl = URL.createObjectURL(blob);
        gif.src = objectUrl;
        if (previous) URL.revokeObjectURL(previous);
      };
      if (preparedBlob) show(preparedBlob);
      else prepare().then(show).catch(() => { pendingBlob = null; }); // Keep the normal GIF as fallback.
    };
    const leave = () => { inside = false; ++sequence; };
    cover.addEventListener('mouseenter', restart);
    cover.addEventListener('mouseleave', leave);
    link.addEventListener('focus', () => { if (link.matches(':focus-visible')) restart(); });
    link.addEventListener('blur', leave);
    const preload = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { prepare().catch(() => { pendingBlob = null; }); preload.disconnect(); }
    }, { rootMargin: '300px' });
    preload.observe(cover);
  });
  const slots = document.querySelectorAll('[data-cover-video]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  slots.forEach(slot => {
    const cover = slot.closest('.project-art,.emr-detail-cover');
    const link = cover.closest('a');
    const trigger = link || cover;
    const video = slot.querySelector('video');
    let pointerInside = false;
    let keyboardFocus = false;
    let requested = false;
    video.muted = true;
    const stop = () => {
      requested = false;
      slot.classList.remove('is-playing');
      if (!link) trigger.setAttribute('aria-pressed', 'false');
      video.pause();
      if (video.readyState > 0) video.currentTime = 0;
    };
    const update = () => {
      if ((!pointerInside && !keyboardFocus) || reducedMotion.matches || document.hidden) {
        stop();
        return;
      }
      requested = true;
      if (!link) trigger.setAttribute('aria-pressed', 'true');
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
    trigger.addEventListener('focus', () => { keyboardFocus = trigger.matches(':focus-visible'); update(); });
    trigger.addEventListener('blur', () => { keyboardFocus = false; update(); });
    if (!link) {
      const toggle = () => {
        pointerInside = false;
        keyboardFocus = !requested;
        update();
      };
      // A click arriving after pointerenter must keep playing, not cancel hover playback.
      trigger.addEventListener('click', () => { keyboardFocus = true; update(); });
      trigger.addEventListener('keydown', event => {
        if (!['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        toggle();
      });
    }
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
