# Jaiwant Bhushan — Portfolio Site

A single-page, animation-forward portfolio built from my resume: technology strategy
consulting, automation work, and a side-quest section for Vedic astrology consultations.

Pure HTML/CSS/JS — no build step, no framework. Deploys straight to GitHub Pages.

## Structure

```
.
├── index.html          Page markup (hero, about, skills, experience, astrology, contact)
├── css/style.css        Glassmorphism / cosmic-tech theme, bento grid, responsive layout
├── js/main.js            Typewriter hero text, scroll reveals (GSAP ScrollTrigger), canvas starfields
├── assets/favicon.svg    Site icon
└── README.md
```

## Before you deploy — swap these placeholders

| What | Where | Current value |
|---|---|---|
| WhatsApp consult link | `index.html` → `#astro` section | `wa.me/918009042224` (your resume phone) |
| Résumé PDF | `index.html` hero CTA "Download Résumé" | currently points to `#contact` — add your PDF to the repo and update the `href` |
| Social links | `index.html` footer | GitHub / LinkedIn / SoundCloud already wired to your real handles |
| Meta/OG description | `index.html` `<head>` | update if you want different SEO copy |

## Run locally

No build tools needed. Just serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a new GitHub repo (e.g. `jaiwant1996/portfolio`) and push this folder as the root.
2. In the repo: **Settings → Pages → Source → Deploy from branch → `main` / `/ (root)`**.
3. GitHub gives you a URL like `https://jaiwant1996.github.io/portfolio/`.

## Connect a custom domain

1. Buy a domain (Namecheap, GoDaddy, Google Domains, etc.).
2. In your DNS settings, add:
   - For an apex domain (`jaiwantbhushan.com`): four `A` records pointing to GitHub Pages IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - For a subdomain (`www.jaiwantbhushan.com`): a `CNAME` record pointing to `jaiwant1996.github.io`
3. In the repo: **Settings → Pages → Custom domain** → enter your domain → Save.
4. Add a `CNAME` file (just the domain, no protocol) to the repo root — GitHub creates this automatically when you save the custom domain in step 3, or you can add it manually.
5. Wait for DNS to propagate (a few minutes to a few hours), then enable **Enforce HTTPS** once the certificate is issued.

## Tech notes

- Fonts: Space Grotesk (headlines) + Inter (body) + JetBrains Mono (labels), via Google Fonts.
- Animation: GSAP 3 + ScrollTrigger (CDN) for scroll reveals; vanilla canvas for the starfield backgrounds; CSS-only for hover/glass effects.
- No dependencies to install, no `node_modules` — just static files.
