(() => {
  const storageKey = 'bybartonek-google-ads-consent';
  const banner = document.querySelector('.measurement-consent');

  function readChoice() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function storeChoice(choice) {
    try {
      localStorage.setItem(storageKey, choice);
    } catch (error) {
      // The current page still observes the choice when storage is unavailable.
    }
  }

  function updateConsent(choice) {
    if (typeof window.gtag !== 'function') return;
    const state = choice === 'granted' ? 'granted' : 'denied';
    window.gtag('consent', 'update', {
      ad_storage: state,
      analytics_storage: state,
      ad_user_data: state,
      ad_personalization: state
    });
  }

  function setBannerVisible(visible) {
    if (!banner) return;
    banner.hidden = !visible;
    if (visible) banner.querySelector('[data-google-ads-consent="granted"]')?.focus();
  }

  if (!readChoice()) setBannerVisible(true);

  banner?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-google-ads-consent]');
    if (!button) return;
    const choice = button.dataset.googleAdsConsent;
    storeChoice(choice);
    updateConsent(choice);
    setBannerVisible(false);
  });

  document.querySelectorAll('[data-google-ads-consent-settings]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setBannerVisible(true);
    });
  });

  document.querySelectorAll('[data-google-ads-conversion="store-outbound"]').forEach((link) => {
    link.addEventListener('click', () => {
      if (typeof window.gtag !== 'function') return;
      window.gtag('event', 'conversion', {
        send_to: 'AW-18439118692/Uw6hCNDh5YwdEOS-uthE',
        value: 1.0,
        currency: 'CZK'
      });
    });
  });
})();
