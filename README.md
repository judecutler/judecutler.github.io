# Your portfolio site

A from-scratch HTML/CSS/JS site: hero (with an interactive Conway's Game of
Life background), about, timeline, work, and contact sections. No build
tools, no frameworks — just open `index.html` in a browser and it works.

## File structure

```
index.html          page structure and placeholder content
style.css            all styling (colors, type, and layout live here)
script.js            mobile nav, active-link highlighting, footer year
game-of-life.js       the interactive hero background animation
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

## The Game of Life background

`game-of-life.js` runs Conway's Game of Life on a canvas behind the hero
text. A few things worth knowing:

- **It's interactive** — moving your mouse over the hero seeds new living
  cells near the cursor. (Skipped on touch devices, so it doesn't fight
  with scrolling.)
- **It respects "reduce motion" settings** — if a visitor's system asks for
  less animation, the canvas stays empty and only the static background
  texture shows.
- **It's tuned for performance**: the simulation runs at roughly 7 steps a
  second rather than every animation frame, the grid size is capped so
  huge monitors don't get an oversized workload, and it pauses entirely
  when the hero scrolls out of view or the browser tab isn't active.
- To tweak it: `TARGET_CELL_SIZE` (bigger = fewer, larger cells = cheaper),
  `STEP_INTERVAL` (higher = slower animation = less CPU use), and
  `ALIVE_COLOR` (the cell color/opacity) are all defined near the top of
  the file.

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
