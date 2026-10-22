const menuButton = document.querySelector(".menu-button");
const siteMenu = document.querySelector(".site-menu");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setMenuState(isOpen) {
  if (!menuButton || !siteMenu) return;

  menuButton.classList.toggle("is-active", isOpen);
  siteMenu.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
  siteMenu.setAttribute("aria-hidden", String(!isOpen));
}

if (menuButton && siteMenu) {
  menuButton.addEventListener("click", () => {
    setMenuState(!menuButton.classList.contains("is-active"));
  });

  siteMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuState(false);
  });
}

const conceptSlider = document.querySelector(".concept-slider");

if (conceptSlider) {
  const frames = Array.from(conceptSlider.querySelectorAll("[data-slider-frame]"));
  const slideCount = frames[0]?.querySelectorAll("img").length ?? 0;
  const frameStates = frames.map((frame, frameIndex) => ({
    slides: Array.from(frame.querySelectorAll("img")),
    activeSlide: frameIndex % slideCount,
  }));

  const advanceFrame = (frameState) => {
    frameState.activeSlide = (frameState.activeSlide + 2) % slideCount;

    frameState.slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === frameState.activeSlide);
    });
  };

  if (!reduceMotion.matches && slideCount > 2) {
    window.setInterval(() => {
      advanceFrame(frameStates[0]);
    }, 4800);

    window.setTimeout(() => {
      advanceFrame(frameStates[1]);
      window.setInterval(() => advanceFrame(frameStates[1]), 4800);
    }, 2400);
  }
}

const revealTargets = document.querySelectorAll("[data-reveal]");

if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));

  // URLのハッシュから直接開いた場合も、表示領域内の要素を確実に開始する
  requestAnimationFrame(() => {
    revealTargets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight * 0.94 && rect.bottom > 0;

      if (isInViewport) {
        target.classList.add("is-visible");
        revealObserver.unobserve(target);
      }
    });
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: reduceMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  });
});
