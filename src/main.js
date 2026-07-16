const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navigationEntry = window.performance?.getEntriesByType?.("navigation")?.[0];
const isHardReload = navigationEntry?.type === "reload";

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

if (isHardReload) {
  window.scrollTo(0, 0);
  window.addEventListener("load", () => {
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  });
}

const bottomBlurStrip = document.querySelector(".bottom-blur-strip");
const heroSection = document.querySelector(".hero");
const contactFooter = document.querySelector(".contact-footer");

if (bottomBlurStrip && heroSection) {
  let blurFrame = 0;

  const updateBottomBlurVisibility = () => {
    blurFrame = 0;
    const heroRect = heroSection.getBoundingClientRect();
    const footerRect = contactFooter?.getBoundingClientRect();
    const isFooterVisible = footerRect
      ? footerRect.bottom > 0 && footerRect.top < window.innerHeight
      : false;

    bottomBlurStrip.classList.toggle("is-footer-hidden", isFooterVisible);
    bottomBlurStrip.classList.toggle(
      "is-visible",
      heroRect.bottom <= window.innerHeight && !isFooterVisible
    );
  };

  const requestBottomBlurUpdate = () => {
    if (!blurFrame) {
      blurFrame = window.requestAnimationFrame(updateBottomBlurVisibility);
    }
  };

  updateBottomBlurVisibility();
  window.addEventListener("scroll", requestBottomBlurUpdate, { passive: true });
  window.addEventListener("resize", requestBottomBlurUpdate);
}

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

    gsap.set(".hero-media", { yPercent: -5, scale: 1.08 });
    gsap.set(".hero-inner", { y: 0 });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.75,
        },
      })
      .to(".hero-media", { yPercent: 7, scale: 1.02, ease: "none" }, 0)
      .to(".hero-inner", { y: 90, opacity: 0.72, ease: "none" }, 0)
      .to(".side-nav", { y: 42, opacity: 0.78, ease: "none" }, 0);

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
