(() => {
  const storageKey = 'bybartonek-google-ads-consent';

  function addConsentControls() {
    const footerLinks = document.querySelector('.site-footer .footer-links');
    if (footerLinks && !footerLinks.querySelector('[data-google-ads-consent-settings]')) {
      const settingsLink = document.createElement('a');
      settingsLink.href = '/privacy/#advertising-measurement';
      settingsLink.dataset.googleAdsConsentSettings = '';
      settingsLink.textContent = 'Privacy choices';
      footerLinks.insertBefore(settingsLink, footerLinks.querySelector('span'));
    }

    let banner = document.querySelector('.measurement-consent');
    if (!banner) {
      banner = document.createElement('aside');
      banner.className = 'measurement-consent';
      banner.hidden = true;
      banner.setAttribute('aria-labelledby', 'measurement-consent-title');
      banner.innerHTML = `
        <div>
          <strong id="measurement-consent-title">Optional advertising measurement</strong>
          <p>Allow Google Ads measurement so this visit and a later store click can be attributed to the campaign. The site works either way. <a href="/privacy/#advertising-measurement">Learn more</a></p>
        </div>
        <div class="measurement-consent-actions">
          <button class="button button-quiet" type="button" data-google-ads-consent="denied">Decline</button>
          <button class="button button-primary" type="button" data-google-ads-consent="granted">Allow measurement</button>
        </div>`;
      const footer = document.querySelector('.site-footer');
      document.body.insertBefore(banner, footer || null);
    }
    return banner;
  }

  const banner = addConsentControls();

  window.gtag_report_conversion = function gtagReportConversion(url) {
    const callback = function conversionCallback() {
      if (typeof url !== 'undefined') window.location = url;
    };
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: 'AW-18439118692/Uw6hCNDh5YwdEOS-uthE',
        value: 1.0,
        currency: 'CZK',
        event_callback: callback
      });
    }
    return false;
  };

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
      window.gtag_report_conversion();
    });
  });
})();
