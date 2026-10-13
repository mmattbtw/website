import defaults from "#/data/referrals.json";
import { env } from "#/lib/env";

export interface Referral {
  name: string;
  url: string;
  benefit: string;
  reward?: string;
  code?: string;
  detailsUrl?: string;
  detailsLabel?: string;
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function isReferral(value: unknown): value is Referral {
  if (!value || typeof value !== "object") return false;
  const link = value as Record<string, unknown>;
  return (
    typeof link.name === "string" &&
    link.name.trim().length > 0 &&
    isHttpsUrl(link.url) &&
    typeof link.benefit === "string" &&
    link.benefit.trim().length > 0 &&
    ["reward", "code", "detailsLabel"].every(
      (key) => link[key] === undefined || typeof link[key] === "string",
    ) &&
    (link.detailsUrl === undefined || isHttpsUrl(link.detailsUrl))
  );
}

export async function getReferrals(): Promise<Referral[]> {
  const url = new URL(
    "/xrpc/com.atproto.repo.getRecord",
    env.NEXT_PUBLIC_BSKY_PDS,
  );
  url.searchParams.set("repo", env.NEXT_PUBLIC_BSKY_DID);
  url.searchParams.set("collection", "net.mmatt.support.referrals");
  url.searchParams.set("rkey", "self");

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      const { value } = await response.json();
      if (
        value?.$type === "net.mmatt.support.referrals" &&
        Array.isArray(value.links) &&
        value.links.every(isReferral)
      ) {
        return value.links;
      }
      console.warn("Invalid referrals record; using local referrals.");
    }
  } catch {
    console.warn("Referrals PDS unavailable; using local referrals.");
  }

  return defaults.links;
}
