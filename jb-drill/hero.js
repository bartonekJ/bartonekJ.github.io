(() => {
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) return;

  const videos = Array.from(carousel.querySelectorAll(".jb-hero-video"));
  const segments = Array.from(carousel.querySelectorAll(".jb-hero-segment"));
  const label = carousel.querySelector(".jb-hero-slide-label");
  const previous = carousel.querySelector("[data-hero-previous]");
  const next = carousel.querySelector("[data-hero-next]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const shots = segments.map((segment) => ({
    webm: segment.dataset.webm,
    mp4: segment.dataset.mp4,
    label: segment.dataset.label,
  }));

  let activeVideoIndex = 0;
  let activeShotIndex = 0;
  let transitionToken = 0;
  let isVisible = true;
  let frameRequest = 0;

  const normalizeIndex = (index) => (index + shots.length) % shots.length;

  const setSource = (video, shotIndex, preload = "metadata") => {
    if (Number(video.dataset.shot) === shotIndex) {
      video.preload = preload;
      return;
    }

    video.pause();
    video.preload = preload;
    video.removeAttribute("src");
    video.replaceChildren();

    const webmSource = document.createElement("source");
    webmSource.src = shots[shotIndex].webm;
    webmSource.type = 'video/webm; codecs="av01.0.05M.08"';

    const mp4Source = document.createElement("source");
    mp4Source.src = shots[shotIndex].mp4;
    mp4Source.type = "video/mp4";

    video.append(webmSource, mp4Source);
    video.dataset.shot = String(shotIndex);
    video.load();
  };

  const waitForFrame = (video) => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const ready = () => {
        cleanup();
        resolve();
      };
      const failed = () => {
        cleanup();
        reject(new Error("Hero video could not be loaded."));
      };
      const cleanup = () => {
        video.removeEventListener("loadeddata", ready);
        video.removeEventListener("error", failed);
      };

      video.addEventListener("loadeddata", ready, { once: true });
      video.addEventListener("error", failed, { once: true });
    });
  };

  const updateInterface = () => {
    label.textContent = shots[activeShotIndex].label;
    segments.forEach((segment, index) => {
      const isActive = index === activeShotIndex;
      segment.classList.toggle("is-active", isActive);
      segment.setAttribute("aria-current", isActive ? "true" : "false");
      segment.style.setProperty("--shot-progress", "0");
    });
  };

  const updateProgress = () => {
    const activeVideo = videos[activeVideoIndex];
    const duration = activeVideo.duration;
    const progress = Number.isFinite(duration) && duration > 0
      ? Math.min(1, activeVideo.currentTime / duration)
      : 0;
    segments[activeShotIndex].style.setProperty("--shot-progress", String(progress));
    frameRequest = window.requestAnimationFrame(updateProgress);
  };

  const shouldPlay = () => !reduceMotion.matches && isVisible && !document.hidden;

  const playActiveVideo = async () => {
    if (!shouldPlay()) return;
    try {
      await videos[activeVideoIndex].play();
    } catch {
      // The first frame remains visible if a browser blocks autoplay.
    }
  };

  const prepareFollowingShot = () => {
    const standbyVideo = videos[1 - activeVideoIndex];
    setSource(standbyVideo, normalizeIndex(activeShotIndex + 1), "metadata");
  };

  const showShot = async (requestedIndex, userInitiated = false) => {
    const shotIndex = normalizeIndex(requestedIndex);
    const currentVideo = videos[activeVideoIndex];

    if (shotIndex === activeShotIndex) {
      currentVideo.currentTime = 0;
      segments[activeShotIndex].style.setProperty("--shot-progress", "0");
      if (userInitiated) await playActiveVideo();
      return;
    }

    const token = ++transitionToken;
    const incomingVideoIndex = 1 - activeVideoIndex;
    const incomingVideo = videos[incomingVideoIndex];
    setSource(incomingVideo, shotIndex, "auto");

    try {
      await waitForFrame(incomingVideo);
    } catch {
      return;
    }
    if (token !== transitionToken) return;

    incomingVideo.currentTime = 0;
    if (shouldPlay() || userInitiated) {
      try {
        await incomingVideo.play();
      } catch {
        // Manual navigation still reveals the available first frame.
      }
    }
    if (token !== transitionToken) return;

    currentVideo.classList.remove("is-active");
    currentVideo.classList.add("is-leaving");
    incomingVideo.classList.add("is-active");
    activeVideoIndex = incomingVideoIndex;
    activeShotIndex = shotIndex;
    updateInterface();

    window.setTimeout(() => {
      if (token !== transitionToken) return;
      currentVideo.pause();
      currentVideo.classList.remove("is-leaving");
      prepareFollowingShot();
    }, 340);
  };

  segments.forEach((segment, index) => {
    segment.addEventListener("click", () => showShot(index, true));
  });
  previous.addEventListener("click", () => showShot(activeShotIndex - 1, true));
  next.addEventListener("click", () => showShot(activeShotIndex + 1, true));

  videos.forEach((video) => {
    video.addEventListener("ended", () => {
      if (video === videos[activeVideoIndex]) showShot(activeShotIndex + 1);
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        playActiveVideo();
      } else {
        videos[activeVideoIndex].pause();
      }
    }, { threshold: 0.08 });
    observer.observe(carousel);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      videos[activeVideoIndex].pause();
    } else {
      playActiveVideo();
    }
  });

  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) {
      videos[activeVideoIndex].pause();
    } else {
      playActiveVideo();
    }
  });

  setSource(videos[0], 0, "auto");
  setSource(videos[1], 1, "metadata");
  updateInterface();
  waitForFrame(videos[0]).then(playActiveVideo).catch(() => {});
  frameRequest = window.requestAnimationFrame(updateProgress);

  window.addEventListener("pagehide", () => window.cancelAnimationFrame(frameRequest), { once: true });
})();
