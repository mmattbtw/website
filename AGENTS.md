# Agent notes

Astro 7 + React islands on Cloudflare Workers (`@astrojs/cloudflare` v14). Use bun.

- Run `bun run check` before finishing. It runs `astro check`, oxlint with the vendored anti-slop
  rules in `tools/oxlint/anti-slop` (don't edit those), and prettier.
- Pages are prerendered. Only add `export const prerender = false` when a route truly needs a
  request (like `src/pages/api/letterboxd.ts`).
- Read ATProto records through `src/lib/atproto.ts` with a schema (`@atcute/lexicons/validations`),
  so records are validated, never cast.
- Use the `paper`, `ink`, `muted`, `rule` and `wash` colors and the `link` / `on-video` utilities
  from `src/styles/global.css`. The site is strictly monochrome.
- Astro wraps islands in `display: contents` elements. Wrap an island in a `<div>` when a parent uses
  `space-y-*`.
- Dev server: `astro dev --background`, managed with `astro dev stop|status|logs`.

Docs: https://docs.astro.build, https://developers.cloudflare.com/workers/
