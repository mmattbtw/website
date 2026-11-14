import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  /** Size of one dithered "pixel", in source pixels. */
  pixelSize?: number;
  maxFps?: number;
  /** Source frames are scaled down to at most this width before dithering. */
  maxWidth?: number;
  className?: string;
}

const NOISE = 20;

/** Threshold each pixel to black or white, with a little noise so it shimmers. */
function dither(image: ImageData) {
  const { data } = image;

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const value = gray < 128 + (Math.random() - 0.5) * NOISE ? 0 : 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }
}

/**
 * Plays a muted, looping video through a 1-bit dither. The canvas is drawn at
 * low resolution and scaled up by CSS with `image-rendering: pixelated`.
 *
 * With reduced motion it shows a single still frame instead of playing.
 */
export default function DitheredVideo({
  src,
  pixelSize = 4,
  maxFps = 12,
  maxWidth = 1000,
  className = "",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true, alpha: false });

    if (!video || !canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastDraw = 0;

    const draw = () => {
      if (video.videoWidth === 0) return;

      const width = Math.max(1, Math.floor(Math.min(video.videoWidth, maxWidth) / pixelSize));
      const height = Math.max(1, Math.round((width * video.videoHeight) / video.videoWidth));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      try {
        // The video has an alpha channel. Without clearing to black first, each
        // frame composites over the last and the comet smears into a ring.
        context.fillStyle = "#000";
        context.fillRect(0, 0, width, height);
        context.drawImage(video, 0, 0, width, height);
        const image = context.getImageData(0, 0, width, height);
        dither(image);
        context.putImageData(image, 0, 0);
      } catch {
        // The canvas is tainted (the video host dropped CORS). Fall back to the raw video.
        stop();
        setFailed(true);
      }
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);

      if (now - lastDraw < 1000 / maxFps) return;
      lastDraw = now;
      draw();
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const sync = () => {
      if (reducedMotion.matches || document.hidden) {
        stop();
        video.pause();

        if (reducedMotion.matches) draw();

        return;
      }

      video.play().catch(() => {});

      if (!frame) frame = requestAnimationFrame(tick);
    };

    video.addEventListener("loadeddata", sync);
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", sync);
    sync();

    return () => {
      stop();
      video.removeEventListener("loadeddata", sync);
      document.removeEventListener("visibilitychange", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, [maxFps, maxWidth, pixelSize]);

  return (
    <div aria-hidden="true" className={`h-dvh w-screen overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        src={src}
        crossOrigin="anonymous"
        muted
        loop
        playsInline
        preload="auto"
        className={
          failed ? "size-full object-cover grayscale" : "invisible absolute inset-0 size-full"
        }
      />
      <canvas
        ref={canvasRef}
        className={failed ? "hidden" : "size-full object-cover [image-rendering:pixelated]"}
      />
    </div>
  );
}
