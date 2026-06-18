import logoSrc from "@/assets/logo.png";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  imageClassName,
}: {
  className?: string;
  imageClassName?: string;
}) {
  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      <img
        src={logoSrc}
        alt={site.name}
        className={cn("block h-12 w-12 object-contain", imageClassName)}
      />
    </span>
  );
}
