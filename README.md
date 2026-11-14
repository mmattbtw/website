# mmatt.net

My personal site. [Astro](https://astro.build) with React islands, deployed to Cloudflare Workers.
Content comes from my [ATProto](https://atproto.com) repo.

The previous Next.js version lives at [mmattbtw/old-website](https://github.com/mmattbtw/old-website).

## How it works

- **Data pages render on demand and are cached at the edge.** Home, writing, posts, RSS,
  `/right/now`, support and referrals read my PDS in the Worker. Astro's route cache
  (`routeRules` in `astro.config.mjs`, with the Cloudflare cache provider) keeps each response at
  Cloudflare's edge for a few minutes, then serves it stale while a fresh copy renders. New posts
  and statuses show up within minutes, with no rebuild.
- **Everything else is prerendered:** socials, uses, the privacy policies, `/car` (its data is
  frozen) and the social cards (`/og/*.png`, drawn with satori + sharp, which is too much CPU for a
  free-plan Worker). A post published after the last deploy uses the site card until the next one.
- **Islands for interactivity.** React components hydrate only where needed: the dithered video
  backgrounds, the live info box, copy-to-clipboard buttons, and the car charts. The info box reads
  the PDS straight from the browser; Letterboxd goes through `/api/letterboxd` because its RSS has
  no CORS headers.
- **Redirects and headers** live in `astro.config.mjs` (`redirects`) and `public/_headers`. The
  adapter turns the redirects into a `_redirects` file, so they're served before the Worker runs.

## Layout

```
src/
  site.ts              DID, PDS, publication URI, names and links
  lib/
    atproto.ts         typed listRecords / getRecord with schema validation
    records.ts         schemas for net.mmatt.*, fm.teal.* and referral records
    posts.ts           site.standard.document → Post
    highlight.ts       Shiki with a fixed set of grammars (runs in the Worker)
    og.tsx             social cards, rendered at build time
    leaflet.ts         Leaflet blocks → a small render tree
    richtext.ts        byte-indexed facets → styled segments
    bluesky.ts         embedded Bluesky posts, rendered statically
  components/          Astro components and React islands
  layouts/             Base (head/meta), Page (top-left column), Article (reading column)
  pages/               routes; *.md pages use layouts/Policy.astro
  data/                hand-edited lists (socials, uses, fallback referrals)
```

## Development

```sh
bun install
bun run dev        # astro dev, running in workerd (route caching is off in dev)
bun run check      # astro check + oxlint (with the anti-slop rules) + prettier
bun run preview    # build, then serve the real Worker with wrangler
```

## Deploying

[Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) deploys `main` on every
push (build: `bun run build`, deploy: `bunx wrangler deploy`). The `check` workflow on GitHub only
checks the code. The Worker is `mmatt-net`, served at mmatt.net and www.mmatt.net.

`GITHUB_TOKEN` (optional) lists GitHub sponsors on `/support`. Set it on the Worker with
`bunx wrangler secret put GITHUB_TOKEN`; locally, put it in `.dev.vars`.

## Adding ATProto sign-in later

The site is set up so OAuth can be added without restructuring:

1. Remove `session: false` from `astro.config.mjs`. The Cloudflare adapter then provisions a
   `SESSION` KV namespace for Astro sessions.
2. Add [`@atcute/oauth-browser-client`](https://github.com/mary-ext/atcute) for a browser-only
   flow, or an on-demand route (`export const prerender = false`) for a confidential client. Serve
   `client-metadata.json` from `public/`.
3. Keep read paths on `src/lib/atproto.ts`. An authenticated `Client` takes the same `get`/`post`
   calls as the public `pds` client.
