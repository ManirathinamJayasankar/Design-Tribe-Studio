// Shared mobile navigation: retain the inline details menu if JavaScript is unavailable.
(() => {
  const fallback = document.querySelector('.home-mobile-menu');
  if (!fallback || !window.HTMLDialogElement) return;
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'home-mobile-menu mobile-menu-trigger';
  trigger.setAttribute('aria-label', 'Open navigation');
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'mobile-menu-sheet');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.append(fallback.querySelector('summary img').cloneNode(true));

  const sheet = document.createElement('dialog');
  sheet.id = 'mobile-menu-sheet';
  sheet.className = 'mobile-menu-sheet';
  sheet.setAttribute('aria-label', 'Navigation');
  sheet.setAttribute('data-lenis-prevent', '');
  sheet.innerHTML = `
    <header class="mobile-menu-header">
      <a href="/" aria-label="Design Tribe home"><img src="/assets/mobile-menu/logo.svg" alt="Design Tribe" width="110" height="24"></a>
      <button type="button" class="mobile-menu-close" aria-label="Close navigation" autofocus><img src="/assets/mobile-menu/close.svg" alt="" width="24" height="24"></button>
    </header>
    <nav class="mobile-sheet-links" aria-label="Mobile navigation"></nav>
    <footer class="mobile-menu-footer">
      <div class="mobile-menu-wordmark"><img src="/assets/mobile-home/footer-wordmark.svg" alt="Design Tribe" width="354" height="65"></div>
      <div class="mobile-menu-strip"><p>Build for modern business</p><p>@Design Tribe 2026</p></div>
    </footer>`;
  sheet.querySelector('nav').append(...[...fallback.querySelectorAll('nav a')].map(a => a.cloneNode(true)));
  fallback.replaceWith(trigger);
  document.body.append(sheet);
  const mobile = matchMedia('(max-width: 760px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let closing = false;
  let timer;
  let scrollTop = 0;
  let originalBodyStyle;

  function finishClose() {
    clearTimeout(timer);
    sheet.close();
  }
  function close() {
    if (!sheet.open || closing) return;
    closing = true;
    sheet.classList.add('is-closing');
    if (reducedMotion.matches) finishClose();
    else timer = setTimeout(finishClose, 300);
  }
  trigger.addEventListener('click', () => {
    if (!mobile.matches || sheet.open) return;
    scrollTop = window.scrollY;
    originalBodyStyle = document.body.getAttribute('style');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollTop}px`;
    document.body.style.width = '100%';
    document.documentElement.classList.add('mobile-menu-open');
    trigger.setAttribute('aria-expanded', 'true');
    sheet.showModal();
  });
  sheet.querySelector('.mobile-menu-close').addEventListener('click', close);
  sheet.addEventListener('cancel', event => { event.preventDefault(); close(); });
  sheet.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  sheet.addEventListener('close', () => {
    clearTimeout(timer);
    closing = false;
    sheet.classList.remove('is-closing');
    document.documentElement.classList.remove('mobile-menu-open');
    if (originalBodyStyle === null) document.body.removeAttribute('style');
    else document.body.setAttribute('style', originalBodyStyle);
    window.scrollTo({ top: scrollTop, behavior: 'instant' });
    trigger.setAttribute('aria-expanded', 'false');
    if (mobile.matches) trigger.focus({ preventScroll: true });
  });
  mobile.addEventListener('change', () => { if (!mobile.matches && sheet.open) finishClose(); });
  window.addEventListener('pagehide', () => { if (sheet.open) finishClose(); });
})();
