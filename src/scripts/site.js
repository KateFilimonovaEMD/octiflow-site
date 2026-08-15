(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  const closeMobileMenu = ({ restoreFocus = false } = {}) => {
    if (!menuToggle || !mobileMenu) {
      return;
    }

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    mobileMenu.hidden = true;

    if (restoreFocus) {
      menuToggle.focus();
    }
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";

      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute("aria-label", willOpen ? "Close menu" : "Open menu");
      mobileMenu.hidden = !willOpen;
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileMenu.hidden) {
        closeMobileMenu({ restoreFocus: true });
      }
    });

    const desktopViewport = window.matchMedia("(min-width: 821px)");
    const handleViewportChange = (event) => {
      if (event.matches) {
        closeMobileMenu();
      }
    };

    if ("addEventListener" in desktopViewport) {
      desktopViewport.addEventListener("change", handleViewportChange);
    } else {
      desktopViewport.addListener(handleViewportChange);
    }
  }


  // Homepage motion: safe progressive enhancement.
  // Elements are visible by default; motion classes are added only after JS runs.
  const homePage = document.querySelector(".home-page");

  if (homePage && !reduceMotion) {
    const markReveal = (element, { scale = false } = {}) => {
      if (!element) {
        return;
      }

      element.classList.add("home-motion-reveal");
      if (scale) {
        element.classList.add("home-motion-reveal--scale");
      }
    };

    const heroItems = [
      homePage.querySelector(".home-hero h1"),
      homePage.querySelector(".home-hero__lead"),
      homePage.querySelector(".home-hero__actions"),
      homePage.querySelector(".home-hero__visual"),
    ];

    heroItems.forEach((element) => markReveal(element));

    const heroLabels = [...homePage.querySelectorAll(".home-floating-label")];
    heroLabels.forEach((label) => label.classList.add("home-motion-label"));

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heroItems.forEach((element) => element?.classList.add("is-visible"));
        heroLabels.forEach((label) => label.classList.add("is-visible"));
      });
    });

    const revealItems = [];
    const addReveal = (selector, { scale = false } = {}) => {
      homePage.querySelectorAll(selector).forEach((element) => {
        markReveal(element, { scale });
        revealItems.push(element);
      });
    };

    addReveal(".home-belief__copy");
    addReveal(".home-belief__features article");
    addReveal("#features .home-feature__copy");
    addReveal("#features .home-screen-pair");
    addReveal(".home-section--tint .home-feature__copy");
    addReveal(".home-section--tint .home-process-video-card", { scale: true });
    addReveal(".home-progress__copy");
    addReveal(".home-progress__cards article");
    addReveal(".home-access__heading");
    addReveal(".home-access-card");
    addReveal(".home-team__card", { scale: true });
    addReveal(".home-cta__card", { scale: true });

    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px",
        },
      );

      revealItems.forEach((element) => revealObserver.observe(element));
    } else {
      // Older browsers keep full functionality and simply skip scroll-triggered motion.
      revealItems.forEach((element) => element.classList.add("is-visible"));
    }
  }

  let scrollTimer;

  document.querySelectorAll('.toc a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const fragment = link.getAttribute("href")?.slice(1);
      const target = fragment
        ? document.getElementById(decodeURIComponent(fragment))
        : null;

      if (!target) {
        return;
      }

      event.preventDefault();
      clearTimeout(scrollTimer);

      const scrollToTarget = () => {
        const navigation = document.querySelector("nav");
        const navigationHeight = navigation
          ? navigation.getBoundingClientRect().height
          : 0;

        window.scrollTo({
          top:
            target.getBoundingClientRect().top +
            window.scrollY -
            navigationHeight -
            16,
          behavior: reduceMotion ? "auto" : "smooth",
        });
      };

      requestAnimationFrame(() => {
        scrollToTarget();
        scrollTimer = setTimeout(scrollToTarget, 80);
      });

      history.replaceState(null, "", link.getAttribute("href"));
    });
  });
})();
