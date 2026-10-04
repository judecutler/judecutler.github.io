// ==========================================================================
// Space-flight hero background: a parallax starfield + a small ship you fly
// with the arrow keys (or WASD).
//
// Scope, on purpose:
// - This is confined to the hero. It never touches scrolling or content
//   elsewhere on the page — arrow keys only steer the ship while the hero
//   is in view, so navigating the rest of the site is completely normal.
// - No shooting, no obstacles — just flight. A background flourish, not a
//   mini-game.
// - Touch devices have no arrow keys, so the ship gently autopilots in a
//   slow drifting circle instead of requiring controls.
//
// Performance, on purpose:
// - Every frame just draws a couple hundred dots, two soft gradients, and
//   one small triangular ship — cheap even on low-end hardware.
// - Device pixel ratio is capped so retina/4K screens don't get 2-3x the
//   drawing work for no visible benefit.
// - The loop pauses completely when the hero scrolls out of view or the
//   browser tab isn't active.
// - Skipped for prefers-reduced-motion, which draws one static frame with
//   no motion and no key handling.
// ==========================================================================
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const MAX_DPR = 1.5;

  const STAR_LAYERS = [
    { count: 70, size: 1,   speed: 0.15, color: 'rgba(255,255,255,0.35)' },
    { count: 45, size: 1.6, speed: 0.35, color: 'rgba(255,255,255,0.55)' },
    { count: 22, size: 2.2, speed: 0.6,  color: 'rgba(128,255,171,0.6)'  },
  ];
  const SHIP_COLOR = '#80FFAB';
  const FLAME_COLOR = '#FFB347';
  const NEBULA_A = 'rgba(255,111,165,0.05)';
  const NEBULA_B = 'rgba(94,230,208,0.045)';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = !window.matchMedia('(pointer: fine)').matches;

  let width = 0;
  let height = 0;
  let layers = [];
  const cam = { x: 0, y: 0 };
  const ship = { x: 0, y: 0, angle: -Math.PI / 2, vx: 0, vy: 0, thrusting: false };
  const keys = { up: false, down: false, left: false, right: false };

  let heroInView = true;
  let running = false;
  let rafId = null;
  let lastTime = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ship.x = width / 2;
    ship.y = height / 2;

    layers = STAR_LAYERS.map((layer) => ({
      ...layer,
      stars: Array.from({ length: layer.count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
      })),
    }));
  }

  function drawNebula() {
    const r = Math.max(width, height) * 0.6;
    const g1 = ctx.createRadialGradient(width * 0.2, height * 0.3, 0, width * 0.2, height * 0.3, r);
    g1.addColorStop(0, NEBULA_A);
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    const g2 = ctx.createRadialGradient(width * 0.85, height * 0.75, 0, width * 0.85, height * 0.75, r);
    g2.addColorStop(0, NEBULA_B);
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, width, height);
  }

  function drawStars() {
    layers.forEach((layer) => {
      ctx.fillStyle = layer.color;
      layer.stars.forEach((star) => {
        const x = ((star.x - cam.x * layer.speed) % width + width) % width;
        const y = ((star.y - cam.y * layer.speed) % height + height) % height;
        ctx.beginPath();
        ctx.arc(x, y, layer.size, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  function drawShip() {
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle + Math.PI / 2);

    if (ship.thrusting) {
      ctx.beginPath();
      ctx.moveTo(-4, 10);
      ctx.lineTo(0, 18 + Math.random() * 6);
      ctx.lineTo(4, 10);
      ctx.closePath();
      ctx.fillStyle = FLAME_COLOR;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(9, 10);
    ctx.lineTo(0, 5);
    ctx.lineTo(-9, 10);
    ctx.closePath();
    ctx.fillStyle = SHIP_COLOR;
    ctx.fill();

    ctx.restore();
  }

  function update(dt) {
    const ROTATE_SPEED = 3.2; // radians/sec
    const THRUST = 90;        // px/sec^2
    const DRAG = 0.992;
    const MAX_SPEED = 160;

    if (isTouch) {
      // Gentle autopilot: slow, wide circular drift.
      ship.angle += 0.35 * dt;
      ship.thrusting = true;
      ship.vx = Math.cos(ship.angle) * 40;
      ship.vy = Math.sin(ship.angle) * 40;
    } else {
      if (keys.left) ship.angle -= ROTATE_SPEED * dt;
      if (keys.right) ship.angle += ROTATE_SPEED * dt;
      ship.thrusting = keys.up;
      if (keys.up) {
        ship.vx += Math.cos(ship.angle) * THRUST * dt;
        ship.vy += Math.sin(ship.angle) * THRUST * dt;
      }
      if (keys.down) {
        ship.vx -= Math.cos(ship.angle) * THRUST * 0.5 * dt;
        ship.vy -= Math.sin(ship.angle) * THRUST * 0.5 * dt;
      }

      const speed = Math.hypot(ship.vx, ship.vy);
      if (speed > MAX_SPEED) {
        ship.vx = (ship.vx / speed) * MAX_SPEED;
        ship.vy = (ship.vy / speed) * MAX_SPEED;
      }
      ship.vx *= DRAG;
      ship.vy *= DRAG;
    }

    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;

    // Screen-wrap, Asteroids-style.
    if (ship.x < 0) ship.x += width;
    if (ship.x > width) ship.x -= width;
    if (ship.y < 0) ship.y += height;
    if (ship.y > height) ship.y -= height;

    cam.x += ship.vx * dt;
    cam.y += ship.vy * dt;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    drawNebula();
    drawStars();
    drawShip();
  }

  function loop(timestamp) {
    if (!running) return;
    const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0;
    lastTime = timestamp;
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    lastTime = 0;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (reduceMotion) {
    // One static frame: starfield + nebula + ship, no motion, no key
    // handling at all.
    resize();
    draw();
    return;
  }

  window.addEventListener('keydown', (e) => {
    if (!heroInView) return;
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': keys.up = true; e.preventDefault(); break;
      case 'ArrowDown': case 's': case 'S': keys.down = true; e.preventDefault(); break;
      case 'ArrowLeft': case 'a': case 'A': keys.left = true; e.preventDefault(); break;
      case 'ArrowRight': case 'd': case 'D': keys.right = true; e.preventDefault(); break;
      default: break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': keys.up = false; break;
      case 'ArrowDown': case 's': case 'S': keys.down = false; break;
      case 'ArrowLeft': case 'a': case 'A': keys.left = false; break;
      case 'ArrowRight': case 'd': case 'D': keys.right = false; break;
      default: break;
    }
  });

  const hero = canvas.closest('.hero');
  if (hero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        heroInView = entry.isIntersecting;
        if (entry.isIntersecting) start(); else stop();
      });
    }, { threshold: 0.05 });
    io.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (heroInView) start();
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  resize();
  start();
})();
