(() => {
  const dialog = document.querySelector('.update-gallery-dialog');
  const triggers = [...document.querySelectorAll('.update-gallery-trigger')];
  if (!dialog?.showModal || !triggers.length) return;

  const fullImage = dialog.querySelector('.update-gallery-full-image');
  const caption = dialog.querySelector('.update-gallery-caption');
  const count = dialog.querySelector('.update-gallery-count');
  const closeButton = dialog.querySelector('.update-gallery-close');
  const previousButton = dialog.querySelector('.update-gallery-previous');
  const nextButton = dialog.querySelector('.update-gallery-next');

  let activeIndex = 0;
  let activeTrigger = null;

  function showImage(index) {
    activeIndex = (index + triggers.length) % triggers.length;
    const trigger = triggers[activeIndex];
    const thumbnail = trigger.querySelector('img');
    const text = trigger.closest('figure')?.querySelector('figcaption')?.textContent.trim() || '';

    fullImage.src = thumbnail.currentSrc || thumbnail.src;
    fullImage.alt = thumbnail.alt;
    caption.textContent = text;
    count.textContent = `${activeIndex + 1} / ${triggers.length}`;

    const hasMultipleImages = triggers.length > 1;
    previousButton.hidden = !hasMultipleImages;
    nextButton.hidden = !hasMultipleImages;
  }

  function openGallery(index, trigger) {
    activeTrigger = trigger;
    showImage(index);
    dialog.showModal();
    closeButton.focus({ preventScroll: true });
  }

  function closeGallery() {
    if (dialog.open) dialog.close();
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => openGallery(index, trigger));
  });

  closeButton.addEventListener('click', closeGallery);
  previousButton.addEventListener('click', () => showImage(activeIndex - 1));
  nextButton.addEventListener('click', () => showImage(activeIndex + 1));

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeGallery();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' && triggers.length > 1) {
      event.preventDefault();
      showImage(activeIndex - 1);
    } else if (event.key === 'ArrowRight' && triggers.length > 1) {
      event.preventDefault();
      showImage(activeIndex + 1);
    }
  });

  dialog.addEventListener('close', () => {
    fullImage.removeAttribute('src');
    activeTrigger?.focus({ preventScroll: true });
    activeTrigger = null;
  });
})();
