/* Native GIF playback for homepage covers; controllable video for detail heroes. */
(() => {
  // Round the moving product panel, preserving the GIF's transparent canvas and annotations.
  const roundProfilePanel = (slot, gif) => {
    if (!slot.classList.contains('aily-profile-media')) return null;
    const poster = slot.querySelector('.cover-gif-poster');
    const positions = [[0,360],[3360,359.5],[3400,357.5],[3440,354],[3480,347.5],[3520,336.5],[3560,321.5],[3600,300.5],[3640,276],[3680,257],[3720,243],[3760,233.5],[3800,227.5],[3840,224],[3880,222.5]];
    const masks = new Map();
    let frame = 0;
    let started = 0;
    const apply = (image, left) => {
      const width = image.getBoundingClientRect().width;
      if (!width) return;
      const radius = +(6.8 * 1920 / width).toFixed(3);
      const key = `${left}:${radius}`;
      if (!masks.has(key)) {
        const x = left, y = 140, right = x + 1200, bottom = 940, r = radius;
        const square = `M${x} ${y}H${right}V${bottom}H${x}Z`;
        const rounded = `M${x+r} ${y}H${right-r}A${r} ${r} 0 0 1 ${right} ${y+r}V${bottom-r}A${r} ${r} 0 0 1 ${right-r} ${bottom}H${x+r}A${r} ${r} 0 0 1 ${x} ${bottom-r}V${y+r}A${r} ${r} 0 0 1 ${x+r} ${y}Z`;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><path fill="white" fill-rule="evenodd" d="M0 0H1920V1080H0Z ${square} ${rounded}"/></svg>`;
        masks.set(key, `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
      }
      image.style.setProperty('--profile-interface-mask', masks.get(key));
    };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; };
    const tick = () => {
      const elapsed = (performance.now() - started) % 6000;
      let left = 360;
      for (const [time, x] of positions) { if (elapsed < time) break; left = x; }
      apply(gif, left);
      frame = requestAnimationFrame(tick);
    };
    const start = () => { stop(); started = performance.now(); tick(); };
    const fit = () => { apply(poster, 360); if (!frame) apply(gif, 360); };
    const observer = new ResizeObserver(fit);
    observer.observe(slot);
    const cover = slot.closest('.project-art');
    if (cover) observer.observe(cover);
    fit();
    return {start, stop};
  };
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
    const rounding = roundProfilePanel(slot, gif);
    const source = gif.getAttribute('src');
    let pendingBlob;
    let preparedBlob;
    let objectUrl;
    let inside = false;
    let sequence = 0;
    gif.addEventListener('load', () => { if (inside) rounding?.start(); });
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
    const leave = () => { inside = false; ++sequence; rounding?.stop(); };
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
