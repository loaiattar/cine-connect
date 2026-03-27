import { cn } from "@/lib/utils";

type RoundedAvatarImageProps = {
  src: string;
  alt: string;
  /** Tailwind size, e.g. `h-9 w-9`, `h-10 w-10`, `h-20 w-20` */
  sizeClassName: string;
  ringClassName?: string;
  className?: string;
};

/**
 * Clips the image to a circle reliably (`overflow-hidden` on a square box).
 * Use instead of `rounded-full` on `<img>` alone, which can render as an oval when stretched in flex layouts.
 */
export function RoundedAvatarImage({
  src,
  alt,
  sizeClassName,
  ringClassName = "ring-1 ring-[var(--glass-border)]",
  className,
}: RoundedAvatarImageProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full",
        ringClassName,
        sizeClassName,
        className
      )}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" decoding="async" />
    </span>
  );
}
