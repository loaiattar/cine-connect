import { useEffect, useMemo, useRef, useState } from "react";

import { cn, getMovieImageUrl } from "@/lib/utils";

const POSTER_SIZE = "w342" as const;
const ROW_COUNT = 6;
/** Enough tiles per row so `flex-1` fills ultra-wide viewports without a right gutter. */
const MIN_POSTERS_PER_ROW = 28;

/** Always-on cinematic tilt when motion is allowed; scroll velocity adds on top. */
const BASE_SKEW_DEG = -4;

/**
 * Scroll-driven + subtly drifting poster field.
 *
 * **Reduced motion:** no skew, no row drift (`.motion-reduce` disables CSS animations).
 */
export function LandingSkewPosterBackdrop({
  posterPaths,
  reducedMotion,
  className,
}: {
  posterPaths: string[];
  reducedMotion: boolean;
  className?: string;
}) {
  const [scrollSkewExtra, setScrollSkewExtra] = useState(0);
  const skewExtraRef = useRef(0);
  const lastScrollRef = useRef({ y: 0, t: 0 });

  const rows = useMemo(() => {
    const valid = posterPaths.filter(Boolean);
    if (valid.length === 0) return [] as string[][];
    const pool: string[] = [];
    const minPool = ROW_COUNT * MIN_POSTERS_PER_ROW;
    while (pool.length < minPool) {
      pool.push(...valid);
    }
    const out: string[][] = [];
    let i = 0;
    for (let r = 0; r < ROW_COUNT; r++) {
      const row: string[] = [];
      const count = MIN_POSTERS_PER_ROW + (r % 4);
      for (let c = 0; c < count; c++) {
        row.push(pool[i % pool.length]!);
        i++;
      }
      out.push(row);
    }
    return out;
  }, [posterPaths]);

  useEffect(() => {
    if (reducedMotion || rows.length === 0) {
      skewExtraRef.current = 0;
      return;
    }

    lastScrollRef.current = { y: window.scrollY, t: performance.now() };

    let raf = 0;
    const tick = () => {
      skewExtraRef.current *= 0.9;
      if (Math.abs(skewExtraRef.current) < 0.03) skewExtraRef.current = 0;
      setScrollSkewExtra(skewExtraRef.current);
      if (Math.abs(skewExtraRef.current) > 0.02) {
        raf = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const { y: ly, t: lt } = lastScrollRef.current;
      const dt = Math.max(now - lt, 1);
      const dy = y - ly;
      lastScrollRef.current = { y, t: now };

      const velocity = dy / dt;
      const impulse = Math.max(-6, Math.min(6, velocity * 0.55));
      skewExtraRef.current = skewExtraRef.current * 0.65 + impulse * 0.35;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion, rows.length]);

  if (rows.length === 0) return null;

  const totalSkew = reducedMotion ? 0 : BASE_SKEW_DEG + scrollSkewExtra;
  /** Wider than 100vw + centered so skew/scale never leaves a bare edge on the right. */
  const transformStyle = reducedMotion
    ? { transform: "translate(-50%, -50%)" }
    : {
        transform: `translate(-50%, -50%) skewY(${totalSkew.toFixed(2)}deg) scale(1.08)`,
      };

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 overflow-hidden",
        reducedMotion && "motion-reduce",
        className,
      )}
      aria-hidden
    >
      <div
        className={cn(
          "absolute left-1/2 top-1/2 flex w-[min(165vw,2800px)] min-w-[135vw] max-w-none flex-col justify-center gap-1.5 sm:gap-2",
          !reducedMotion && "will-change-transform",
        )}
        style={transformStyle}
      >
        {rows.map((paths, rowIndex) => (
          <div
            key={rowIndex}
            className="landing-poster-row w-full min-w-full overflow-hidden"
          >
            <div className="landing-poster-row-track">
              {paths.map((path, i) => (
                <div
                  key={`${rowIndex}-${i}`}
                  className="relative aspect-[2/3] h-[clamp(88px,16vh,200px)] min-h-[88px] min-w-[52px] flex-1 basis-0 overflow-hidden rounded-md shadow-md shadow-black/50 sm:min-w-[58px] sm:rounded-lg"
                >
                  <img
                    src={getMovieImageUrl(path, POSTER_SIZE)}
                    alt=""
                    width={120}
                    height={180}
                    loading={rowIndex === 0 && i < 6 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
