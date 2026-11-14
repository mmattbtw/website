/**
 * Social card images, rendered once at build time with satori (JSX → SVG)
 * and sharp (SVG → PNG). Imported only by the prerendered /og routes.
 */
import satori from "satori";
import sharp from "sharp";

import bold from "../assets/og/GoogleSansCode-Bold.ttf?inline";
import regular from "../assets/og/GoogleSansCode-Regular.ttf?inline";
import homeBackground from "../assets/og/home.png?inline";
import postBackground from "../assets/og/post.png?inline";
import { SITE_TITLE } from "../site";

const WIDTH = 1200;
const HEIGHT = 630;
const FRAME = 16;

/** Vite inlines assets as data URLs; satori wants the raw font bytes. */
function fontData(dataUrl: string): Buffer {
  return Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
}

const fonts = [
  { name: "Google Sans Code", data: fontData(regular), weight: 400 as const },
  { name: "Google Sans Code", data: fontData(bold), weight: 700 as const },
];

function titleSize(title: string): number {
  if (title.length > 70) return 56;
  if (title.length > 40) return 68;
  return 80;
}

function Card({ title }: { title?: string }) {
  return (
    // The black frame is the outer box's background showing around the inset card.
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#000",
      }}
    >
      <div
        style={{
          flex: 1,
          margin: FRAME,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 80px",
          backgroundColor: "#fff",
          backgroundImage: `url(${title ? postBackground : homeBackground})`,
          // Satori doesn't clip backgrounds, so size it to the inner box or it paints over the frame.
          backgroundSize: `${WIDTH - FRAME * 2}px ${HEIGHT - FRAME * 2}px`,
          color: "#000",
          fontFamily: "Google Sans Code",
          textAlign: "center",
        }}
      >
        {title ? (
          <>
            <div
              style={{
                backgroundColor: "#fff",
                padding: "8px 20px",
                fontSize: titleSize(title),
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: -1,
              }}
            >
              {title}
            </div>
            <div
              style={{ backgroundColor: "#fff", padding: "4px 12px", marginTop: 24, fontSize: 36 }}
            >
              {SITE_TITLE}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 96, letterSpacing: -1 }}>{SITE_TITLE}</div>
        )}
      </div>
    </div>
  );
}

/** A 1200×630 PNG with `title` on it, or the plain site card when there's no title. */
export async function renderCard(title?: string): Promise<Uint8Array> {
  const svg = await satori(<Card title={title} />, { width: WIDTH, height: HEIGHT, fonts });

  return new Uint8Array(await sharp(Buffer.from(svg)).png().toBuffer());
}
