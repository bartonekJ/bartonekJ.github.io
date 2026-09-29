(() => {
  const links = [...document.querySelectorAll('[data-product-view]')];
  const navLinks = [...document.querySelectorAll('[data-product-nav]')];
  const panels = {
    overview: document.getElementById('overview-panel'),
    features: document.getElementById('features-panel'),
  };

  if (!links.length || !panels.overview || !panels.features) return;

  function syncView() {
    if (location.hash === '#download') {
      location.replace('download/');
      return;
    }
    const view = location.hash === '#features' ? 'features' : 'overview';

    for (const link of links) {
      const active = link.dataset.productView === view;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }

    for (const link of navLinks) {
      if (link.dataset.productNav === view) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }

    panels.overview.hidden = view !== 'overview';
    panels.features.hidden = view !== 'features';

  }

  window.addEventListener('hashchange', syncView);
  syncView();
})();
