// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField, fontProviders } from "astro/config";

// Old URLs that people (and feed readers) still link to. The Cloudflare
// adapter turns these into a `_redirects` file, so they are real 301s served
// before the Worker runs.
const legacyPosts = {
  itl_2025: "3lls32ikpkk2s",
  gg_usb: "3llrxjxkgws2s",
  mastodon: "3lls3oimpf22a",
  atd_v5: "3llrxgworic2s",
};

const fediverse = "https://fediverse.mmatt.net/.well-known";

export default defineConfig({
  site: "https://mmatt.net",
  output: "static",
  trailingSlash: "never",
  build: { format: "file" },

  adapter: cloudflare({
    // Pages are prerendered in Node so build-time data fetching can use
    // anything Node offers. On-demand routes still run in workerd.
    prerenderEnvironment: "node",
    // Images are optimized once at build time; there is no runtime resizing.
    imageService: "compile",
  }),

  // No sessions yet, so don't provision a KV namespace. Turn this back on
  // (and add a SESSION KV binding) when ATProto OAuth sign-in lands.
  session: false,

  integrations: [react()],

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      weights: [400, 700],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],

  env: {
    schema: {
      // Optional: lists GitHub sponsors on /support at build time.
      GITHUB_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },

  redirects: {
    "/blog": "/writing",
    "/weblog": "/writing",
    ...Object.fromEntries(
      Object.entries(legacyPosts).flatMap(([slug, rkey]) => [
        [`/blog/${slug}`, `/post/${rkey}`],
        [`/weblog/${slug}`, `/post/${rkey}`],
      ]),
    ),
    "/devices": "/uses",
    "/now": "/right/now",
    "/rss": "/rss.xml",
    "/dare": {
      status: 302,
      destination:
        "https://drive.google.com/file/d/1hHmM8-W3UGOW59W0yxuTkmVP2iBYiSyD/view?usp=sharing",
    },
    "/gglb": {
      status: 302,
      destination:
        "https://docs.google.com/spreadsheets/d/1yuRxzvOG0_wNut_5KY0fIoef2nQwYWUQBVmO8jQ_iTo/edit?usp=sharing",
    },
    "/.well-known/webfinger": `${fediverse}/webfinger`,
    "/.well-known/host-meta": `${fediverse}/host-meta`,
    "/.well-known/nodeinfo": `${fediverse}/nodeinfo`,
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
