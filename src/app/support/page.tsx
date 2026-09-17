import type { Metadata } from "next";
import Image from "next/image";

import Link from "#/components/ui/link";

import CopyAddress from "./copy-address";

export const metadata: Metadata = {
  title: "support · mmatt.net",
  description: "ways to financially support matt.",
};

const cashAppQr =
  "https://cash.app/qr/$mmatt625?size=288&margin=0&bg=FFFFFF&logoColor=00d64b&format=svg";
const bitcoinAddress = "bc1q736hpck9tvv36ml36dtjuf4cgucyrayvsyf0al";
const bitcoinLightningAddress = "gayguy@cake.cash";
const ethereumAddress = "0x1ACEeFc6581C7d8408BE5825e3b699351780d87d";
const moneroAddress =
  "82u5DMCg8G1Fjx5ECxiybp8SUWcvTCNeSCWPmfQ6KaSHYc1qfo2px63LLZAXWrEvHfgWXaTFojjyLeQU5cWay65bDxvqwZE";
const solanaAddress = "2DRNJ7Wb9FuGyFPBWgczJkPRbnrTaYfLUWNpyWPWNnVC";

// add manual supporters here; github sponsors are merged in automatically below
const manualSupporters: Supporter[] = [];

type Supporter = {
  name: string;
  url: string;
};

async function getGithubSponsors(): Promise<Supporter[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return [];

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "mmatt.net",
      },
      body: JSON.stringify({
        query: `
          query {
            user(login: "mmattbtw") {
              sponsors(first: 100) {
                nodes {
                  ... on User { login name url }
                  ... on Organization { login name url }
                }
              }
            }
          }
        `,
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];
    const result = (await response.json()) as {
      data?: {
        user?: {
          sponsors?: {
            nodes: Array<{ login: string; name: string | null; url: string }>;
          };
        };
      };
    };

    return (result.data?.user?.sponsors?.nodes ?? []).map((sponsor) => ({
      name: sponsor.name || sponsor.login,
      url: sponsor.url,
    }));
  } catch {
    return [];
  }
}

export default async function SupportPage() {
  const sponsors = [...(await getGithubSponsors()), ...manualSupporters];

  return (
    <main className="min-h-screen">
      <div className="max-w-148 space-y-4 pt-1.5 pl-1.5">
        <h1 className="bg-white font-bold text-black dark:bg-black dark:text-white">
          support me
        </h1>
        <p className="bg-white text-black dark:bg-black dark:text-white">
          if you enjoy my work, projects, or general internet presence, here are
          the places you can send a little support. thank you ♡
        </p>
        <section>
          <div className="flex max-w-80 items-center justify-between gap-4 bg-white pr-2 text-black dark:bg-black dark:text-white">
            <p>
              preferred:{" "}
              <Link href="https://cash.app/$mmatt625">cash.app/$mmatt625</Link>
            </p>
            <a
              href="https://cash.app/$mmatt625"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={cashAppQr}
                alt="cash app qr code for $mmatt625"
                width={250}
                height={250}
              />
            </a>
          </div>
        </section>

        <p>
          preferred:{" "}
          <Link href="https://github.com/sponsors/mmattbtw">
            github sponsors
          </Link>
        </p>
        <p>
          <Link href="https://ko-fi.com/mmatt">ko-fi</Link> (has paypal fees
          iirc)
        </p>
        <CopyAddress label="bitcoin" address={bitcoinAddress} />
        <CopyAddress
          label="bitcoin lightning"
          address={bitcoinLightningAddress}
        />
        <CopyAddress label="ethereum" address={ethereumAddress} />
        <CopyAddress label="monero" address={moneroAddress} />
        <CopyAddress label="solana" address={solanaAddress} />
        <section>
          <h2 className="font-bold">wall of fame</h2>
          <p>thank you to everyone who supports my work ♡</p>
          {sponsors.length > 0 ? (
            <ul>
              {sponsors.map((sponsor) => (
                <li key={sponsor.url}>
                  <Link href={sponsor.url}>{sponsor.name.toLowerCase()}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>be the first one here!</p>
          )}
        </section>
      </div>
    </main>
  );
}
