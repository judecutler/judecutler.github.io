// ==========================================================================
// space.js — the page-wide space backdrop and the hero's ship.
//
// WHAT'S IN HERE
//   1. One fixed starfield behind the whole page, three depth layers.
//      Stars shift with scrolling, with the ship's motion, and (on phones)
//      with the tilt of the device. Scroll fast and they streak, like a warp.
//   2. DESKTOP: an Asteroids-style game confined to the hero.
//        arrows / WASD ... turn and thrust      space ... fire
//      Down arrow, Page Down, and the mouse wheel are never captured, so you
//      can always scroll on. Controls only work while the page is scrolled
//      to the very top; scroll even slightly and normal keyboard scrolling
//      returns. Keys are ignored when a link/button is focused or when
//      Ctrl/Cmd/Alt are held, so browser shortcuts keep working.
//   3. PHONES / TABLETS: the ship orbits the hero. Tilt the phone and the
//      orbit and the stars lean with it. Tap anywhere on the hero and the
//      ship blasts away, then slowly drifts back.
//
// PERFORMANCE
//   - A few hundred small rectangles per frame, plus a handful of outlines.
//   - Fewer stars on phones; device-pixel-ratio capped at 1.5.
//   - Frames only run while they're needed: while the hero is visible, or
//     briefly while you're scrolling. Otherwise nothing runs at all.
//   - Paused when the tab is hidden.
//   - With "reduce motion" on, it draws one still frame and does nothing else.
// ==========================================================================
(function () {
  'use strict';

  const bgCanvas = document.getElementById('space-bg');
  if (!bgCanvas || !bgCanvas.getContext) return;

  // ---- Settings you might want to tweak ----------------------------------
  const MAX_DPR = 1.5;           // cap on pixel density
  const TILT_PX = 70;            // how far tilt shifts the stars (phones)
  const SHIP_TURN = 4.2;         // radians per second
  const SHIP_THRUST = 240;       // pixels per second, per second
  const SHIP_MAX_SPEED = 280;
  const BULLET_SPEED = 520;
  const BULLET_LIFE = 0.9;       // seconds
  const FIRE_COOLDOWN = 0.18;    // seconds between shots
  const MAX_BULLETS = 6;
  const ORBIT_SPEED = 0.5;       // radians per second (phones)

  const LAYER_DEFS = [
    { base: 70, size: 1.5, depth: 0.12, alpha: 0.38 },
    { base: 42, size: 2,   depth: 0.30, alpha: 0.58 },
    { base: 18, size: 3,   depth: 0.60, alpha: 0.85, tint: true },
  ];

  const MINT = '#80FFAB';
  const AMBER = '#FFB347';
  const ROCK_STROKE = 'rgba(255,249,235,0.62)';

  // ---- Environment -------------------------------------------------------
  const TAU = Math.PI * 2;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  const hero = document.getElementById('top');
  const heroCanvas = document.getElementById('hero-canvas');
  const hudEl = document.querySelector('.hero__hud');
  const scoreEl = document.getElementById('hud-score');
  const bg = bgCanvas.getContext('2d');
  const hc = heroCanvas && heroCanvas.getContext ? heroCanvas.getContext('2d') : null;

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const mod = (v, m) => ((v % m) + m) % m;
  const wrap = (v, m) => (v < 0 ? v + m : v >= m ? v - m : v);
  const angDiff = (a, b) => mod(b - a + Math.PI, TAU) - Math.PI;

  // ---- Shared state ------------------------------------------------------
  let vw = 0, vh = 0, hw = 0, hh = 0, dpr = 1;
  let layers = [];
  const cam = { x: 0, y: 0 };       // how far the ship has "travelled"
  let scrollVel = 0;                 // recent scroll speed, in px per frame
  let lastScrollY = window.scrollY || 0;
  const tilt = { x: 0, y: 0 };       // smoothed device tilt, -1..1
  const tiltRaw = { x: 0, y: 0 };
  let heroVisible = true;
  let rafId = null;
  let lastTs = 0;

  // ==========================================================================
  // Sizing
  // ==========================================================================
  function sizeCanvas(canvas, ctx, w, h) {
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resize(force) {
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    const w = window.innerWidth;
    const h = window.innerHeight;
    // On phones the address bar sliding in and out changes the height by a
    // few dozen pixels. Ignoring small height-only changes avoids reshuffling
    // the stars every time you scroll.
    if (force || w !== vw || Math.abs(h - vh) > 150) {
      vw = w;
      vh = h;
      sizeCanvas(bgCanvas, bg, vw, vh);
      seedStars();
    }

    if (hero && hc) {
      const r = hero.getBoundingClientRect();
      const nw = Math.round(r.width);
      const nh = Math.round(r.height);
      if (force || nw !== hw || Math.abs(nh - hh) > 2) {
        hw = nw;
        hh = nh;
        sizeCanvas(heroCanvas, hc, hw, hh);
        resetGame();
      }
    }

    if (reduceMotion) { drawStars(); if (hc) drawGame(); }
    else requestFrame();
  }

  // ==========================================================================
  // Starfield
  // ==========================================================================
  function seedStars() {
    const areaScale = clamp((vw * vh) / 1000000, 0.45, 2);
    const density = isTouch ? 0.55 : 1;
    layers = LAYER_DEFS.map(function (def) {
      const count = Math.max(8, Math.round(def.base * areaScale * density));
      const white = [];
      const tinted = [];
      for (let i = 0; i < count; i++) {
        const p = { x: Math.random() * vw, y: Math.random() * vh };
        (def.tint && Math.random() < 0.45 ? tinted : white).push(p);
      }
      return {
        depth: def.depth,
        size: def.size,
        white: white,
        tinted: tinted,
        whiteStyle: 'rgba(255,255,255,' + def.alpha + ')',
        tintStyle: 'rgba(128,255,171,' + Math.min(1, def.alpha) + ')',
      };
    });
  }

  function paintGroup(pts, style, L, ox, oy, streak, trailUp) {
    if (!pts.length) return;
    bg.fillStyle = style;
    const h = L.size + streak;
    for (let i = 0; i < pts.length; i++) {
      const x = Math.round(mod(pts[i].x + ox, vw));
      let y = mod(pts[i].y + oy, vh);
      if (trailUp) y -= streak;
      bg.fillRect(x, Math.round(y), L.size, h);
    }
  }

  function drawStars() {
    bg.clearRect(0, 0, vw, vh);
    const sy = reduceMotion ? 0 : window.scrollY;
    const trailUp = scrollVel < 0;  // scrolling up: streaks trail above the star
    for (let i = 0; i < layers.length; i++) {
      const L = layers[i];
      const ox = -(cam.x * L.depth + tilt.x * TILT_PX * L.depth);
      const oy = -(sy * L.depth * 0.6 + cam.y * L.depth + tilt.y * TILT_PX * L.depth);
      const streak = reduceMotion ? 0 : Math.min(Math.abs(scrollVel) * L.depth * 0.9, 26);
      paintGroup(L.white, L.whiteStyle, L, ox, oy, streak, trailUp);
      paintGroup(L.tinted, L.tintStyle, L, ox, oy, streak, trailUp);
    }
  }

  // ==========================================================================
  // Game state (shared by desktop game and phone orbit)
  // ==========================================================================
  const G = {
    ship: null, bullets: [], rocks: [], parts: [],
    score: 0, scoreShown: -1, wave: 0, waveCd: 1.4, fireCd: 0,
  };
  const keys = { up: false, left: false, right: false, fire: false };

  // Phone orbit state
  const M = { theta: Math.random() * TAU, mode: 'orbit', k: 10, speed: 0, t: 0 };

  const unit = () => clamp(Math.min(hw, hh) / 800, 0.7, 1.15);

  function newShip() {
    return { x: hw / 2, y: hh / 2, a: -Math.PI / 2, vx: 0, vy: 0, thrust: false, dead: 0, inv: 0 };
  }

  function resetGame() {
    G.bullets.length = 0;
    G.rocks.length = 0;
    G.parts.length = 0;
    G.wave = 0;
    G.waveCd = 1.4;
    G.ship = newShip();
    if (isTouch) {
      M.mode = 'orbit';
      M.k = 10;
      const t = orbitTarget(M.theta);
      G.ship.x = t.x;
      G.ship.y = t.y;
      G.ship.a = orbitHeading(M.theta);
    } else {
      spawnWave();
    }
  }

  // ---- Rocks -------------------------------------------------------------
  const ROCK_RADIUS = [0, 13, 24, 40];   // by size: 1 small, 2 medium, 3 large
  const ROCK_SCORE = [0, 100, 50, 20];

  function makeRock(x, y, size, vx, vy) {
    const r = ROCK_RADIUS[size] * unit();
    const n = 9 + Math.floor(Math.random() * 4);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * TAU;
      const rr = r * (0.72 + Math.random() * 0.42);
      pts.push(Math.cos(ang) * rr, Math.sin(ang) * rr);
    }
    return { x: x, y: y, vx: vx, vy: vy, size: size, r: r, pts: pts,
             rot: Math.random() * TAU, spin: (Math.random() - 0.5) * 1.2 };
  }

  function spawnWave() {
    const count = Math.min(3 + G.wave, 7);
    const sx = G.ship ? G.ship.x : hw / 2;
    const sy = G.ship ? G.ship.y : hh / 2;
    const keepAway = Math.min(hw, hh) * 0.3;
    for (let i = 0; i < count; i++) {
      let x, y, tries = 0;
      do {
        x = Math.random() * hw;
        y = Math.random() * hh;
        tries++;
      } while (Math.hypot(x - sx, y - sy) < keepAway && tries < 20);
      const sp = 16 + Math.random() * 20;
      const a = Math.random() * TAU;
      G.rocks.push(makeRock(x, y, 3, Math.cos(a) * sp, Math.sin(a) * sp));
    }
  }

  function splitRock(rock) {
    if (rock.size <= 1) return;
    for (let i = 0; i < 2; i++) {
      const a = Math.random() * TAU;
      const sp = (22 + Math.random() * 26) * (1 + (4 - rock.size) * 0.3);
      G.rocks.push(makeRock(rock.x, rock.y, rock.size - 1,
        rock.vx * 0.5 + Math.cos(a) * sp, rock.vy * 0.5 + Math.sin(a) * sp));
    }
  }

  function burst(x, y, n, speed) {
    for (let i = 0; i < n && G.parts.length < 90; i++) {
      const a = Math.random() * TAU;
      const s = speed * (0.35 + Math.random() * 0.65);
      const life = 0.5 + Math.random() * 0.4;
      G.parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: life, max: life });
    }
  }

  // ==========================================================================
  // Desktop update
  // ==========================================================================
  function fireBullet(s) {
    G.bullets.push({
      x: s.x + Math.cos(s.a) * 14,
      y: s.y + Math.sin(s.a) * 14,
      vx: s.vx + Math.cos(s.a) * BULLET_SPEED,
      vy: s.vy + Math.sin(s.a) * BULLET_SPEED,
      life: BULLET_LIFE,
    });
  }

  function updateDesktop(dt) {
    let s = G.ship;

    if (s.dead > 0) {
      s.dead -= dt;
      if (s.dead <= 0) {            // respawn at the centre, briefly invulnerable
        s = G.ship = newShip();
        s.inv = 2.2;
      }
    } else {
      if (keys.left) s.a -= SHIP_TURN * dt;
      if (keys.right) s.a += SHIP_TURN * dt;
      s.thrust = keys.up;
      if (keys.up) {
        s.vx += Math.cos(s.a) * SHIP_THRUST * dt;
        s.vy += Math.sin(s.a) * SHIP_THRUST * dt;
      }
      const drag = Math.exp(-0.45 * dt);
      s.vx *= drag;
      s.vy *= drag;
      const sp = Math.hypot(s.vx, s.vy);
      if (sp > SHIP_MAX_SPEED) { s.vx *= SHIP_MAX_SPEED / sp; s.vy *= SHIP_MAX_SPEED / sp; }
      s.x = wrap(s.x + s.vx * dt, hw);
      s.y = wrap(s.y + s.vy * dt, hh);
      if (s.inv > 0) s.inv -= dt;

      G.fireCd -= dt;
      if (keys.fire && G.fireCd <= 0 && G.bullets.length < MAX_BULLETS) {
        fireBullet(s);
        G.fireCd = FIRE_COOLDOWN;
      }
      cam.x += s.vx * dt;
      cam.y += s.vy * dt;
    }

    // Bullets: move, expire, and hit rocks.
    for (let bi = G.bullets.length - 1; bi >= 0; bi--) {
      const b = G.bullets[bi];
      b.x = wrap(b.x + b.vx * dt, hw);
      b.y = wrap(b.y + b.vy * dt, hh);
      b.life -= dt;
      if (b.life <= 0) { G.bullets.splice(bi, 1); continue; }
      for (let ri = G.rocks.length - 1; ri >= 0; ri--) {
        const r = G.rocks[ri];
        const dx = b.x - r.x, dy = b.y - r.y;
        const hit = r.r + 2;
        if (dx * dx + dy * dy < hit * hit) {
          G.bullets.splice(bi, 1);
          G.rocks.splice(ri, 1);
          G.score += ROCK_SCORE[r.size];
          burst(r.x, r.y, 6 + r.size * 3, 60 + r.size * 25);
          splitRock(r);
          break;
        }
      }
    }

    // Rocks drift; the ship can get hit (no game over, it just respawns).
    for (let i = 0; i < G.rocks.length; i++) {
      const r = G.rocks[i];
      r.x = wrap(r.x + r.vx * dt, hw);
      r.y = wrap(r.y + r.vy * dt, hh);
      r.rot += r.spin * dt;
    }
    s = G.ship;
    if (s.dead <= 0 && s.inv <= 0) {
      for (let i = 0; i < G.rocks.length; i++) {
        const r = G.rocks[i];
        if (Math.hypot(s.x - r.x, s.y - r.y) < r.r * 0.8 + 7) {
          burst(s.x, s.y, 22, 160);
          s.dead = 1.3;
          s.thrust = false;
          break;
        }
      }
    }

    // Cleared the field? A fresh, slightly bigger wave arrives after a beat.
    if (G.rocks.length === 0) {
      G.waveCd -= dt;
      if (G.waveCd <= 0) { G.wave += 1; spawnWave(); G.waveCd = 1.4; }
    } else {
      G.waveCd = 1.4;
    }

    for (let i = G.parts.length - 1; i >= 0; i--) {
      const p = G.parts[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) G.parts.splice(i, 1);
    }

    if (scoreEl && G.score !== G.scoreShown) {
      G.scoreShown = G.score;
      scoreEl.textContent = String(G.score).padStart(4, '0');
    }
  }

  // ==========================================================================
  // Phone / tablet: orbit + tilt + tap-to-launch
  // ==========================================================================
  function orbitTarget(theta) {
    const cx = hw * 0.5 + tilt.x * hw * 0.18;
    const cy = hh * 0.5 + tilt.y * hh * 0.12;
    const rx = Math.min(hw * 0.36, 190);
    const ry = Math.min(hh * 0.24, 150);
    return { x: cx + Math.cos(theta) * rx, y: cy + Math.sin(theta) * ry };
  }

  function orbitHeading(theta) {
    const rx = Math.min(hw * 0.36, 190);
    const ry = Math.min(hh * 0.24, 150);
    return Math.atan2(Math.cos(theta) * ry, -Math.sin(theta) * rx);
  }

  function updateTouch(dt) {
    const s = G.ship;
    const safeDt = Math.max(dt, 0.001);

    M.theta += ORBIT_SPEED * dt;
    const tgt = orbitTarget(M.theta);
    let px = s.x, py = s.y;

    if (M.mode === 'away') {
      M.t += dt;
      M.speed = Math.min(950, M.speed + 1700 * dt);
      s.x += Math.cos(s.a) * M.speed * dt;
      s.y += Math.sin(s.a) * M.speed * dt;
      const gone = s.x < -80 || s.x > hw + 80 || s.y < -80 || s.y > hh + 80;
      if (gone || M.t > 1.6) {
        // Reappear well off-screen and glide back, slowly at first.
        M.mode = 'orbit';
        M.k = 0.8;
        const phi = Math.random() * TAU;
        const dist = Math.max(hw, hh) * 0.8;
        s.x = tgt.x + Math.cos(phi) * dist;
        s.y = tgt.y + Math.sin(phi) * dist;
        px = s.x;
        py = s.y;
      }
    } else {
      // The follow strength starts low after a launch (slow return) and
      // ramps up so the ship settles smoothly onto the orbit with no jump.
      M.k = Math.min(10, M.k + 1.5 * dt);
      const f = 1 - Math.exp(-M.k * dt);
      s.x += (tgt.x - s.x) * f;
      s.y += (tgt.y - s.y) * f;
    }

    s.vx = (s.x - px) / safeDt;
    s.vy = (s.y - py) / safeDt;
    const speed = Math.hypot(s.vx, s.vy);

    if (M.mode !== 'away' && speed > 8) {
      s.a += angDiff(s.a, Math.atan2(s.vy, s.vx)) * (1 - Math.exp(-10 * dt));
    }
    s.thrust = M.mode === 'away' || speed > 70;

    // Smooth the tilt, and let the ship's motion nudge the stars a little.
    const tf = 1 - Math.exp(-5 * dt);
    tilt.x += (tiltRaw.x - tilt.x) * tf;
    tilt.y += (tiltRaw.y - tilt.y) * tf;
    cam.x += s.vx * dt * 0.25;
    cam.y += s.vy * dt * 0.25;
  }

  function launchAway() {
    if (M.mode === 'away' || !G.ship) return;
    M.mode = 'away';
    M.t = 0;
    M.speed = Math.max(Math.hypot(G.ship.vx, G.ship.vy), 140);
    requestFrame();
  }

  // ---- Device tilt (phones) ----------------------------------------------
  let orientBound = false;
  let orientAsked = false;

  function onOrient(e) {
    if (e.gamma == null || e.beta == null) return;
    const angle = (window.screen.orientation && typeof window.screen.orientation.angle === 'number')
      ? window.screen.orientation.angle : (window.orientation || 0);
    if (angle !== 0) { tiltRaw.x = 0; tiltRaw.y = 0; return; }  // portrait only
    tiltRaw.x = clamp(e.gamma / 28, -1, 1);
    tiltRaw.y = clamp((e.beta - 55) / 28, -1, 1);               // ~55° is a natural holding angle
  }

  function bindOrientation() {
    if (orientBound) return;
    orientBound = true;
    window.addEventListener('deviceorientation', onOrient, { passive: true });
  }

  // iPhones require the visitor to grant motion access from a tap; other
  // phones just start working.
  function requestOrientation() {
    if (orientAsked) return;
    orientAsked = true;
    const D = window.DeviceOrientationEvent;
    if (!D) return;
    if (typeof D.requestPermission === 'function') {
      D.requestPermission().then(function (state) {
        if (state === 'granted') bindOrientation();
      }).catch(function () {});
    } else {
      bindOrientation();
    }
  }

  // ==========================================================================
  // Drawing the hero scene
  // ==========================================================================
  function drawShipShape(s) {
    const scale = isTouch ? 1.15 : 1;
    hc.save();
    hc.translate(s.x, s.y);
    hc.rotate(s.a + Math.PI / 2);
    hc.scale(scale, scale);

    if (s.thrust) {
      hc.beginPath();
      hc.moveTo(-4, 8);
      hc.lineTo(0, 16 + Math.random() * 8);
      hc.lineTo(4, 8);
      hc.strokeStyle = AMBER;
      hc.lineWidth = 1.8;
      hc.stroke();
    }

    hc.beginPath();
    hc.moveTo(0, -13);
    hc.lineTo(9, 10);
    hc.lineTo(0, 5);
    hc.lineTo(-9, 10);
    hc.closePath();
    hc.fillStyle = 'rgba(128,255,171,0.14)';
    hc.fill();
    hc.strokeStyle = MINT;
    hc.lineWidth = 1.8;
    hc.lineJoin = 'round';
    hc.stroke();
    hc.restore();
  }

  function drawGame() {
    hc.clearRect(0, 0, hw, hh);

    // Rocks: one path, one stroke.
    if (G.rocks.length) {
      hc.beginPath();
      for (let i = 0; i < G.rocks.length; i++) {
        const r = G.rocks[i];
        const c = Math.cos(r.rot), sn = Math.sin(r.rot);
        for (let k = 0; k < r.pts.length; k += 2) {
          const px = r.pts[k], py = r.pts[k + 1];
          const x = r.x + px * c - py * sn;
          const y = r.y + px * sn + py * c;
          if (k === 0) hc.moveTo(x, y); else hc.lineTo(x, y);
        }
        hc.closePath();
      }
      hc.lineWidth = 1.5;
      hc.lineJoin = 'round';
      hc.strokeStyle = ROCK_STROKE;
      hc.stroke();
    }

    if (G.bullets.length) {
      hc.fillStyle = MINT;
      for (let i = 0; i < G.bullets.length; i++) {
        hc.fillRect(G.bullets[i].x - 1.5, G.bullets[i].y - 1.5, 3, 3);
      }
    }

    if (G.parts.length) {
      hc.fillStyle = '#FFF9EB';
      for (let i = 0; i < G.parts.length; i++) {
        const p = G.parts[i];
        hc.globalAlpha = Math.max(0, p.life / p.max);
        hc.fillRect(p.x - 1, p.y - 1, 2, 2);
      }
      hc.globalAlpha = 1;
    }

    const s = G.ship;
    if (s && s.dead <= 0) {
      const blinkOff = s.inv > 0 && Math.floor(s.inv * 8) % 2 === 0;
      if (!blinkOff) drawShipShape(s);
    }
  }

  // ==========================================================================
  // Frame loop: only runs while something is actually moving
  // ==========================================================================
  function requestFrame() {
    if (rafId === null && !document.hidden) rafId = requestAnimationFrame(frame);
  }

  function frame(ts) {
    rafId = null;
    let dt = lastTs ? (ts - lastTs) / 1000 : 1 / 60;
    lastTs = ts;
    dt = Math.min(dt, 0.05);

    scrollVel *= Math.exp(-9 * dt);
    if (Math.abs(scrollVel) < 0.05) scrollVel = 0;

    const gameLive = heroVisible && !reduceMotion && hc !== null;
    if (gameLive) {
      if (isTouch) updateTouch(dt); else updateDesktop(dt);
      drawGame();
    }
    drawStars();

    if (gameLive || scrollVel !== 0) {
      requestFrame();
    } else {
      lastTs = 0;   // asleep until something wakes us
    }
  }

  // ==========================================================================
  // Input, visibility, resize
  // ==========================================================================
  function gameKeysLive() {
    return !isTouch && !reduceMotion && heroVisible && window.scrollY <= 24;
  }

  let wasLive = null;
  function updateKeyEngagement() {
    const live = gameKeysLive();
    if (!live) { keys.up = keys.left = keys.right = keys.fire = false; }
    if (live !== wasLive) {
      wasLive = live;
      if (hudEl) hudEl.classList.toggle('is-idle', !live);
    }
  }

  if (!reduceMotion) {
    window.addEventListener('scroll', function () {
      const y = window.scrollY;
      scrollVel = clamp(scrollVel + (y - lastScrollY), -60, 60);
      lastScrollY = y;
      if (!isTouch) updateKeyEngagement();
      requestFrame();
    }, { passive: true });
  }

  if (!isTouch && !reduceMotion) {
    const KEYMAP = {
      ArrowUp: 'up', w: 'up', W: 'up',
      ArrowLeft: 'left', a: 'left', A: 'left',
      ArrowRight: 'right', d: 'right', D: 'right',
      ' ': 'fire', Spacebar: 'fire',
    };

    window.addEventListener('keydown', function (e) {
      const action = KEYMAP[e.key];
      if (!action) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;   // leave browser shortcuts alone
      if (!gameKeysLive()) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName))) return;
      keys[action] = true;
      e.preventDefault();
    });

    window.addEventListener('keyup', function (e) {
      const action = KEYMAP[e.key];
      if (action) keys[action] = false;
    });

    window.addEventListener('blur', function () {
      keys.up = keys.left = keys.right = keys.fire = false;
    });
  }

  if (isTouch && !reduceMotion && hero) {
    // Non-iOS phones can start listening for tilt right away.
    const D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission !== 'function') bindOrientation();

    hero.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a, button')) return;
      requestOrientation();   // iPhones show their motion-access prompt once, here
      launchAway();
    });
  }

  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      updateKeyEngagement();
      if (heroVisible) requestFrame();
    }).observe(hero);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      lastTs = 0;
    } else {
      requestFrame();
    }
  });

  let resizeTimer = null;
  function scheduleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { resize(false); }, 120);
  }
  window.addEventListener('resize', scheduleResize);
  if (hero && 'ResizeObserver' in window) new ResizeObserver(scheduleResize).observe(hero);

  // ---- Go ----------------------------------------------------------------
  resize(true);
  updateKeyEngagement();
  if (!reduceMotion) requestFrame();
})();
