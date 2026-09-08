(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const items = document.querySelectorAll('.impact-wrap > h2, .impact-card, .about-contact-cta-card');
  document.querySelectorAll('.impact-grid').forEach((grid) => {
    const columns = window.getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    [...grid.children].forEach((card, index) => {
      card.style.setProperty('--impact-reveal-delay', `${(index % columns) * 90}ms`);
    });
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.16 });
  document.body.classList.add('impact-motion-ready');
  items.forEach((item) => { item.classList.add('impact-reveal'); observer.observe(item); });
})();
