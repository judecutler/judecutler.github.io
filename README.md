# Your portfolio site

A from-scratch HTML/CSS/JS site: hero, about, timeline, work, and contact
sections. No build tools, no frameworks — just open `index.html` in a
browser and it works.

## File structure

```
index.html       page structure and placeholder content
css/style.css    all styling (colors, type, and layout live here)
js/script.js     mobile nav, active-link highlighting, footer year
```

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
<img src="assets/images/portrait.jpg" alt="A photo of you">
```

(Create an `assets/images/` folder next to `index.html` and drop your
image files in there.)

## Previewing locally

Just double-click `index.html`, or in VS Code use the "Live Server"
extension for auto-reload while you edit.

## Deploying for free (GitHub Pages)

1. Create a free GitHub account and a new repository.
2. Push these files to it (via the GitHub website's "upload files" button,
   or `git` from the command line).
3. In the repo, go to **Settings → Pages**, and set the source to your
   main branch.
4. Your site goes live in a few minutes at
   `https://yourusername.github.io/reponame`.

## Coming later (on purpose, not forgotten)

- Conway's Game of Life animation in the hero background. The canvas
  (`#life-canvas`) and a spot to wire it up are already in place in
  `index.html` / `js/script.js` — see the comment near the bottom of
  `script.js`.
- Real photos in place of the dashed placeholder boxes.
