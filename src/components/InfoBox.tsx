import * as v from "@atcute/lexicons/validations";
import { useEffect, useState, type ReactNode } from "react";

import { listRecords } from "../lib/atproto";
import { carSchema, playSchema, statusSchema } from "../lib/records";
import { BLUESKY_URL } from "../site";

/** Just enough of app.bsky.feed.post to tell replies apart, without the full lexicon. */
const blueskyPostSchema = v.object({
  $type: v.literal("app.bsky.feed.post"),
  text: v.string(),
  createdAt: v.datetimeString(),
  reply: v.optional(v.unknown()),
});

export interface LatestPost {
  title: string;
  description?: string;
  href: string;
  date: string;
}

export interface Film {
  title: string;
  link: string;
  date: string;
  review?: string;
}

interface Item {
  id: string;
  title: string;
  body: ReactNode;
}

interface Props {
  /** Known at build time, so it is passed in rather than fetched. */
  latestPost?: LatestPost;
}

const ROTATE_MS = 5000;
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

function formatDate(value: string | undefined) {
  return value ? dateFormat.format(new Date(value)) : "";
}

function truncate(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

function Muted({ children }: { children: ReactNode }) {
  return <p className="text-muted">{children}</p>;
}

/**
 * Loads each live source independently and in parallel. A source that fails
 * or is empty simply doesn't get a slide.
 */
function useLiveItems(): Partial<Record<string, Item>> {
  const [items, setItems] = useState<Partial<Record<string, Item>>>({});

  useEffect(() => {
    let active = true;

    const load = (id: string, task: () => Promise<Item | null>) => {
      task()
        .then((item) => {
          if (active && item) setItems((current) => ({ ...current, [id]: item }));
        })
        .catch((error) => console.warn(`info box: ${id} unavailable`, error));
    };

    load("car", async () => {
      const [entry] = await listRecords("net.mmatt.vitals.car", carSchema, 1);

      if (!entry) return null;

      const car = entry.value;

      return {
        id: "car",
        title: "my car",
        body: (
          <>
            <p>range: {car.carFuelRange} mi</p>
            <p>fuel: {Number(car.carPercentFuelRemaining).toFixed(1)}%</p>
            <p>remaining: {Number(car.amountRemaining).toFixed(1)} gal</p>
            <p>odometer: {car.carTraveledDistance.toLocaleString("en-US")} mi</p>
            <p>
              <a className="link" href="/car">
                view car stats
              </a>
            </p>
          </>
        ),
      };
    });

    load("bluesky", async () => {
      const posts = await listRecords("app.bsky.feed.post", blueskyPostSchema, 10);
      const post = posts.find((entry) => !entry.value.reply);

      if (!post) return null;

      return {
        id: "bluesky",
        title: "latest bluesky post",
        body: (
          <>
            <p>
              <a className="link" href={`${BLUESKY_URL}/post/${post.rkey}`}>
                {truncate(post.value.text || "(no text)", 100)}
              </a>
            </p>
            <Muted>{formatDate(post.value.createdAt)}</Muted>
          </>
        ),
      };
    });

    load("teal", async () => {
      const [entry] = await listRecords("fm.teal.feed.play", playSchema, 1);

      if (!entry) return null;

      const play = entry.value;
      const artist = play.artists?.map((a) => a.artistName).join(", ");

      return {
        id: "teal",
        title: "latest teal.fm play",
        body: (
          <>
            <p className="font-bold">
              {play.originUri ? (
                <a className="link" href={play.originUri}>
                  {play.trackName}
                </a>
              ) : (
                play.trackName
              )}
            </p>
            {artist ? <Muted>by {artist}</Muted> : null}
            <Muted>{formatDate(play.playedTime)}</Muted>
          </>
        ),
      };
    });

    load("letterboxd", async () => {
      const response = await fetch("/api/letterboxd");

      if (!response.ok) return null;

      const film: Film | null = await response.json();

      if (!film) return null;

      return {
        id: "letterboxd",
        title: "latest letterboxd watch",
        body: (
          <>
            <p>
              <a className="link" href={film.link}>
                {film.title}
              </a>
            </p>
            <Muted>{formatDate(film.date)}</Muted>
            {film.review ? <Muted>{truncate(film.review, 80)}</Muted> : null}
          </>
        ),
      };
    });

    load("status", async () => {
      const [entry] = await listRecords("net.mmatt.right.now", statusSchema, 1);

      if (!entry) return null;

      return {
        id: "status",
        title: "latest status",
        body: (
          <>
            <p className="font-bold">
              {entry.value.emoji ? `${entry.value.emoji} ` : ""}
              {entry.value.text}
            </p>
            <Muted>{formatDate(entry.value.createdAt)}</Muted>
            <p>
              <a className="link" href="/right/now">
                all statuses
              </a>
            </p>
          </>
        ),
      };
    });

    return () => {
      active = false;
    };
  }, []);

  return items;
}

/** A small rotating card of what I've been up to, fed by live ATProto reads. */
export default function InfoBox({ latestPost }: Props) {
  const live = useLiveItems();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const blog: Item | undefined = latestPost && {
    id: "blog",
    title: "latest blog post",
    body: (
      <>
        <p>
          <a className="link" href={latestPost.href}>
            {latestPost.title}
          </a>
        </p>
        {latestPost.description ? <Muted>{truncate(latestPost.description, 90)}</Muted> : null}
        <Muted>{formatDate(latestPost.date)}</Muted>
      </>
    ),
  };

  const items = [live.car, blog, live.bluesky, live.teal, live.letterboxd, live.status].filter(
    (item): item is Item => item !== undefined,
  );

  const current = items.length > 0 ? index % items.length : 0;

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (paused || reducedMotion || items.length < 2) return;

    const timer = window.setInterval(() => setIndex((i) => i + 1), ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [paused, items.length]);

  if (items.length === 0) return null;

  return (
    <section
      aria-label="what i'm up to"
      aria-roledescription="carousel"
      className="border-ink bg-paper relative h-48 w-56 overflow-hidden rounded-lg border-2 text-xs"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="flex h-full w-full shrink-0 flex-col px-5 pt-3 pb-7"
            aria-hidden={i !== current}
            inert={i !== current}
          >
            <h2 className="mb-2 text-sm font-bold">{item.title}</h2>
            <div className="flex-1 space-y-1 overflow-hidden">{item.body}</div>
          </div>
        ))}
      </div>

      {items.length > 1 ? (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`show ${item.title}`}
              aria-current={i === current}
              onClick={() => setIndex(i)}
              className={`border-ink size-2 cursor-pointer rounded-full border ${i === current ? "bg-ink" : "bg-paper"}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
