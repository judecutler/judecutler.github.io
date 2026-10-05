// Edit here for any of the listed thingie majingies
(function () {
  'use strict';

  const SITE = window.SITE_CONTENT || {};

  
  // Everything's in textContent
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  // Only allow normal web links, email links, or relative paths. Anything
  // else (like javascript:) is ignored.
  function safeUrl(raw) {
    if (!raw) return null;
    const s = String(raw).trim();
    if (!s) return null;
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return /^(https?:|mailto:)/i.test(s) ? s : null;
    return s;
  }

  function isExternal(url) { return /^https?:/i.test(url); }

  function setLink(a, url) {
    a.href = url;
    if (isExternal(url)) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.appendChild(el('span', 'sr-only', ' (opens in a new tab)'));
    }
  }

  function safely(name, fn) {
    try { fn(); } catch (err) {
      console.error('content.js problem in "' + name + '":', err);
    }
  }

  // --- PPROJECTS -----------------------------------------------------------
  safely('projects', function () {
    const root = document.getElementById('projects-list');
    if (!root) return;
    (SITE.projects || []).forEach(function (p) {
      const card = el('article', 'project-card');

      if (p.image) {
        const img = el('img', 'project-card__image');
        img.src = p.image;
        img.alt = p.imageAlt || '';
        img.loading = 'lazy';
        card.appendChild(img);
      }

      card.appendChild(el('h3', 'project-card__title', p.title));
      if (p.description) card.appendChild(el('p', 'project-card__desc', p.description));

      if (p.tags && p.tags.length) {
        const tags = el('ul', 'tags');
        p.tags.forEach(function (t) { tags.appendChild(el('li', null, t)); });
        card.appendChild(tags);
      }

      const url = safeUrl(p.link);
      if (url) {
        const a = el('a', 'project-card__link', p.linkLabel || 'View project');
        setLink(a, url);
        card.classList.add('is-linked');
        card.appendChild(a);
      }

      root.appendChild(card);
    });
  });

  // --- DISTINCTIONS -------------------------------------------------------
  safely('distinctions', function () {
    const root = document.getElementById('distinctions-list');
    if (!root) return;
    (SITE.distinctions || []).forEach(function (d) {
      const li = el('li', 'distinction');
      li.appendChild(el('span', 'distinction__badge', d.year || ''));

      const body = el('div', 'distinction__body');
      const title = el('h3', 'distinction__title');
      const url = safeUrl(d.link);
      if (url) {
        const a = el('a', null, d.title);
        setLink(a, url);
        title.appendChild(a);
      } else {
        title.textContent = d.title;
      }
      body.appendChild(title);
      if (d.org) body.appendChild(el('p', 'distinction__org', d.org));
      if (d.description) body.appendChild(el('p', 'distinction__desc', d.description));

      li.appendChild(body);
      root.appendChild(li);
    });
  });

  // --- LIFE TIMELINE ---------------------------------------------------
  safely('timeline', function () {
    const root = document.getElementById('timeline-list');
    if (!root) return;
    (SITE.timeline || []).forEach(function (t) {
      const li = el('li', 'timeline__entry');
      li.appendChild(el('span', 'timeline__date', t.date));
      if (t.title) li.appendChild(el('h3', 'timeline__title', t.title));
      if (t.text) li.appendChild(el('p', 'timeline__text', t.text));
      root.appendChild(li);
    });
  });

  // --- BUCKET LIST --------------------------------------------------------
  safely('challenges', function () {
    const root = document.getElementById('challenges-list');
    if (!root) return;
    const items = SITE.challenges || [];
    let done = 0;

    items.forEach(function (c) {
      if (c.done) done += 1;
      const li = el('li', 'challenge' + (c.done ? ' is-done' : ''));

      const box = el('span', 'challenge__box');
      box.setAttribute('aria-hidden', 'true');
      li.appendChild(box);

      const text = el('span', 'challenge__text');
      text.appendChild(el('span', 'sr-only', c.done ? 'Completed: ' : 'To do: '));
      text.appendChild(document.createTextNode(c.text));
      if (c.note) text.appendChild(el('span', 'challenge__note', c.note));
      li.appendChild(text);

      root.appendChild(li);
    });

    const pct = items.length ? Math.round((done / items.length) * 100) : 0;
    const count = document.getElementById('challenges-count');
    const fill = document.getElementById('challenges-fill');
    if (count) count.textContent = done + ' of ' + items.length;
    if (fill) {
      fill.style.width = pct + '%';
      const bar = fill.parentElement;
      if (bar) bar.setAttribute('aria-valuenow', String(pct));
    }
  });

  // --- MOBILE ---------------------------------------------------------
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const open = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navMenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  // --- Highlight the current section's nav link ---------------------------
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav__menu a');
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  // --- Scroll progress bar along the bottom edge of the nav ---------------
  const progress = document.getElementById('scrollProgress');
  if (progress) {
    let ticking = false;
    const update = function () {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progress.style.transform = 'scaleX(' + p + ')';
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // --- Footer year --------------------------------------------------------
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
