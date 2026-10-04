# Your personal site

Hand-built HTML, CSS and JavaScript. No frameworks, no build step. Hosted free
on GitHub Pages.

## Files (all flat in the repo root, no folders)

```
index.html    page structure + one-off text (hero, about, contact)
content.js    the list content: projects, distinctions, story, bucket list
style.css     colors, type, layout
script.js     builds the lists from content.js; menu, scroll bar, etc.
space.js      the starfield + the ship (desktop game / phone orbit)
README.md
LICENSE
```

**If you're updating an existing repo:** upload the five files above that
changed (`index.html`, `content.js`, `style.css`, `script.js`, `space.js`),
and **delete `spaceship.js` and `game-of-life.js`** from the repo if they're
still there. Nothing uses them anymore.

## Adding things (the part you'll do most)

Open **`content.js`**. Each list is a set of blocks. To add a project:

1. Copy one whole block, from `{` to `},`
2. Paste it right below
3. Change the text between the quotes

Same for `distinctions` (awards), `timeline` (your story) and `challenges`
(bucket list). Flip a challenge to `done: true` and the checkmark and the
progress bar update on their own.

Things that keep it from breaking: keep the `{ ... },` shape, keep text in
straight quotes, and write `\"` if your text contains a double quote. If a
section ever looks empty, press F12 in your browser and look at the Console.
It names the problem.

Project cards can also take an optional `image: "photo.jpg"` (upload the photo
to the repo root).

One-off text (hero headline, bio, contact email, social links) is edited in
`index.html`; look for the `<!-- EDIT -->` comments.

## The space backdrop

One fixed starfield sits behind the whole page, in three depth layers.

- **Scrolling** moves the layers at different speeds. Scroll fast (or click a
  nav link) and the stars streak, like a warp jump.
- **Desktop hero:** an Asteroids-style game.
  Arrow keys or WASD to turn and thrust, **space** to fire. Asteroids split
  when hit. If one hits you, you respawn after a moment; there is no game over.
- **Phones and tablets:** the ship orbits the hero. Tilt the phone and the
  orbit and the stars lean with it. Tap the hero and the ship blasts away,
  then slowly glides back. (iPhones ask permission for motion access the first
  time you tap; other phones just work. Tilt works in portrait.)

### It never gets in the way of navigating

- **Down arrow, Page Down, and the mouse wheel are never captured.**
- Game keys only work while the page is scrolled to the very top. Scroll even
  a little and every key behaves normally again.
- Keys are ignored while a link or button is focused, and when Ctrl, Cmd or
  Alt is held, so browser shortcuts still work.
- With "reduce motion" turned on in a visitor's system, there is no animation
  at all: one still frame, and no keys are captured.

### Performance

- Each frame draws a few hundred small rectangles and a handful of outlines.
  That's light work, but I haven't benchmarked it on a real phone, so if it
  ever feels heavy on an older device, lower the star counts at the top of
  `space.js`.
- Fewer stars on phones; pixel density capped at 1.5x.
- Frames only run while needed (hero visible, or you're scrolling). Idle page
  means nothing is running. Paused when the tab is hidden.

Tweak knobs live at the top of `space.js` (ship speed, bullet speed, star
counts and sizes, orbit speed). Colors live at the top of `style.css`.

## Deploying (GitHub Pages)

1. In your repo choose **Add file → Upload files** and drop the files in.
   GitHub asks to confirm overwriting; say yes.
2. Settings → Pages: confirm the source is your main branch.
3. Live in a minute or two at `https://yourusername.github.io`.
4. If it doesn't look updated, hard-refresh (Ctrl+Shift+R / Cmd+Shift+R) or try
   a private window. Browsers cache CSS and JS aggressively.
