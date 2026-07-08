# Alma Consort

Website for [Alma Consort](https://www.almaconsort.com), a professional chamber choir in London — concerts, studio recording services, the Alma Scholars programme, and supporter tiers.

## Stack

Static [Astro 5](https://astro.build) site. No client framework, no CMS — content is markdown in `src/content/`, validated by Zod schemas in `src/content.config.ts`. Deployed to GitHub Pages by `.github/workflows/deploy.yml` (push to `main`, plus a daily rebuild so event dates roll over).

## Development

```bash
npm install
npm run dev       # http://localhost:4321
npm run check     # typecheck
npm run build     # static build to dist/
npm run preview   # serve the build
```

## Docs

- `CLAUDE.md` — conventions, architecture, and gotchas (written for AI agents; useful for humans too)
- `.claude/skills/` — task guides: adding content, building components/pages, verification, SEO
- `docs/ROADMAP.md` — prioritized improvement backlog
