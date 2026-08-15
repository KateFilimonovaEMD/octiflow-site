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
