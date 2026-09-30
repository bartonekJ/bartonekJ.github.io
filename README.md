# byBARTONEK website

Static public website for [bybartonek.com](https://bybartonek.com).

The production pages use plain HTML, CSS and JavaScript. GitHub Pages applies its native Jekyll build only to the Markdown update collection and the small Liquid-powered latest-updates rail; no custom deployment workflow is required.

Update entries live in `_updates/`. Each published entry receives its own `/updates/<slug>/` page and can appear in the latest-updates rail on the homepage. Product archives, such as `/jb-drill/updates/`, filter the same collection by the `product` front matter field.

## Design and content

- [Visual style guide](STYLE_GUIDE.md) — current colors, typography, page structure, components and responsive rules.
- [Interactive hero and editor](experiments/hero-atom/README.md) — the homepage uses the procedural 3D atom; the isolated editor keeps its live controls and exportable presets. Three.js is vendored locally.
