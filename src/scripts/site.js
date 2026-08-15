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



  // Keep decorative/demo videos from consuming resources while they are
  // outside the viewport. This preserves the existing autoplay experience
  // when a video is actually visible.
  const managedVideos = [...document.querySelectorAll("video[autoplay][muted][loop]")];

  if (managedVideos.length > 0) {
    const setVideoActive = (video, active) => {
      const shouldPlay = active && !reduceMotion && !document.hidden;
      const processCard = video.closest(".home-process-video-card");

      if (processCard) {
        processCard.classList.toggle("is-video-active", shouldPlay);
      }

      if (shouldPlay) {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            // Muted autoplay can still be blocked by browser/user policy.
            // The poster remains a valid fallback.
          });
        }
      } else {
        video.pause();
      }
    };

    if (reduceMotion) {
      managedVideos.forEach((video) => setVideoActive(video, false));
    } else if ("IntersectionObserver" in window) {
      const visibleVideos = new Set();

      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;

            if (entry.isIntersecting && entry.intersectionRatio >= 0.08) {
              visibleVideos.add(video);
              setVideoActive(video, true);
            } else {
              visibleVideos.delete(video);
              setVideoActive(video, false);
            }
          });
        },
        {
          threshold: [0, 0.08],
          rootMargin: "120px 0px",
        },
      );

      managedVideos.forEach((video) => {
        videoObserver.observe(video);
      });

      document.addEventListener("visibilitychange", () => {
        managedVideos.forEach((video) => {
          setVideoActive(video, visibleVideos.has(video));
        });
      });
    } else {
      // Progressive-enhancement fallback: browsers without IntersectionObserver
      // keep the original autoplay behavior.
      managedVideos.forEach((video) => {
        video.closest(".home-process-video-card")?.classList.add("is-video-active");
      });
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
