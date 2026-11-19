# Comic Portfolio

A vertical, scroll-scrubbed portfolio with a comic-book UI, a kunai cursor and click-to-strike lightning.

## Run it

Open `index.html` directly, or serve the folder locally (recommended so the browser loads the frame images reliably):

```bash
python -m http.server 3000
```

Then visit `http://localhost:3000`.

## What's where

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and the three scrub sections |
| `style.css` | Comic theme: halftone, ink panels, speech bubbles, impact bursts |
| `app.js` | Frame scrubbing, kunai cursor, lightning, reveals, counters |
| `content.js` | **All portfolio text — edit this to make it yours** |
| `profile.jpeg` | Your portrait on the cover |
| `cursor.cur` | Native kunai cursor fallback |
| `cursor-art/` | PNG frames extracted from the kunai cursor pack: idle, hover shine and spinning shuriken |
| `cursors/` | Extracted original `.ani` / `.cur` files from the cursor pack |
| `Minato-master/frames/` | Image sequences used as the scroll "video" |

## The frame "videos"

Each `.scrub` section in `index.html` plays an image sequence as you scroll:

```html
<section class="scrub" id="origin" data-dir="gaze" data-count="71">
```

- `data-dir` maps to `Minato-master/frames/<dir>/001.jpg …`
- `data-count` is the number of frames (padded to three digits)
- The three sequences are `gaze` (71), `rasengan` (33) and `flash` (35)

To use your own frames, drop numbered `.jpg` files into a folder under `Minato-master/frames/`, then update `data-dir` and `data-count`.

## Customising content

Everything visible — name, role, bio, stats, projects, skills, socials, email — lives in `content.js`. No HTML changes needed.

## Interaction notes

- Move the pointer: the kunai tilts into the movement and glows over links/panels.
- Click anywhere: lightning strikes, the screen flashes and shakes, sparks fly, and a comic word pops.
- Scroll: each chapter scrubs through its frame sequence like a video.
- `prefers-reduced-motion` shortens the scroll sections and removes the violent effects.
