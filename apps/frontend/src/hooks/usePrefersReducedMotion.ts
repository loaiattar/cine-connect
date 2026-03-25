import { useEffect, useState } from "react";

/**
 * `true` when the user prefers reduced motion (OS / browser setting).
 * Used for landing skew hero (#332) and other vestibular-sensitive UI.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
