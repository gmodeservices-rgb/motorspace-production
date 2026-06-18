import type { ImgHTMLAttributes } from "react";

import verifiedImage from "@/assets/verified.png";
import { cn } from "@/lib/utils";

export function VerifiedIcon({
  className,
  alt = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={verifiedImage}
      alt={alt}
      className={cn("inline-block shrink-0 object-contain", className)}
      {...props}
    />
  );
}
