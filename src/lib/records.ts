/**
 * Schemas for the records the site reads that don't ship with an @atcute
 * definition package. Each one only describes the fields we actually use;
 * anything else on the record is ignored.
 */
import * as v from "@atcute/lexicons/validations";
import type { InferOutput } from "@atcute/lexicons/validations";

/** My statuslog: net.mmatt.right.now */
export const statusSchema = v.object({
  $type: v.literal("net.mmatt.right.now"),
  text: v.string(),
  emoji: v.optional(v.string()),
  createdAt: v.datetimeString(),
});

export type Status = InferOutput<typeof statusSchema>;

/** Car telemetry: net.mmatt.vitals.car */
export const carSchema = v.object({
  $type: v.literal("net.mmatt.vitals.car"),
  createdAt: v.datetimeString(),
  carFuelRange: v.integer(),
  carPercentFuelRemaining: v.string(),
  amountRemaining: v.string(),
  carTraveledDistance: v.integer(),
  carMake: v.optional(v.string()),
  carModel: v.optional(v.string()),
  carYear: v.optional(v.integer()),
});

export type CarReading = InferOutput<typeof carSchema>;

/** A teal.fm scrobble: fm.teal.feed.play */
export const playSchema = v.object({
  $type: v.literal("fm.teal.feed.play"),
  trackName: v.string(),
  artists: v.optional(v.array(v.object({ artistName: v.string() }))),
  releaseName: v.optional(v.string()),
  originUri: v.optional(v.string()),
  playedTime: v.optional(v.datetimeString()),
});

export type Play = InferOutput<typeof playSchema>;

/** My referral links: net.mmatt.support.referrals (rkey "self") */
export const referralSchema = v.object({
  name: v.string(),
  url: v.genericUriString(),
  benefit: v.string(),
  reward: v.optional(v.string()),
  code: v.optional(v.string()),
  detailsUrl: v.optional(v.genericUriString()),
  detailsLabel: v.optional(v.string()),
});

export const referralsSchema = v.object({
  $type: v.literal("net.mmatt.support.referrals"),
  links: v.array(referralSchema),
});

export type Referral = InferOutput<typeof referralSchema>;
