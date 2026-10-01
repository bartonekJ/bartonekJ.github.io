# byBARTONEK website

Static public website for [bybartonek.com](https://bybartonek.com).

The production pages use plain HTML, CSS and JavaScript. GitHub Pages applies its native Jekyll build only to the Markdown update collection and the small Liquid-powered latest-updates rail; no custom deployment workflow is required.

Update entries live in `_updates/`. Each published entry receives its own `/updates/<slug>/` page and can appear in the latest-updates rail on the homepage. Product archives, such as `/jb-drill/updates/`, filter the same collection by the `product` front matter field.

## Publishing updates

Updates can be edited without touching Markdown through [Pages CMS](https://app.pagescms.org/):

1. Sign in with GitHub and install the Pages CMS GitHub App only for this repository.
2. Open the repository and choose **Updates**.
3. Create an entry, check the generated filename/URL slug and fill in the form.
4. Keep **Published** off while the entry is a draft. Saving still stores the draft in GitHub, but Jekyll does not expose it on the website.
5. Turn **Published** on and save when the entry is ready. GitHub Pages then rebuilds the site and adds it to the product archive and, according to its date, the homepage carousel.

Uploaded update images are stored in `assets/updates/`. Large videos stay outside the CMS; link to an existing web asset or external video from the article or CTA instead. Every CMS save is a normal Git commit and can be reviewed or reverted in GitHub.

## Design and content

- [Visual style guide](STYLE_GUIDE.md) — current colors, typography, page structure, components and responsive rules.
- [Interactive hero and editor](experiments/hero-atom/README.md) — the homepage uses the procedural 3D atom; the isolated editor keeps its live controls and exportable presets. Three.js is vendored locally.
