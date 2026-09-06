// ==========================================================================
// Mobile nav toggle
// ==========================================================================
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close the mobile menu after a link is tapped.
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ==========================================================================
// Highlight the current section's nav link while scrolling
// ==========================================================================
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav__menu a');

if (sections.length && navLinks.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}

// ==========================================================================
// Footer year
// ==========================================================================
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// ==========================================================================
// Conway's Game of Life hero background — coming later.
// The <canvas id="life-canvas"> in the hero is already in the DOM and sized
// via CSS. When we build this out, it'll live in its own file
// (e.g. js/game-of-life.js) and get initialized from here, something like:
//
//   const canvas = document.getElementById('life-canvas');
//   initGameOfLife(canvas);
//
// Left as a stub on purpose so the rest of the site stays fully functional
// without it.
// ==========================================================================
