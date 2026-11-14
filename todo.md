# todo

Things the old Next.js site had that didn't make it into the rewrite yet.

- [ ] **/purge page.** The old one revalidated cached pages behind a password. The equivalent now
      is a small password-protected on-demand route that calls `Astro.cache.invalidate({ path })`
      (or by tag) so an edit shows up before the route cache expires.
- [ ] **Per-post view counts.** The old site queried the Plausible API (`/api/v2/query`, filtered
      by `event:page`) on the server. It fits as an on-demand fetch inside the already-cached post
      pages. Needs a `PLAUSIBLE_API_KEY` secret, and
      plausible.mmatt.net back up (it returned 521 on 2026-11-13).
- [ ] **Live car updates.** The old /car page subscribed to Jetstream
      (`wantedCollections=net.mmatt.vitals.car`) and appended new readings as they arrived. Add it
      back to `src/components/CarStats.tsx` once there's a new car sending data.
- [ ] **Social cards for brand-new posts.** Cards are drawn at build time; a post published after
      the last deploy uses the site card until the next push. Drawing them on demand needs Workers
      Paid (rasterizing takes more than the free plan's 10ms CPU).
