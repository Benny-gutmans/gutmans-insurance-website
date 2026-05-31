# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page marketing website for **Gutmans Insurance Brokerage** (Brooklyn, NY employee benefits broker). It is a static site built with **vanilla HTML, CSS, and JavaScript — no framework, no build step, no `package.json`, no dependencies to install.** The entire site is three hand-edited files plus image assets, served as static assets from **Cloudflare Workers**.

## File layout

- `index.html` — the entire page (nav, hero, services, why-us, testimonials, contact, footer, success modal). All content and SEO metadata live here.
- `styles.css` — all styling. Design tokens are CSS custom properties under `:root` (gold/cream palette, radii, shadows, `--transition`). Reuse these variables rather than hardcoding colors.
- `script.js` — all interactivity, wrapped in a single `DOMContentLoaded` handler: navbar scroll state, mobile drawer toggle, service tabs, accordions, animated stat counters, `IntersectionObserver` scroll-reveal (`[data-aos]` → `.visible`), smooth scroll, and contact-form submission.
- `logo.png`, `enrollment.png` — image assets referenced directly by filename.
- `robots.txt`, `sitemap.xml` — SEO; `sitemap.xml` lists only the single root URL.
- `wrangler.jsonc` — Cloudflare Workers config.

Fonts (Playfair Display, Cormorant Garamond, Lato) load from Google Fonts via `<link>` — there are no local font files. Headings use Playfair Display; body uses Lato.

## Local development & deployment

There is no build or test command. To preview, open `index.html` directly or serve the directory with any static server (e.g. `python3 -m http.server`).

Deployment is via Cloudflare Workers (Wrangler). `wrangler.jsonc` serves the repo root as static assets (`assets.directory: "."`) and binds the custom domains `gutmansinsurance.com` and `www.gutmansinsurance.com`. To deploy: `npx wrangler deploy` (Wrangler is run via `npx`; it is not a tracked dependency).

## Conventions & cross-cutting concerns

- **Tabs and accordions are CSS-class-driven.** JS only toggles `.active`; the show/hide behavior lives in `styles.css`. A tab button's `data-tab="x"` maps to the panel `#panel-x`. Accordions are single-open per group (opening one closes siblings).
- **Section anchors are the navigation contract.** Nav and footer links point to `#services`, `#contact`, etc. `html { scroll-padding-top }` offsets the fixed navbar — keep section `id`s and links in sync when renaming.
- **Stat counters** animate from `0` to the value in `data-target` (numbers ≥ 1000 get thousands separators). Edit `data-target`, not the displayed `0`.
- **Scroll-reveal:** add `data-aos` to any element to have it fade in when scrolled into view.
- **Contact form** (`#contact-form`) posts JSON to **FormSubmit.co** (`action="https://formsubmit.co/ajax/Benny@gutmansinsurance.com"`). On network/HTTP failure it falls back to opening a `mailto:` link. The hidden `_honey` field is an anti-spam honeypot — leave it. The recipient email appears in the form `action`, `script.js` fallback, and the JSON-LD block; update all three together if it changes.
- **SEO is duplicated by design.** Business details exist in three places in `index.html`: standard `<meta>`/Open Graph/Twitter tags, and the `InsuranceAgency` JSON-LD structured-data block. When changing business info (phone, hours, address, services, description), update all relevant copies plus `sitemap.xml`/`robots.txt` if URLs change.

## Git workflow

Active development branch for this work: `claude/claude-md-docs-2pAMU`. Commit and push there; do not open a pull request unless explicitly asked. The site is small enough that changes are made by editing the three core files directly.
