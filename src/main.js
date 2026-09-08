const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navigationEntry = window.performance?.getEntriesByType?.("navigation")?.[0];
const isHardReload = navigationEntry?.type === "reload";

const initPageCurtainTransition = () => {
  const curtain = document.querySelector("[data-page-curtain]");

  if (!curtain) return;

  const finishTransition = () => {
    curtain.classList.add("is-complete");
    curtain.setAttribute("aria-hidden", "true");
  };

  if (prefersReducedMotion) {
    finishTransition();
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => curtain.classList.add("is-revealing"));
  });

  curtain.lastElementChild?.addEventListener("transitionend", finishTransition, { once: true });
  window.setTimeout(finishTransition, 900);

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) finishTransition();
  });
};

initPageCurtainTransition();

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

if (isHardReload) {
  window.scrollTo(0, 0);
  window.addEventListener("load", () => {
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  });
}

const initContactFooterCover = () => {
  const contactSection = document.querySelector(".contact-section");
  const contactPanel = document.querySelector(".contact-panel");
  const contactFooterPanel = document.querySelector(".contact-footer");
  const desktopQuery = window.matchMedia("(min-width: 761px)");

  if (!contactSection || !contactPanel || !contactFooterPanel) return;

  const placeholder = document.createElement("div");
  placeholder.className = "contact-panel-placeholder";
  placeholder.setAttribute("aria-hidden", "true");
  contactPanel.before(placeholder);

  let panelWidth = 0;
  let panelLeft = 0;
  let panelHeight = 0;
  let panelMarginBottom = 0;
  let pinnedPanelTop = 0;
  let pinFrame = 0;
  let isPinned = false;

  const clearPin = () => {
    isPinned = false;
    contactPanel.classList.remove("is-contact-pinned");
    placeholder.style.height = "0px";
    contactPanel.style.removeProperty("--contact-pin-top");
    contactPanel.style.removeProperty("--contact-pin-left");
    contactPanel.style.removeProperty("--contact-pin-width");
  };

  const measureContactPanel = () => {
    clearPin();

    const rect = contactPanel.getBoundingClientRect();
    const styles = window.getComputedStyle(contactPanel);

    panelLeft = rect.left;
    panelWidth = rect.width;
    panelHeight = rect.height;
    panelMarginBottom = parseFloat(styles.marginBottom || "0");
  };

  const applyPin = () => {
    if (!isPinned) {
      pinnedPanelTop = window.innerHeight - panelHeight - panelMarginBottom;
      isPinned = true;
      placeholder.style.height = `${panelHeight + panelMarginBottom}px`;
      contactPanel.classList.add("is-contact-pinned");
    }

    contactPanel.style.setProperty("--contact-pin-top", `${pinnedPanelTop}px`);
    contactPanel.style.setProperty("--contact-pin-left", `${panelLeft}px`);
    contactPanel.style.setProperty("--contact-pin-width", `${panelWidth}px`);
  };

  const updateContactPin = () => {
    pinFrame = 0;

    if (!desktopQuery.matches) {
      clearPin();
      return;
    }

    const sectionRect = contactSection.getBoundingClientRect();
    const footerRect = contactFooterPanel.getBoundingClientRect();
    const distanceToStop = footerRect.top - window.innerHeight;
    const footerStillCoveringViewport = footerRect.bottom > window.innerHeight;
    const shouldPin = sectionRect.top <= 0 && distanceToStop <= 0 && footerStillCoveringViewport;

    if (!shouldPin) {
      clearPin();
      return;
    }

    applyPin();
  };

  const requestContactPinUpdate = () => {
    if (!pinFrame) {
      pinFrame = window.requestAnimationFrame(updateContactPin);
    }
  };

  measureContactPanel();
  updateContactPin();

  window.addEventListener("scroll", requestContactPinUpdate, { passive: true });
  window.addEventListener("resize", () => {
    measureContactPanel();
    requestContactPinUpdate();
  });
  desktopQuery.addEventListener?.("change", () => {
    measureContactPanel();
    requestContactPinUpdate();
  });
};

initContactFooterCover();

const initFooterWordmarkReveal = () => {
  const wordmark = document.querySelector(".contact-footer-wordmark-wrap");

  if (!wordmark) return;

  const updateRevealPosition = (event) => {
    const rect = wordmark.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    wordmark.style.setProperty("--footer-wordmark-x", `${Math.max(0, Math.min(100, x)).toFixed(2)}%`);
    wordmark.style.setProperty("--footer-wordmark-y", `${Math.max(0, Math.min(100, y)).toFixed(2)}%`);
  };

  wordmark.addEventListener("pointerenter", updateRevealPosition, { passive: true });
  wordmark.addEventListener("pointermove", updateRevealPosition, { passive: true });
};

initFooterWordmarkReveal();

const initBottomNav = () => {
  const nav = document.querySelector("[data-bottom-nav]");
  const bottomBlur = document.querySelector("[data-bottom-blur]");
  const hero = document.querySelector(".hero, .about-hero");
  const footer = document.querySelector(".contact-footer");
  const isAboutPage = document.body.classList.contains("about-page");
  const isImpactPage = document.body.classList.contains("impact-page");

  if (!nav || !hero) return;

  const trigger = nav.querySelector(".bottom-nav-trigger");
  const links = [...nav.querySelectorAll(".bottom-nav-link[data-nav-section]")];
  const trackedSections = [
    { id: "top", active: "top" },
    { id: "reality", active: "top" },
    { id: "system", active: "system" },
    { id: "about", active: "about" },
    { id: "work", active: "work" },
    { id: "process", active: "work" },
    { id: "industries", active: "work" },
    { id: "why", active: "work" },
    { id: "contact", active: "contact" },
  ]
    .map((section) => ({ ...section, element: document.getElementById(section.id) }))
    .filter((section) => section.element);

  let scrollTimer = 0;
  let closeTimer = 0;
  let navFrame = 0;

  const setExpanded = (expanded) => {
    window.clearTimeout(closeTimer);
    nav.classList.toggle("is-expanded", expanded);
    trigger?.setAttribute("aria-expanded", expanded ? "true" : "false");
  };

  const requestClose = (delay = 140) => {
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => setExpanded(false), delay);
  };

  const setActiveSection = (activeSection) => {
    const pageSection = isAboutPage ? "about" : isImpactPage ? "work" : "top";
    links.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.navSection === pageSection);
    });
  };

  const updateBottomNav = () => {
    navFrame = 0;

    const heroBottom = hero.getBoundingClientRect().bottom;
    const isAfterHero = heroBottom <= 72;
    const isOverFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight : false;

    nav.classList.toggle("is-after-hero", isAfterHero);
    nav.classList.toggle("is-over-footer", isOverFooter);
    bottomBlur?.classList.toggle("is-visible", isAfterHero && !isOverFooter);

    const probeY = window.innerHeight * 0.42;
    const current = isAboutPage
      ? "about"
      : isImpactPage ? "work" : trackedSections.reduce((active, section) => {
          return section.element.getBoundingClientRect().top <= probeY ? section.active : active;
        }, "top");

    setActiveSection(current);
  };

  const requestBottomNavUpdate = () => {
    if (!navFrame) {
      navFrame = window.requestAnimationFrame(updateBottomNav);
    }
  };

  const handleScroll = () => {
    nav.classList.add("is-scrolling");
    if (!nav.matches(":hover") && !nav.contains(document.activeElement)) {
      requestClose(80);
    }
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      nav.classList.remove("is-scrolling");
      requestBottomNavUpdate();
    }, 180);
    requestBottomNavUpdate();
  };

  nav.addEventListener("pointerenter", () => setExpanded(true), { passive: true });
  trigger?.addEventListener("click", () => setExpanded(!nav.classList.contains("is-expanded")));
  nav.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { nav.blur(); trigger?.blur(); setExpanded(false); }
  });
  nav.addEventListener("pointerleave", () => requestClose(), { passive: true });
  nav.addEventListener("focusin", () => setExpanded(true));
  nav.addEventListener("focusout", (event) => {
    if (!nav.contains(event.relatedTarget)) {
      requestClose();
    }
  });
  links.forEach((link) => {
    link.addEventListener("pointerdown", () => setExpanded(true));
    link.addEventListener("click", () => {
      setExpanded(true);
      window.setTimeout(() => requestBottomNavUpdate(), 120);
    });
  });

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", requestBottomNavUpdate);
  updateBottomNav();
};

initBottomNav();

const initHeroBackgroundDrift = () => {
  const hero = document.querySelector(".hero");
  const pointerQuery = window.matchMedia("(pointer: fine)");

  if (!hero || hero.classList.contains("hero-static") || prefersReducedMotion) return;

  const stageStrength = pointerQuery.matches ? 34 : 0;
  const perspectiveStrength = pointerQuery.matches ? 30 : 0;
  const ease = 0.065;
  const startedAt = window.performance.now();
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let focusTargetX = 50;
  let focusTargetY = 50;
  let focusX = 50;
  let focusY = 50;
  let focusFadeTimer = 0;

  const setDriftVars = (x, y, elapsed) => {
    const autoX = Math.sin(elapsed * 0.045) * 8 + x * 16;
    const autoY = Math.cos(elapsed * 0.038) * 6 + y * 12;
    const stageX = x * stageStrength;
    const stageY = y * stageStrength * 0.72;
    const rotateX = -y * perspectiveStrength;
    const rotateY = x * perspectiveStrength;
    const pointerDistance = Math.min(1, Math.hypot(x, y));
    const pointerScale = 1 + pointerDistance * 0.045;

    hero.style.setProperty("--hero-auto-x", `${autoX}px`);
    hero.style.setProperty("--hero-auto-y", `${autoY}px`);
    hero.style.setProperty("--hero-stage-x", `${stageX.toFixed(2)}px`);
    hero.style.setProperty("--hero-stage-y", `${stageY.toFixed(2)}px`);
    hero.style.setProperty("--hero-stage-rotate-x", `${rotateX.toFixed(3)}deg`);
    hero.style.setProperty("--hero-stage-rotate-y", `${rotateY.toFixed(3)}deg`);
    hero.style.setProperty("--hero-pointer-scale", pointerScale.toFixed(4));
    hero.style.setProperty("--hero-focus-x", `${focusX.toFixed(2)}%`);
    hero.style.setProperty("--hero-focus-y", `${focusY.toFixed(2)}%`);
  };

  const animateDrift = () => {
    const elapsed = (window.performance.now() - startedAt) / 1000;

    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;
    focusX += (focusTargetX - focusX) * 0.42;
    focusY += (focusTargetY - focusY) * 0.42;
    setDriftVars(currentX, currentY, elapsed);
    window.requestAnimationFrame(animateDrift);
  };

  const updateTarget = (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;

    targetX = Math.max(-0.88, Math.min(0.88, x * 2));
    targetY = Math.max(-0.88, Math.min(0.88, y * 2));

    const heroRect = hero.getBoundingClientRect();
    const isInsideHero =
      event.clientX >= heroRect.left &&
      event.clientX <= heroRect.right &&
      event.clientY >= heroRect.top &&
      event.clientY <= heroRect.bottom;

    if (!isInsideHero) {
      hero.style.setProperty("--hero-focus-opacity", "0");
      return;
    }

    focusTargetX = Math.max(0, Math.min(100, ((event.clientX - heroRect.left) / heroRect.width) * 100));
    focusTargetY = Math.max(0, Math.min(100, ((event.clientY - heroRect.top) / heroRect.height) * 100));
    focusX = focusTargetX;
    focusY = focusTargetY;
    hero.style.setProperty("--hero-focus-x", `${focusX.toFixed(2)}%`);
    hero.style.setProperty("--hero-focus-y", `${focusY.toFixed(2)}%`);
    hero.style.setProperty("--hero-focus-opacity", "0.95");

    window.clearTimeout(focusFadeTimer);
    focusFadeTimer = window.setTimeout(() => {
      hero.style.setProperty("--hero-focus-opacity", "0");
    }, 1700);
  };

  const resetTarget = () => {
    targetX = 0;
    targetY = 0;
    hero.style.setProperty("--hero-focus-opacity", "0");
    window.clearTimeout(focusFadeTimer);
  };

  if (pointerQuery.matches) {
    window.addEventListener("pointermove", updateTarget, { passive: true });
    window.addEventListener("pointerleave", resetTarget);
  }

  window.requestAnimationFrame(animateDrift);
};

initHeroBackgroundDrift();

if (!prefersReducedMotion) {
  const desktopMotionQuery = window.matchMedia("(min-width: 761px)");
  let lenis;

  if (desktopMotionQuery.matches && window.Lenis && window.gsap && window.ScrollTrigger) {
    lenis = new window.Lenis({
      duration: 1.45,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.82,
      touchMultiplier: 1,
    });

    lenis.on("scroll", window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    window.gsap.ticker.lagSmoothing(0);

    window.addEventListener("beforeunload", () => {
      lenis?.destroy();
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.18 }
  );

  document
    .querySelectorAll(".section-heading, .insight-card, .system-tile, .human-ai-copy-card")
    .forEach((node) => {
      node.classList.add("reveal");
      observer.observe(node);
    });

  const systemSection = document.querySelector(".system-section");
  const systemSequence = document.querySelector(".system-sequence");
  const systemSequenceStage = document.querySelector(".system-sequence-sticky");
  const systemScaleFrame = document.querySelector(".system-scale-frame");
  const systemCards = Array.from(document.querySelectorAll(".dt-card[data-sequence-index]"));

  const updateSystemScale = () => {
    if (!systemSection) return;

    const styles = window.getComputedStyle(systemSection);
    const horizontalPadding =
      parseFloat(styles.paddingLeft || "0") + parseFloat(styles.paddingRight || "0");
    const availableWidth = Math.max(window.innerWidth - horizontalPadding, 320);
    const scale = Math.min(availableWidth / 1600, 1);
    systemSection.style.setProperty("--system-scale", String(scale));
    systemSection.style.setProperty("--system-frame-width", `${1600 * scale}px`);
    systemSection.style.setProperty("--system-sequence-render-height", `${900 * scale}px`);
  };

  updateSystemScale();
  window.addEventListener("resize", updateSystemScale);

  const humanAiSection = document.querySelector(".human-ai-section");
  const humanAiGallery = document.querySelector(".human-ai-gallery");
  const humanAiGallerySticky = document.querySelector(".human-ai-gallery-sticky");
  const humanAiPanels = Array.from(document.querySelectorAll(".human-ai-panel[data-human-ai-panel]"));
  const humanAiCenterCard = document.querySelector(".human-ai-center-card");
  const humanAiCopyGrid = document.querySelector(".human-ai-copy-grid");
  const processScroll = document.querySelector(".process-scroll");
  const processSticky = document.querySelector(".process-sticky");
  const processSteps = Array.from(document.querySelectorAll(".process-step[data-process-index]"));
  const processVisuals = Array.from(document.querySelectorAll(".process-visual-image[data-process-visual]"));
  const processProgressFill = document.querySelector(".process-progress span");

  const updateHumanAiScale = () => {
    if (!humanAiSection) return;

    const styles = window.getComputedStyle(humanAiSection);
    const horizontalPadding =
      parseFloat(styles.paddingLeft || "0") + parseFloat(styles.paddingRight || "0");
    const availableWidth = Math.max(window.innerWidth - horizontalPadding, 320);
    const scale = Math.min(availableWidth / 1600, 1);
    humanAiSection.style.setProperty("--human-ai-scale", String(scale));
    humanAiSection.style.setProperty("--human-ai-frame-width", `${1600 * scale}px`);
    humanAiSection.style.setProperty("--human-ai-render-height", `${992 * scale}px`);
  };

  updateHumanAiScale();
  window.addEventListener("resize", updateHumanAiScale);

  if (desktopMotionQuery.matches && window.gsap && window.ScrollTrigger) {
    const { gsap } = window;
    gsap.registerPlugin(window.ScrollTrigger);

    const addScrollDepth = (selector, vars) => {
      gsap.utils.toArray(selector).forEach((target, index) => {
        const depth = typeof vars.depth === "function" ? vars.depth(index, target) : vars.depth;

        gsap.fromTo(
          target,
          { y: depth.from, scale: depth.fromScale ?? 1 },
          {
            y: depth.to,
            scale: depth.toScale ?? 1,
            ease: "none",
            scrollTrigger: {
              trigger: vars.trigger?.(target, index) || target,
              start: vars.start || "top bottom",
              end: vars.end || "bottom top",
              scrub: vars.scrub || 1.75,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    };

    const pageHero = document.querySelector(".hero, .about-hero");
    const heroCopy = pageHero?.querySelector(".hero-inner, .about-hero-copy");
    const heroNav = pageHero?.querySelector(".side-nav, .about-side-nav");

    if (pageHero && heroCopy && heroNav) {
      gsap.set(heroCopy, { y: 0 });
      gsap
      .timeline({
        scrollTrigger: {
          trigger: pageHero,
          start: "top top",
          end: "bottom top",
          scrub: 1.75,
        },
      })
      .to(heroCopy, { y: 90, opacity: 0.72, ease: "none" }, 0)
      .to(heroNav, { y: 42, opacity: 0.78, ease: "none" }, 0);
    }

    addScrollDepth(".visual-bg", {
      trigger: (target) => target.closest(".reality-visual"),
      depth: (index) => ({
        from: index ? 18 : 14,
        to: index ? -18 : -14,
        fromScale: 1.04,
        toScale: 1.08,
      }),
      scrub: 2,
    });

    gsap.utils.toArray(".reality-visual").forEach((visual, index) => {
      const innerVisual = visual.querySelector(".visual-independent, .visual-together");

      if (innerVisual) {
        gsap.fromTo(
          innerVisual,
          { y: index ? -8 : -10 },
          {
            y: index ? 8 : 10,
            ease: "none",
            scrollTrigger: {
              trigger: visual,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.75,
            },
          }
        );
      }
    });

    addScrollDepth(".reality-strip", {
      depth: { from: 26, to: -18 },
      scrub: 1.9,
    });

    gsap.utils
      .toArray(".reality-intro, .system-intro, .human-ai-tagline, .human-ai-heading, .work-intro")
      .forEach((block) => {
        gsap.fromTo(
          block,
          { y: 38 },
          {
            y: -22,
            ease: "none",
            scrollTrigger: {
              trigger: block,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.7,
            },
          }
        );
      });

  }

  if (systemSequence && systemSection) {
    let sequenceFrame = 0;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

    const progressBetween = (value, start, end) => {
      if (start === end) return value >= end ? 1 : 0;
      return clamp((value - start) / (end - start), 0, 1);
    };

    const updateSystemSequence = () => {
      sequenceFrame = 0;
      const rect = systemSequence.getBoundingClientRect();
      const scrollRange = Math.max(rect.height - window.innerHeight, 1);
      const progress = clamp(-rect.top / scrollRange, 0, 1);
      const sectionScale = parseFloat(getComputedStyle(systemSection).getPropertyValue("--system-scale")) || 1;

      const centerProgress = easeOutCubic(progressBetween(progress, 0.015, 0.2));
      const dotsProgress = easeOutCubic(progressBetween(progress, 0.92, 1));

      systemSection.style.setProperty("--center-progress", String(centerProgress));
      systemSection.style.setProperty("--dots-progress", String(dotsProgress));

      if (systemSequenceStage && systemScaleFrame) {
        const frameRect = systemScaleFrame.getBoundingClientRect();
        const pinHeight = 900 * sectionScale;
        const pinTop = Math.max((window.innerHeight - pinHeight) / 2, 24);
        const shouldPin = rect.top <= pinTop && rect.bottom >= pinTop + pinHeight;
        const isComplete = rect.bottom < pinTop + pinHeight;

        systemSequenceStage.classList.toggle("is-pinned", shouldPin);
        systemSequenceStage.classList.toggle("is-complete", isComplete);
        systemSection.style.setProperty("--system-pin-top", `${pinTop}px`);
        systemSection.style.setProperty("--system-pin-left", `${frameRect.left}px`);
        systemSection.style.setProperty("--system-pin-width", `${1600 * sectionScale}px`);
        systemSection.style.setProperty("--system-pin-height", `${pinHeight}px`);
      }

      systemCards.forEach((card, index) => {
        const start = 0.24 + index * 0.11;
        const end = start + 0.2;
        const cardProgress = easeOutCubic(progressBetween(progress, start, end));
        card.style.setProperty("--card-progress", String(cardProgress));
      });
    };

    const requestSequenceUpdate = () => {
      if (!sequenceFrame) {
        sequenceFrame = window.requestAnimationFrame(updateSystemSequence);
      }
    };

    updateSystemSequence();
    window.addEventListener("scroll", requestSequenceUpdate, { passive: true });
    window.addEventListener("resize", requestSequenceUpdate);
  }

  if (
    humanAiGallery &&
    humanAiGallerySticky &&
    humanAiCenterCard &&
    humanAiPanels.length &&
    humanAiCopyGrid &&
    window.gsap &&
    window.ScrollTrigger
  ) {
    const { gsap } = window;
    gsap.registerPlugin(window.ScrollTrigger);

    const panelMap = Object.fromEntries(
      humanAiPanels.map((panel) => [panel.dataset.humanAiPanel, panel])
    );

    const panelSequence = [
      panelMap.understand,
      panelMap.explore,
      panelMap.create,
      panelMap.evaluate,
      panelMap.build,
      panelMap.improve,
    ].filter(Boolean);

    const setDesktopHumanAiMotion = () => {
      const resetHumanAiState = () => {
        gsap.set(humanAiSection, {
          "--human-ai-zoom": 1,
          "--human-ai-pan-x": "0px",
          "--human-ai-pan-y": "0px",
        });

        gsap.set(humanAiCopyGrid, {
          clearProps: "transform,opacity",
        });

        gsap.set(humanAiGallerySticky, {
          clearProps: "opacity",
        });
      };

      resetHumanAiState();

      const humanAiTimeline = gsap.timeline({
        defaults: { ease: "power1.out" },
        scrollTrigger: {
          trigger: humanAiGallery,
          pin: humanAiGallerySticky,
          start: "top top",
          end: "+=240%",
          scrub: 1.45,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: resetHumanAiState,
          onLeaveBack: resetHumanAiState,
        },
      });

      humanAiTimeline
        .to(
          humanAiSection,
          {
            "--human-ai-zoom": 3.94375,
            "--human-ai-pan-x": "1px",
            duration: 0.82,
            ease: "power1.inOut",
          },
          0
        );

      return () => {
        humanAiTimeline.scrollTrigger?.kill();
        humanAiTimeline.kill();
        gsap.set(humanAiCopyGrid, {
          clearProps: "transform,opacity",
        });
        gsap.set(humanAiSection, {
          "--human-ai-zoom": 1,
          "--human-ai-pan-x": "0px",
          "--human-ai-pan-y": "0px",
        });
        gsap.set(humanAiGallerySticky, {
          clearProps: "opacity",
        });
      };
    };

    if (gsap.matchMedia) {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 761px)", setDesktopHumanAiMotion);
    }
  }

  if (
    processScroll &&
    processSticky &&
    processSteps.length &&
    processVisuals.length &&
    processProgressFill
  ) {
    const stageCount = processSteps.length;
      const progressRatios = [95 / 520, 236 / 520, 371 / 520, 1];
    let activeProcessIndex = -1;
    let processTrigger;

      const getProcessProgressHeight = (index) => {
        const railHeight = processProgressFill.parentElement?.offsetHeight || 520;
        return railHeight * (progressRatios[index] || 1);
      };

      const setProcessStage = (index) => {
      const nextIndex = Math.min(Math.max(index, 0), stageCount - 1);
      if (nextIndex === activeProcessIndex) return;

      activeProcessIndex = nextIndex;

      processSteps.forEach((step, stepIndex) => {
        const isActive = stepIndex === nextIndex;
        step.classList.toggle("is-active", isActive);
        step.setAttribute("aria-current", isActive ? "step" : "false");
      });

      processVisuals.forEach((visual, visualIndex) => {
        visual.classList.toggle("is-active", visualIndex === nextIndex);
      });

            processProgressFill.style.setProperty(
              "--process-progress-height",
              `${getProcessProgressHeight(nextIndex)}px`
            );
          };

    const getNativeProcessScrollRange = () => {
      const start = processScroll.getBoundingClientRect().top + window.scrollY;
      const end = start + processScroll.offsetHeight - window.innerHeight;

      return { start, end: Math.max(end, start + 1) };
    };

    const scrollToProcessStage = (index, duration = 0.45) => {
      const nextIndex = Math.min(Math.max(index, 0), stageCount - 1);
      const stageProgress = stageCount === 1 ? 0 : nextIndex / (stageCount - 1);
      const scrollRange = processTrigger || getNativeProcessScrollRange();
      const targetScroll = scrollRange.start + (scrollRange.end - scrollRange.start) * stageProgress;

      setProcessStage(nextIndex);

      if (lenis) {
        lenis.scrollTo(targetScroll, {
          duration,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        window.scrollTo({ top: targetScroll, behavior: duration ? "smooth" : "auto" });
      }
    };

    processSteps.forEach((step) => {
      step.addEventListener("click", () => {
        const index = Number(step.dataset.processIndex || 0);
        scrollToProcessStage(index, 0.25);
      });
    });

    setProcessStage(0);

    if (window.gsap && window.ScrollTrigger) {
      const { gsap } = window;
      gsap.registerPlugin(window.ScrollTrigger);

      processTrigger = window.ScrollTrigger.create({
        trigger: processScroll,
        pin: processSticky,
        start: "top top",
        end: "+=300%",
        scrub: 1.15,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const nextIndex = Math.min(stageCount - 1, Math.floor(self.progress * stageCount));
          setProcessStage(nextIndex);
        },
        onLeaveBack: () => {
          setProcessStage(0);
        },
      });
    } else {
      let processFrame = 0;

      processScroll.classList.add("is-native-sticky");

      const updateNativeProcessStage = () => {
        processFrame = 0;
        const { start, end } = getNativeProcessScrollRange();
        const progress = Math.min(Math.max((window.scrollY - start) / (end - start), 0), 1);
        const nextIndex = Math.min(stageCount - 1, Math.floor(progress * stageCount));
        setProcessStage(nextIndex);
      };

      const requestNativeProcessUpdate = () => {
        if (!processFrame) {
          processFrame = window.requestAnimationFrame(updateNativeProcessStage);
        }
      };

      updateNativeProcessStage();
      window.addEventListener("scroll", requestNativeProcessUpdate, { passive: true });
      window.addEventListener("resize", requestNativeProcessUpdate);
    }
  }
}
