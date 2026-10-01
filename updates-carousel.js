(() => {
  const root = document.querySelector('[data-updates-carousel]');
  if (!root || !root.classList.contains('is-carousel')) return;

  const viewport = root.querySelector('.home-updates-viewport');
  const track = root.querySelector('.home-updates-track');
  const previous = root.querySelector('[data-updates-previous]');
  const next = root.querySelector('[data-updates-next]');
  const dots = [...root.querySelectorAll('[data-updates-dot]')];
  const originals = [...track.children];
  const itemCount = originals.length;
  const cloneCount = Math.min(3, itemCount);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let position = cloneCount;
  let timer = 0;
  let paused = false;

  function prepareClone(node) {
    const clone = node.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.tabIndex = -1;
    return clone;
  }

  originals.slice(-cloneCount).reverse().forEach((item) => {
    track.prepend(prepareClone(item));
  });
  originals.slice(0, cloneCount).forEach((item) => {
    track.append(prepareClone(item));
  });

  function logicalIndex() {
    return ((position - cloneCount) % itemCount + itemCount) % itemCount;
  }

  function updateDots() {
    const active = logicalIndex();
    dots.forEach((dot, index) => {
      if (index === active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function updateCardAccess() {
    const active = logicalIndex();
    const visible = new Set([active, (active + 1) % itemCount, (active + 2) % itemCount]);
    originals.forEach((card, index) => {
      if (visible.has(index)) {
        card.removeAttribute('aria-hidden');
        card.tabIndex = 0;
      } else {
        card.setAttribute('aria-hidden', 'true');
        card.tabIndex = -1;
      }
    });
  }

  function updateVisibleEnd() {
    [...track.children].forEach((card) => card.classList.remove('is-visible-end'));
    track.children[position + 2]?.classList.add('is-visible-end');
  }

  function move(animate = true) {
    const target = track.children[position];
    if (!target) return;
    track.classList.toggle('is-jumping', !animate);
    track.style.transform = `translate3d(${-target.offsetLeft}px, 0, 0)`;
    updateDots();
    updateCardAccess();
    updateVisibleEnd();
  }

  function stopTimer() {
    window.clearInterval(timer);
    timer = 0;
  }

  function startTimer() {
    stopTimer();
    if (paused || reducedMotion.matches || document.hidden) return;
    timer = window.setInterval(() => {
      position += 1;
      move();
    }, 5000);
  }

  function goTo(index) {
    position = cloneCount + index;
    move();
    startTimer();
  }

  function setPaused(value) {
    paused = value;
    if (paused) stopTimer();
    else startTimer();
  }

  previous?.addEventListener('click', () => {
    position -= 1;
    move();
    startTimer();
  });

  next?.addEventListener('click', () => {
    position += 1;
    move();
    startTimer();
  });

  dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));

  track.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'transform') return;
    if (position >= cloneCount + itemCount) {
      position -= itemCount;
      move(false);
    } else if (position < cloneCount) {
      position += itemCount;
      move(false);
    }
  });

  root.addEventListener('mouseenter', () => setPaused(true));
  root.addEventListener('mouseleave', () => setPaused(false));
  root.addEventListener('focusin', () => setPaused(true));
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget)) setPaused(false);
  });
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    position += event.key === 'ArrowRight' ? 1 : -1;
    move();
    startTimer();
  });

  reducedMotion.addEventListener('change', startTimer);
  document.addEventListener('visibilitychange', startTimer);
  window.addEventListener('resize', () => move(false));

  requestAnimationFrame(() => {
    move(false);
    startTimer();
  });
})();
