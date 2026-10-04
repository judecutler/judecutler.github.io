# Your portfolio site

A from-scratch HTML/CSS/JS site: hero (with an interactive Conway's Game of
Life background), about, timeline, work, and contact sections. No build
tools, no frameworks — just open `index.html` in a browser and it works.

## File structure

```
index.html          page structure and placeholder content
style.css            all styling (colors, type, and layout live here)
script.js            mobile nav, active-link highlighting, footer year
spaceship.js          the flyable-ship hero background animation
```

All files live flat at the repo root — no subfolders — to match how
GitHub's web upload tool handles files (it flattens folder structure
unless you drag whole folders in).

## What to customize first

Open `index.html` and look for the `<!-- EDIT: ... -->` comments — they
mark every spot with placeholder content:

- Hero headline and tagline
- About photo + bio paragraphs
- Timeline milestones (add or remove `<li class="timeline__entry">` blocks)
- Project cards (add or remove `<article class="project-card">` blocks,
  swap in real photos, rewrite descriptions and tags)
- Email address and social links in Contact
- The page `<title>` and `<meta name="description">` at the top of the file

To use a real photo instead of a placeholder box, replace a placeholder
`<div>` with an `<img>` tag, e.g.:

```html
<img src="portrait.jpg" alt="A photo of you">
```

(Upload your image files to the repo root, or a subfolder if you're
comfortable managing GitHub's folder uploads.)

## The spaceship hero background

`spaceship.js` draws a parallax starfield and a small Asteroids-style ship
behind the hero text. A few things worth knowing:

- **Controls**: arrow keys or WASD — up/W to thrust, left/right or A/D to
  rotate. The ship wraps around the edges of the hero, like classic
  Asteroids. There's no shooting or obstacles; it's flight only.
- **Scoped on purpose**: arrow keys only steer the ship while the hero is
  in view. Scroll past it and the rest of the site works exactly as
  normal — nothing about reading the page is affected.
- **Touch devices**: there are no arrow keys on a phone, so the ship
  gently autopilots in a slow drifting circle instead of requiring input.
- **Respects "reduce motion"**: if a visitor's system asks for less
  animation, it draws one static frame and never starts moving.
- **Performance**: everything drawn is a couple hundred dots, two soft
  gradients, and one small shape — cheap even on old hardware. It's
  capped at 1.5x pixel density, and it fully pauses when the hero scrolls
  out of view or the tab isn't active.
- To tweak it: `STAR_LAYERS` controls star count/size/speed per depth
  layer, and `SHIP_COLOR`/`FLAME_COLOR`/`NEBULA_A`/`NEBULA_B` control the
  color scheme — all defined near the top of `spaceship.js`.

## Previewing locally

Just double-click `index.html`, or in VS Code use the "Live Server"
extension for auto-reload while you edit.

## Deploying for free (GitHub Pages)

1. Create a free GitHub account and a new repository named
   `yourusername.github.io`.
2. Push these files to it (via the GitHub website's "Add file → Upload
   files" button, or `git` from the command line).
3. In the repo, go to **Settings → Pages**, and confirm the source is set
   to your main branch.
4. Your site goes live in a few minutes at
   `https://yourusername.github.io`.

When you make edits locally, re-upload the changed file(s) the same way —
GitHub will prompt you to confirm the overwrite.
