# Sam Williamson — Portfolio

Personal portfolio site.

## Content
All images, links, videos and descriptions from the site are exported to [`content/`](content):
- [`content/README.md`](content/README.md): every page's text with images and links, in site order
- [`content/content.json`](content/content.json): the same content as structured data
- [`content/images/`](content/images): 97 images, one folder per page

## Pages
Plain static HTML with no build step. `index.html` is the home page, `about.html` is the About page, and each project has its own page (for example `mandarena.html`). Shared effects are in `assets/site.js`, and project photos load from `content/images/`.

## Run locally
Run `python3 -m http.server` in this folder and open http://localhost:8000.

## Deploy
Connected to Vercel — every push to `main` redeploys automatically.
