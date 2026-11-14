import type { Did } from "@atcute/lexicons";

/** Everything that identifies me across the site, in one place. */
export const DID = "did:plc:tas6hj2xjrqben5653v5kohk" satisfies Did;

/** My PDS. Public reads go straight here, from the build and from browsers. */
export const PDS = "https://evil.gay";

export const PUBLICATION_URI =
  "at://did:plc:tas6hj2xjrqben5653v5kohk/site.standard.publication/3m2cfka6wcs2o";

/** standard.site documents from other people's repos that should show up in /writing. */
export const EXTERNAL_POSTS = [
  "at://did:plc:iwhuynr6mm6xxuh25o4do2tx/site.standard.document/3lzlwe6puis2l",
];

export const SITE_TITLE = "mmatt.net";
export const SITE_DESCRIPTION = "<_< ^_^ >_>";
export const DISPLAY_NAME = "˙⋆✮ matt ✮⋆˙";
export const EMAIL = "matt@mmatt.net";
export const FEDIVERSE_HANDLE = "@matt@wetdry.world";
export const FEDIVERSE_URL = "https://wetdry.world/@matt";
export const BLUESKY_URL = `https://bsky.app/profile/${DID}`;

export const VIDEOS = {
  home: "https://wh9xsi1isi.ufs.sh/f/3pCuYtORE70iQcTd1tzKQmgchpDLvW6HRVeJosuUikOnjwbf",
  writing: "https://wh9xsi1isi.ufs.sh/f/3pCuYtORE70iFh1vC2kQTmgCPNMpYynkzK4WXJelbq527Zjo",
};
