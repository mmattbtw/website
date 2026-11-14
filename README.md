# mmatt.net

My personal site. [Astro](https://astro.build) with React islands, deployed to Cloudflare Workers.
Content comes from my [ATProto](https://atproto.com) repo.

The previous Next.js version lives at [mmattbtw/old-website](https://github.com/mmattbtw/old-website).

## How it works

- **Static by default.** Every page is prerendered at build time. Writing, statuses, car stats,
  referrals and sponsors are all fetched during the build.
- **Islands for interactivity.** React components hydrate only where needed: the dithered video
  backgrounds, the live info box on the home page, copy-to-clipboard buttons, and the car charts.
- **One on-demand route.** `/api/letterboxd` runs in the Worker because Letterboxd's RSS has no
  CORS headers. Everything else in the info box reads the PDS directly from the browser.
- **Redirects and headers** live in `astro.config.mjs` (`redirects`) and `public/_headers`. The
  Cloudflare adapter turns the redirects into a `_redirects` file, so they're served before the
  Worker runs.

Because pages are static, new posts appear on the next build. The `deploy` workflow builds hourly.

## Layout

```
src/
  site.ts              DID, PDS, publication URI, names and links
  lib/
    atproto.ts         typed listRecords / getRecord with schema validation
    records.ts         schemas for net.mmatt.*, fm.teal.* and referral records
    posts.ts           site.standard.document → Post
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
bun run dev        # astro dev, running in workerd
bun run check      # astro check + oxlint (with the anti-slop rules) + prettier
bun run preview    # build, then serve the real Worker with wrangler
bun run deploy     # build and deploy with wrangler
```

`GITHUB_TOKEN` (optional, at build time) lists GitHub sponsors on `/support`. Put it in `.env`
locally.

## Deploying

The `deploy` workflow builds on push, on a schedule and on demand. It deploys `main` when these repo
secrets are set:

- `CLOUDFLARE_API_TOKEN`: a token with the "Edit Cloudflare Workers" template
- `CLOUDFLARE_ACCOUNT_ID`
- `SPONSORS_TOKEN` (optional): a GitHub token that can read sponsors

The Worker is named `mmatt-net`. To serve the site at mmatt.net, add the domain under the Worker's
**Settings → Domains & Routes** once DNS is on Cloudflare.

## Adding ATProto sign-in later

The site is set up so OAuth can be added without restructuring:

1. Remove `session: false` from `astro.config.mjs`. The Cloudflare adapter then provisions a
   `SESSION` KV namespace for Astro sessions.
2. Add [`@atcute/oauth-browser-client`](https://github.com/mary-ext/atcute) for a browser-only
   flow, or an on-demand route (`export const prerender = false`) for a confidential client. Serve
   `client-metadata.json` from `public/`.
3. Keep read paths on `src/lib/atproto.ts`. An authenticated `Client` takes the same `get`/`post`
   calls as the public `pds` client.
