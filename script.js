document.getElementById("year").textContent = String(new Date().getFullYear());

(() => {
  const header = document.querySelector('.site-header');
  const nav = header?.querySelector('.site-nav');
  if (!header || !nav) return;

  const button = document.createElement('button');
  const navId = nav.id || 'site-navigation';
  nav.id = navId;
  button.className = 'site-nav-toggle';
  button.type = 'button';
  button.setAttribute('aria-controls', navId);
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', 'Open navigation');
  button.innerHTML = '<span class="site-nav-toggle-line"></span><span class="site-nav-toggle-line"></span><span class="site-nav-toggle-line"></span>';
  header.insertBefore(button, nav);
  header.classList.add('has-mobile-nav');

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }

  button.addEventListener('click', () => {
    setOpen(button.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || button.getAttribute('aria-expanded') !== 'true') return;
    setOpen(false);
    button.focus();
  });

  window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
})();
