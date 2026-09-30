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
  const mobileViewport = window.matchMedia('(max-width: 760px)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');

  let activeCard = null;
  let openingAnimation = null;
  let closing = false;
  let mobileFullscreenSession = false;

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

  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function shouldUseMobileFullscreen() {
    const shortScreenEdge = Math.min(window.screen.width || innerWidth, window.screen.height || innerHeight);
    return mobileViewport.matches || (coarsePointer.matches && shortScreenEdge <= 760);
  }

  function unlockOrientation() {
    try {
      window.screen.orientation?.unlock?.();
    } catch {
      // Orientation locking is optional and browser-dependent.
    }
  }

  async function lockLandscape() {
    try {
      await window.screen.orientation?.lock?.('landscape');
    } catch {
      // Fullscreen still works when orientation locking is unavailable.
    }
  }

  function enterNativeVideoFullscreen() {
    if (typeof video.webkitEnterFullscreen !== 'function') return;
    video.controls = true;
    video.playsInline = false;
    try {
      video.webkitEnterFullscreen?.();
    } catch {
      // Keep the normal modal as a final fallback.
    }
  }

  function enterMobileFullscreen() {
    mobileFullscreenSession = true;
    dialog.classList.add('is-mobile-playback');

    const requestFullscreen = dialog.requestFullscreen || dialog.webkitRequestFullscreen;
    if (!requestFullscreen) {
      enterNativeVideoFullscreen();
      return;
    }

    try {
      const request = requestFullscreen.call(dialog, { navigationUI: 'hide' });
      Promise.resolve(request).then(lockLandscape).catch(() => {
        // The full-viewport dialog remains usable if browser fullscreen is denied.
      });
    } catch {
      // The full-viewport dialog remains usable if browser fullscreen is denied.
    }
  }

  async function leaveMobileFullscreen() {
    unlockOrientation();

    if (video.webkitDisplayingFullscreen) {
      try {
        video.webkitExitFullscreen?.();
      } catch {
        // The native player may already be closing itself.
      }
    }

    if (fullscreenElement() === dialog) {
      const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
      try {
        await exitFullscreen?.call(document);
      } catch {
        // Continue closing the dialog if fullscreen has already ended.
      }
    }

    dialog.classList.remove('is-mobile-playback');
    video.controls = false;
    video.playsInline = true;
    mobileFullscreenSession = false;
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
    const useMobileFullscreen = shouldUseMobileFullscreen();
    if (useMobileFullscreen) {
      enterMobileFullscreen();
      playButton.focus({ preventScroll: true });
    } else {
      closeButton.focus({ preventScroll: true });
    }

    if (!useMobileFullscreen && !reducedMotion.matches) {
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
    const wasMobileFullscreen = mobileFullscreenSession;
    video.pause();
    openingAnimation?.cancel();
    openingAnimation = null;
    if (wasMobileFullscreen) await leaveMobileFullscreen();

    if (activeCard && !wasMobileFullscreen && !reducedMotion.matches) {
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
  document.addEventListener('fullscreenchange', () => {
    if (mobileFullscreenSession && !fullscreenElement() && dialog.open && !closing) closeCard();
  });
  document.addEventListener('webkitfullscreenchange', () => {
    if (mobileFullscreenSession && !fullscreenElement() && dialog.open && !closing) closeCard();
  });
  video.addEventListener('webkitendfullscreen', () => {
    if (mobileFullscreenSession && dialog.open && !closing) closeCard();
  });
  dialog.addEventListener('close', () => {
    unlockOrientation();
    dialog.classList.remove('is-mobile-playback');
    video.controls = false;
    video.playsInline = true;
    mobileFullscreenSession = false;
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
