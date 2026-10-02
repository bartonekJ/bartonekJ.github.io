(() => {
  const microsoftStoreLink = document.querySelector('[data-ms-store-link]');
  const webFallback = document.querySelector('[data-ms-store-web-fallback]');
  if (!microsoftStoreLink || !webFallback) return;

  const platform = navigator.userAgentData?.platform || navigator.platform || '';
  const isWindows = /^Win/i.test(platform) || /Windows/i.test(navigator.userAgent);
  if (!isWindows) return;

  microsoftStoreLink.href = microsoftStoreLink.dataset.msStoreAppUrl;
  microsoftStoreLink.removeAttribute('target');
  microsoftStoreLink.removeAttribute('rel');
  microsoftStoreLink.setAttribute('aria-label', 'Open JB_Drill in the Microsoft Store app');
  const label = microsoftStoreLink.querySelector('[data-ms-store-link-label]');
  if (label) label.textContent = 'Available now · Open Microsoft Store app ↗';
  webFallback.hidden = false;
})();
