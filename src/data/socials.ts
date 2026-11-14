import { DID } from "../site";

export interface SocialLink {
  label: string;
  href: string;
}

export interface SocialGroup {
  heading: string;
  items: SocialLink[];
  /** Extra copyable handle shown under the group. */
  copy?: { label: string; value: string };
}

export const groups: SocialGroup[] = [
  {
    heading: "in the atmosphere",
    items: [
      { label: "bluesky", href: `https://bsky.app/profile/${DID}` },
      { label: "leaflet", href: "https://mat.leaflet.pub" },
      { label: "tangled", href: `https://tangled.org/${DID}` },
      { label: "stream.place", href: `https://stream.place/${DID}` },
      { label: "grain", href: `https://grain.social/profile/${DID}` },
    ],
  },
  {
    heading: "social",
    items: [
      { label: "github", href: "https://github.com/mmattbtw" },
      { label: "youtube", href: "https://youtube.com/@mmattbtw" },
      { label: "youtube, again", href: "https://www.youtube.com/channel/UC7Nw_QSHgxe8kiKvJoh_B8g" },
      { label: "twitch", href: "https://twitch.tv/mmattbtw" },
      { label: "letterboxd", href: "https://letterboxd.com/Air2Earth/" },
      { label: "mastodon", href: "https://wetdry.world/@matt" },
      { label: "are.na", href: "https://www.are.na/matt-from-the-internet/channels" },
      { label: "linkedin", href: "https://www.linkedin.com/in/mmattmorris" },
      { label: "twitter", href: "https://twitter.com/mmatt" },
    ],
  },
  {
    heading: "music",
    items: [
      { label: "apple music", href: "https://music.apple.com/profile/air2earth" },
      { label: "soundcloud", href: "https://soundcloud.com/maaaaaaaatt" },
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
      { label: "etterna", href: "https://etternaonline.com/users/mmatt" },
    ],
    copy: { label: "nintendo switch", value: "2840-8938-2785" },
  },
];

export const mail: SocialLink[] = [
  { label: "matt@mmatt.net", href: "mailto:matt@mmatt.net" },
  { label: "matt@teal.fm", href: "mailto:matt@teal.fm" },
  { label: "matt@opn.haus", href: "mailto:matt@opn.haus" },
  {
    label: "signal",
    href: "https://signal.me/#eu/-zdncvcvRKXt0pUbrDcQ3cR-LaR2QHsL6HTp_KmWWxUNWQHl-T9Ab7-2hpk1Kk69",
  },
];

export const inactive: SocialLink[] = [
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
  { label: "@lyrical@botsin.space", href: "https://botsin.space/@lyrical" },
  { label: "read.cv", href: "https://read.cv/mmatt" },
  { label: "polywork", href: "https://poly.me/mmatt" },
  { label: "gamelib", href: "https://gamelib.app/matt" },
  { label: "osu!", href: "https://osu.ppy.sh/u/mmatt" },
  { label: "threads", href: "https://www.threads.net/@mmattbtw" },
  { label: "spotify", href: "https://open.spotify.com/user/7d10h3nf02z86ynw8se5j1jjz" },
];
