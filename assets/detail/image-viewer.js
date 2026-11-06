(() => {
  const main = document.querySelector('main');
  if (!main) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'detail-image-viewer';
  dialog.setAttribute('aria-labelledby', 'detail-image-title');
  dialog.innerHTML = '<p class="detail-image-viewer__title" id="detail-image-title"></p><button class="detail-image-viewer__close" type="button" aria-label="关闭图片"><img src="assets/detail/image-close-fullscreen.svg" width="24" height="24" alt=""></button><div class="detail-image-viewer__media"></div>';
  document.body.append(dialog);
  const title = dialog.querySelector('.detail-image-viewer__title');
  const media = dialog.querySelector('.detail-image-viewer__media');
  const close = dialog.querySelector('.detail-image-viewer__close');
  let opener;

  // Load the original only on demand, keeping the page's small thumbnails fast.
  const fullSource = img => {
    if (img.dataset.zoomSrc) return img.dataset.zoomSrc;
    const candidates = (img.getAttribute('srcset') || '').split(',').map(item => {
      const [src, width] = item.trim().split(/\s+/);
      return {src, width: parseFloat(width) || 0};
    }).filter(item => item.src).sort((a, b) => b.width - a.width);
    return candidates[0]?.src || img.getAttribute('src');
  };
  const makeImage = (source, alt, preview) => {
    const img = new Image();
    img.className = 'detail-image-viewer__image';
    img.alt = alt;
    img.decoding = 'async';
    img.addEventListener('load', () => {
      if (img.naturalHeight) img.style.setProperty('--detail-image-ratio', img.naturalWidth / img.naturalHeight);
    });
    const thumbnail = preview?.currentSrc || preview?.getAttribute('src');
    if (preview?.naturalWidth && preview?.naturalHeight) {
      img.width = preview.naturalWidth;
      img.height = preview.naturalHeight;
      img.style.setProperty('--detail-image-ratio', preview.naturalWidth / preview.naturalHeight);
    }
    img.src = thumbnail || source;
    if (thumbnail && new URL(source,location.href).href !== new URL(thumbnail,location.href).href) {
      const original = new Image();
      original.decoding = 'async';
      original.onload = () => { if (img.isConnected) img.src = source; };
      original.src = source;
    }
    return img;
  };
  const show = (trigger, img, composite) => {
    if (dialog.open) return;
    opener = trigger;
    title.textContent = trigger.dataset.caption || (composite ? trigger.dataset.imageCaption : img.alt) || '查看配图';
    media.replaceChildren();
    if (composite) {
      const frame = document.createElement('div');
      frame.className = 'detail-image-viewer__composite';
      trigger.querySelectorAll('img').forEach(source => frame.append(makeImage(fullSource(source), '', source)));
      media.append(frame);
    } else {
      media.append(makeImage(trigger.dataset.zoomImage || fullSource(img), title.textContent, img));
    }
    dialog.showModal();
    media.scrollTo(0, 0);
    close.focus({preventScroll:true});
  };
  const bind = (trigger, img, composite = false) => {
    trigger.classList.add('detail-image-trigger');
    if (trigger.tagName !== 'BUTTON') {
      trigger.setAttribute('role', 'button');
      trigger.tabIndex = 0;
      trigger.addEventListener('keydown', event => {
        if (!['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        show(trigger, img, composite);
      });
    }
    const caption = trigger.dataset.caption || trigger.getAttribute('aria-label') || img?.alt || '查看配图';
    trigger.setAttribute('aria-label', caption.startsWith('放大查看') ? caption : `放大查看：${caption}`);
    trigger.setAttribute('aria-haspopup', 'dialog');
    let pointerStart;
    let dragged = false;
    trigger.addEventListener('pointerdown', event => {pointerStart = [event.clientX,event.clientY];dragged = false;});
    trigger.addEventListener('pointermove', event => {
      if (pointerStart && Math.hypot(event.clientX-pointerStart[0],event.clientY-pointerStart[1]) > 6) dragged = true;
    });
    trigger.addEventListener('pointercancel', () => {dragged = true;pointerStart = null;});
    trigger.addEventListener('click', event => {
      const moved = pointerStart && Math.hypot(event.clientX-pointerStart[0],event.clientY-pointerStart[1]) > 6;
      pointerStart = null;
      if (event.detail && (dragged || moved)) return;
      show(trigger, img, composite);
    });
  };
  main.querySelectorAll('[data-zoom-image],.figure-open').forEach(button => {
    const img = button.querySelector('img');
    if (img) bind(button,img);
  });
  main.querySelectorAll('.gallery-composite').forEach(group => {
    group.dataset.imageCaption = group.getAttribute('aria-label');
    bind(group,null,true);
  });
  main.querySelectorAll('img[alt]').forEach(img => {
    if (!img.alt.trim() || /\.svg(?:\?|$)/i.test(img.getAttribute('src')) || img.closest('button,a,[role="button"],.compare-stage,.video-cover,video,dialog')) return;
    bind(img,img);
  });
  close.addEventListener('click', () => dialog.close());
  // Close only when both press and release are on the surrounding empty canvas.
  let backdropPress = false;
  const onCanvas = event => event.target === dialog || event.target === media;
  dialog.addEventListener('pointerdown', event => {backdropPress = onCanvas(event);});
  dialog.addEventListener('click', event => {
    if (backdropPress && onCanvas(event)) dialog.close();
    backdropPress = false;
  });
  dialog.addEventListener('close', () => {
    media.replaceChildren();
    opener?.focus({preventScroll:true});
  });
})();
