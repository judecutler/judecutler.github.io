// ==========================================================================
// Conway's Game of Life — interactive hero background
//
// Performance choices, explained:
// - The grid is sized by a target cell size (not a fixed cell count), and
//   capped at MAX_CELLS total so ultra-wide monitors don't blow up the
//   workload — the cell size grows a bit instead.
// - The simulation only advances every STEP_INTERVAL ms (not every animation
//   frame). Game of Life reads fine at ~7 generations/second; recalculating
//   thousands of cells 60 times a second would be wasted work.
// - Two typed arrays (current/next) are reused and swapped each generation
//   instead of allocating new arrays, avoiding garbage-collection pauses.
// - Canvas resolution is capped at 1.5x device pixel ratio, so retina/4K
//   screens don't quadruple the pixels being pushed for no visible benefit.
// - The loop pauses entirely when the hero scrolls out of view or the browser
//   tab is hidden, via IntersectionObserver and the visibilitychange event.
// - It's skipped completely for visitors with prefers-reduced-motion set.
// ==========================================================================
(function () {
  const canvas = document.getElementById('life-canvas');
  if (!canvas) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Leave the canvas empty — the static CSS halftone texture on the hero
    // still gives it some texture without any motion.
    return;
  }

  const ctx = canvas.getContext('2d');
  const TARGET_CELL_SIZE = 16;   // px, starting point before the cap below
  const MAX_CELLS = 6000;        // safety ceiling regardless of screen size
  const STEP_INTERVAL = 140;     // ms between generations
  const MAX_DPR = 1.5;           // cap on device pixel ratio
  const ALIVE_COLOR = 'rgba(128, 255, 171, 0.5)'; // mint, translucent
  const SEED_DENSITY = 0.16;
  const REVIVE_DENSITY = 0.05;
  const REVIVE_THRESHOLD = 0.02; // repopulate if alive-fraction drops below this

  let cellSize = TARGET_CELL_SIZE;
  let cols = 0;
  let rows = 0;
  let current = null;
  let next = null;
  let width = 0;
  let height = 0;
  let running = false;
  let rafId = null;
  let lastStep = 0;

  const idx = (x, y) => y * cols + x;

  function seedRandom(grid, density) {
    for (let i = 0; i < grid.length; i++) {
      grid[i] = Math.random() < density ? 1 : 0;
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cellSize = TARGET_CELL_SIZE;
    cols = Math.max(1, Math.floor(width / cellSize));
    rows = Math.max(1, Math.floor(height / cellSize));

    // If the grid is bigger than our safety ceiling (very large screens),
    // grow the cell size until it fits comfortably.
    while (cols * rows > MAX_CELLS && cellSize < 48) {
      cellSize += 2;
      cols = Math.max(1, Math.floor(width / cellSize));
      rows = Math.max(1, Math.floor(height / cellSize));
    }

    current = new Uint8Array(cols * rows);
    next = new Uint8Array(cols * rows);
    seedRandom(current, SEED_DENSITY);
  }

  function countNeighbors(grid, x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = (x + dx + cols) % cols;
        const ny = (y + dy + rows) % rows;
        count += grid[idx(nx, ny)];
      }
    }
    return count;
  }

  function step() {
    let population = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const alive = current[idx(x, y)];
        const n = countNeighbors(current, x, y);
        const willLive = alive ? (n === 2 || n === 3) : (n === 3);
        next[idx(x, y)] = willLive ? 1 : 0;
        if (willLive) population++;
      }
    }
    const swap = current;
    current = next;
    next = swap;

    // Game of Life patterns often fizzle out to nothing or a static shape.
    // A background that goes dark and stays that way looks broken, so we
    // gently top it back up when the population thins out too much.
    if (population < current.length * REVIVE_THRESHOLD) {
      seedRandom(current, REVIVE_DENSITY);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = ALIVE_COLOR;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (current[idx(x, y)]) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
        }
      }
    }
  }

  function loop(timestamp) {
    if (!running) return;
    if (timestamp - lastStep >= STEP_INTERVAL) {
      step();
      draw();
      lastStep = timestamp;
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  // Seed a small cluster of live cells wherever a visitor moves their
  // cursor, so the pattern visibly reacts to them.
  function seedAtPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const cx = Math.floor((clientX - rect.left) / cellSize);
    const cy = Math.floor((clientY - rect.top) / cellSize);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = ((cx + dx) % cols + cols) % cols;
        const y = ((cy + dy) % rows + rows) % rows;
        if (Math.random() < 0.6) current[idx(x, y)] = 1;
      }
    }
  }

  // Only wire up pointer-based seeding for devices with a precise pointer
  // (mouse/trackpad). On touch screens, tracking every touchmove would
  // fight with normal scrolling for no real benefit.
  if (window.matchMedia('(pointer: fine)').matches) {
    let lastSeedTime = 0;
    canvas.addEventListener('pointermove', (e) => {
      const now = performance.now();
      if (now - lastSeedTime < 60) return; // throttle so fast movement doesn't overload
      lastSeedTime = now;
      seedAtPoint(e.clientX, e.clientY);
    });
  }

  // Pause when the hero isn't visible (scrolled past, or tab in background)
  // so the animation isn't spending CPU/battery for nothing.
  const hero = canvas.closest('.hero');
  if (hero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) start(); else stop();
      });
    }, { threshold: 0.05 });
    io.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  resize();
  start();
})();
