# todo

Things the old Next.js site had that didn't make it into the rewrite yet.

- [ ] **/purge page.** The old one revalidated cached pages behind a password. On the static site,
      the equivalent is "rebuild now": a small password-protected on-demand route that triggers the
      `deploy` workflow (`workflow_dispatch`) so new posts don't wait for the hourly build.
- [ ] **Per-post view counts.** The old site queried the Plausible API (`/api/v2/query`, filtered
      by `event:page`) on the server. Options: fetch at build time (counts refresh hourly) or add an
      on-demand route with a cached response. Needs a `PLAUSIBLE_API_KEY` secret, and
      plausible.mmatt.net back up (it returned 521 on 2026-11-13).
- [ ] **Live car updates.** The old /car page subscribed to Jetstream
      (`wantedCollections=net.mmatt.vitals.car`) and appended new readings as they arrived. Add it
      back to `src/components/CarStats.tsx` once there's a new car sending data.
