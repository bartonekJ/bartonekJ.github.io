(() => {
  const dialog = document.querySelector('.overview-video-dialog');
  const cards = [...document.querySelectorAll('.overview-preview-trigger, .feature-catalog-card[data-video-mp4]')];
  if (!dialog?.showModal || !cards.length) return;

  const title = dialog.querySelector('#overview-video-title');
  const closeButton = dialog.querySelector('.overview-video-close');
  const video = dialog.querySelector('.overview-video-media');
  const webmSource = video.querySelector('source[type="video/webm"]');
  const mp4Source = video.querySelector('source[type="video/mp4"]');
  const playButton = dialog.querySelector('.overview-video-toggle');
  const progress = dialog.querySelector('.overview-video-progress');
  const time = dialog.querySelector('.overview-video-time');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let activeCard = null;
  let openingAnimation = null;
  let closing = false;

  function cardRoot(card) {
    return card.closest('.overview-preview-card, .feature-catalog-card');
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    const whole = Math.floor(seconds);
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
  }

  function updateControls() {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    playButton.textContent = video.paused ? '▶' : '❚❚';
    playButton.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
    progress.disabled = duration <= 0;
    progress.max = String(duration || 1);
    progress.value = String(Math.min(video.currentTime || 0, duration || 1));
    time.textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`;
  }

  function transformFromCard(cardRect) {
    const playerRect = dialog.getBoundingClientRect();
    const cardX = cardRect.left + cardRect.width / 2;
    const cardY = cardRect.top + cardRect.height / 2;
    const playerX = playerRect.left + playerRect.width / 2;
    const playerY = playerRect.top + playerRect.height / 2;
    const scaleX = Math.max(0.1, cardRect.width / playerRect.width);
    const scaleY = Math.max(0.1, cardRect.height / playerRect.height);
    return `translate(${cardX - playerX}px, ${cardY - playerY}px) scale(${scaleX}, ${scaleY})`;
  }

  function openCard(event) {
    event.preventDefault();
    if (dialog.open || closing) return;

    activeCard = event.currentTarget;
    const root = cardRoot(activeCard);
    const cardRect = root.getBoundingClientRect();
    title.textContent = activeCard.querySelector('.overview-preview-title, h5').textContent;
    const poster = activeCard.querySelector('img');
    if (poster) video.poster = poster.src;
    else video.removeAttribute('poster');
    const webmUrl = activeCard.dataset.videoWebm;
    const mp4Url = activeCard.dataset.videoMp4 || activeCard.href;
    if (webmUrl) webmSource.src = webmUrl;
    else webmSource.removeAttribute('src');
    if (mp4Url) mp4Source.src = mp4Url;
    else mp4Source.removeAttribute('src');
    video.load();
    updateControls();

    dialog.showModal();
    closeButton.focus({ preventScroll: true });

    if (!reducedMotion.matches) {
      openingAnimation = dialog.animate(
        [{ transform: transformFromCard(cardRect), opacity: 0.7 }, { transform: 'none', opacity: 1 }],
        { duration: 260, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'both' },
      );
      openingAnimation.finished.then(() => openingAnimation?.cancel()).catch(() => {});
    }

    video.play().catch(updateControls);
  }

  async function closeCard() {
    if (!dialog.open || closing) return;
    closing = true;
    video.pause();
    openingAnimation?.cancel();
    openingAnimation = null;

    if (activeCard && !reducedMotion.matches) {
      const cardRect = cardRoot(activeCard).getBoundingClientRect();
      const animation = dialog.animate(
        [{ transform: 'none', opacity: 1 }, { transform: transformFromCard(cardRect), opacity: 0.7 }],
        { duration: 220, easing: 'cubic-bezier(0.4, 0, 0.8, 0.2)', fill: 'forwards' },
      );
      try {
        await animation.finished;
      } catch {
        // Closing still completes if the animation is interrupted.
      }
      dialog.close();
      animation.cancel();
    } else {
      dialog.close();
    }
  }

  function togglePlayback() {
    if (video.paused) {
      if (video.ended) video.currentTime = 0;
      video.play().catch(updateControls);
    } else {
      video.pause();
    }
  }

  for (const card of cards) {
    card.addEventListener('click', openCard);
    if (card.matches('.feature-catalog-card')) {
      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        card.click();
      });
    }
  }
  closeButton.addEventListener('click', closeCard);
  playButton.addEventListener('click', togglePlayback);
  video.addEventListener('click', togglePlayback);
  video.addEventListener('ended', closeCard);
  for (const eventName of ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'seeked']) {
    video.addEventListener(eventName, updateControls);
  }
  progress.addEventListener('input', () => {
    if (!progress.disabled) video.currentTime = Number(progress.value);
    updateControls();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeCard();
  });
  dialog.addEventListener('close', () => {
    video.pause();
    webmSource.removeAttribute('src');
    mp4Source.removeAttribute('src');
    video.removeAttribute('poster');
    video.load();
    updateControls();
    activeCard?.focus({ preventScroll: true });
    activeCard = null;
    closing = false;
  });
})();
