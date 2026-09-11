const initAboutPageEffects = () => {
  const page = document.body;
  const hero = document.querySelector(".about-hero, .hero");
  const teamImage = document.querySelector(".about-team-image");
  const mobileLayout = window.matchMedia("(max-width: 760px)").matches;
  const newRevealItems = [...document.querySelectorAll(
    mobileLayout
      ? ".about-people-inner > h2, .about-person, .about-contact-cta-card"
      : ".about-people-inner > h2, .about-person, .about-contact-cta-card .contact-copy, .about-contact-cta-card .contact-actions"
  )];
  const revealItems = [
    ...document.querySelectorAll(".about-stat"),
    ...document.querySelectorAll(".about-stats-divider"),
    document.querySelector(".about-origin-intro"),
    document.querySelector(".about-origin-statement"),
    ...document.querySelectorAll(".about-story-label"),
    ...document.querySelectorAll(".about-story-content"),
    ...document.querySelectorAll(".about-story-divider"),
    document.querySelector(".about-clients-inner > h2"),
    ...document.querySelectorAll(".about-client-card"),
    ...newRevealItems,
  ].filter(Boolean);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".about-client-card").forEach((card, index) => {
    card.style.setProperty("--client-reveal-delay", `${(index % 3) * 90}ms`);
  });

  if (!page.classList.contains("about-page") || !hero) return;

  newRevealItems.forEach((item) => item.classList.add("about-scroll-reveal"));
  document.querySelectorAll(".about-people-grid").forEach((grid) => {
    const columns = window.getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    [...grid.children].forEach((card, index) => {
      card.style.setProperty("--about-reveal-delay", `${(index % columns) * 90}ms`);
    });
  });

  page.classList.add("about-effects-ready");

  const showEverything = () => {
    page.classList.add("about-effects-loaded");
    teamImage?.classList.add("is-visible");
    revealItems.forEach((item) => item.classList.add("is-visible"));
  };

  if (reduceMotion || !("IntersectionObserver" in window)) {
    showEverything();
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => page.classList.add("about-effects-loaded"));
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.16 },
  );

  if (teamImage) revealObserver.observe(teamImage);
  revealItems.forEach((item) => revealObserver.observe(item));

  if (!teamImage) return;

  let parallaxFrame = 0;

  const updateTeamParallax = () => {
    parallaxFrame = 0;
    const rect = teamImage.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    const offset = (0.5 - clampedProgress) * 72;
    teamImage.style.setProperty("--about-team-parallax", `${offset.toFixed(2)}px`);
  };

  const requestTeamParallax = () => {
    if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateTeamParallax);
  };

  updateTeamParallax();
  window.addEventListener("scroll", requestTeamParallax, { passive: true });
  window.addEventListener("resize", requestTeamParallax);
};

initAboutPageEffects();
