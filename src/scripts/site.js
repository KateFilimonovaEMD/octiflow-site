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


  // Homepage motion.
  // Hero motion is CSS-only so it remains visible without IntersectionObserver.
  // JavaScript is only responsible for one-time scroll reveals.
  const homePage = document.querySelector(".home-page");

  if (homePage && !reduceMotion) {
    const revealSelectors = [
      ".home-belief__copy",
      ".home-belief__features article",
      "#features .home-feature__copy",
      "#features .home-screen-pair",
      ".home-section--tint .home-feature__copy",
      ".home-section--tint .home-process-video-card",
      ".home-progress__copy",
      ".home-progress__cards article",
      ".home-access__heading",
      ".home-access-card",
      ".home-team__card",
      ".home-cta__card",
    ];

    const revealItems = revealSelectors.flatMap((selector) =>
      [...homePage.querySelectorAll(selector)],
    );

    homePage.classList.add("motion-enabled");
    revealItems.forEach((element) => element.classList.add("home-reveal"));

    const showAll = () => {
      revealItems.forEach((element) => element.classList.add("is-visible"));
    };

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
          threshold: 0.14,
          rootMargin: "0px 0px -6% 0px",
        },
      );

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          revealItems.forEach((element) => revealObserver.observe(element));
        });
      });
    } else {
      showAll();
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
