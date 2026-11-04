const imageDialog = document.querySelector('.case-image-dialog');
if (imageDialog) {
  const preview = imageDialog.querySelector('img');
  const caption = imageDialog.querySelector('#image-dialog-title');
  document.querySelectorAll('[data-zoom-image]').forEach(button => {
    button.addEventListener('click', () => {
      preview.src = button.dataset.zoomImage;
      preview.alt = button.dataset.caption;
      caption.textContent = button.dataset.caption;
      imageDialog.showModal();
      imageDialog.querySelector('.image-dialog-scroll').scrollTo(0, 0);
    });
  });
  imageDialog.querySelector('[data-close-image]').addEventListener('click', () => imageDialog.close());
  imageDialog.addEventListener('click', event => {
    if (event.target !== imageDialog) return;
    const rect = imageDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) imageDialog.close();
  });
}
