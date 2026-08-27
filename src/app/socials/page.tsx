import type { Metadata } from "next";

import Link from "#/components/ui/link";

import CopyAddress from "../support/copy-address";

export const metadata: Metadata = {
  title: "all over the web · mmatt.net",
  description: "matt on the world wide web.",
};

type SocialLink = {
  label: string;
  href: string;
  note?: string;
};

const links: Array<{ heading: string; items: SocialLink[] }> = [
  {
    heading: "in the atmosphere",
    items: [
      {
        label: "bluesky",
        href: "https://bsky.app/profile/did:plc:tas6hj2xjrqben5653v5kohk",
      },
      { label: "leaflet", href: "https://mat.leaflet.pub" },
      {
        label: "tangled",
        href: "https://tangled.org/did:plc:tas6hj2xjrqben5653v5kohk",
      },
      {
        label: "stream.place",
        href: "https://stream.place/did:plc:tas6hj2xjrqben5653v5kohk",
      },
      {
        label: "grain",
        href: "https://grain.social/profile/did:plc:tas6hj2xjrqben5653v5kohk",
      },
    ],
  },
  {
    heading: "social",
    items: [
      { label: "github", href: "https://github.com/mmattbtw" },
      { label: "youtube", href: "https://youtube.com/@mmattbtw" },
      {
        label: "youtube, again",
        href: "https://www.youtube.com/channel/UC7Nw_QSHgxe8kiKvJoh_B8g",
      },
      { label: "twitch", href: "https://twitch.tv/mmattbtw" },
      {
        label: "letterboxd",
        href: "https://letterboxd.com/Air2Earth/",
      },
      {
        label: "mastodon",
        href: "https://wetdry.world/@matt",
      },
      {
        label: "are.na",
        href: "https://www.are.na/matt-from-the-internet/channels",
      },
      {
        label: "linkedin",
        href: "https://www.linkedin.com/in/mmattmorris",
      },
      { label: "twitter", href: "https://twitter.com/mmatt" },
    ],
  },
  {
    heading: "music",
    items: [
      {
        label: "apple music",
        href: "https://music.apple.com/profile/air2earth",
      },
      {
        label: "soundcloud",
        href: "https://soundcloud.com/maaaaaaaatt",
      },
      { label: "last.fm", href: "https://last.fm/user/mmattbtw" },
      { label: "discogs", href: "https://www.discogs.com/user/mmattbtw" },
      { label: "bandcamp", href: "https://bandcamp.com/mmattbtw" },
    ],
  },
  {
    heading: "games",
    items: [
      { label: "steam", href: "https://steamcommunity.com/id/m5tt" },
      { label: "3icecream", href: "https://3icecream.com/profile/mmatt" },
      {
        label: "etterna",
        href: "https://etternaonline.com/users/mmatt",
      },
    ],
  },
];

const inactiveLinks: SocialLink[] = [
  { label: "arcade twitter", href: "https://twitter.com/mmatt_a" },
  { label: "musicboard", href: "https://musicboard.app/mmatt" },
  { label: "serializd", href: "https://www.serializd.com/user/mmatt" },
  { label: "cohost", href: "https://cohost.org/mmatt" },
  {
    label: "vrchat",
    href: "https://vrchat.com/home/user/usr_8b5fa06c-6959-4c7c-854c-7315f682b196",
  },
  { label: "liberapay", href: "https://liberapay.com/mmatt" },
  { label: "rate your music", href: "https://rateyourmusic.com/~mmattbtw" },
  { label: "pixelfed", href: "https://pixelfed.social/mmatt" },
  { label: "spacehey", href: "https://spacehey.com/mmatt" },
  {
    label: "@lyrical@botsin.space",
    href: "https://botsin.space/@lyrical",
  },
  { label: "read.cv", href: "https://read.cv/mmatt" },
  { label: "polywork", href: "https://poly.me/mmatt" },
  { label: "gamelib", href: "https://gamelib.app/matt" },
  { label: "osu!", href: "https://osu.ppy.sh/u/mmatt" },
  { label: "threads", href: "https://www.threads.net/@mmattbtw" },
  {
    label: "spotify",
    href: "https://open.spotify.com/user/7d10h3nf02z86ynw8se5j1jjz",
  },
];

function SocialList({ items }: { items: SocialLink[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} rel="me">
            {item.label}
          </Link>
          {item.note ? ` (${item.note})` : null}
        </li>
      ))}
    </ul>
  );
}

export default function SocialsPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-148 space-y-4 pt-1.5 pl-1.5">
        <h1 className="bg-white font-bold text-black dark:bg-black dark:text-white">
          ˙⋆✮ matt on the world wide web ✮⋆˙
        </h1>
        <p>
          <Link href="/">&lt;&lt; back home</Link>
        </p>

        {links.map((group) => (
          <section key={group.heading}>
            <h2 className="font-bold">{group.heading}</h2>
            <SocialList items={group.items} />
            {group.heading === "games" ? (
              <CopyAddress label="nintendo switch" address="2840-8938-2785" />
            ) : null}
          </section>
        ))}

        <section>
          <h2 className="font-bold">mail me</h2>
          <ul>
            <li>
              <Link href="mailto:matt@mmatt.net" rel="me">
                matt@mmatt.net
              </Link>
            </li>
            <li>
              <Link href="mailto:matt@teal.fm" rel="me">
                matt@teal.fm
              </Link>
            </li>
            <li>
              <Link href="mailto:matt@opn.haus" rel="me">
                matt@opn.haus
              </Link>
            </li>
            <li>
              <Link
                href="https://signal.me/#eu/-zdncvcvRKXt0pUbrDcQ3cR-LaR2QHsL6HTp_KmWWxUNWQHl-T9Ab7-2hpk1Kk69"
                rel="me"
              >
                signal
              </Link>
            </li>
          </ul>
        </section>

        <p>
          <Link href="/support">♡ support me</Link>
        </p>

        <details className="pb-4">
          <summary className="cursor-pointer underline">
            inactive profiles
          </summary>
          <div className="pt-4">
            <SocialList items={inactiveLinks} />
            <p>xbox: @mmattbtw</p>
          </div>
        </details>
      </div>
    </main>
  );
}
