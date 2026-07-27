(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const revealItems = document.querySelectorAll(".reveal");

  const revealAll = () => {
    revealItems.forEach((element) => {
      element.classList.add("in-view");
    });
  };

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealItems.forEach((item) => {
      observer.observe(item);
    });
  }

  let scrollTimer;

  document.querySelectorAll('.toc a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));

      if (!target) {
        return;
      }

      event.preventDefault();
      clearTimeout(scrollTimer);
      revealAll();

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
          behavior: reduceMotion ? "auto" : "smooth"
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
