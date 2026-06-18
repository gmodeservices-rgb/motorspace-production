import type { ImgHTMLAttributes } from "react";

import whatsappImage from "@/assets/whatsapp.png";
import { cn } from "@/lib/utils";

export function WhatsAppIcon({
  className,
  alt = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={whatsappImage}
      alt={alt}
      className={cn("inline-block shrink-0 object-contain", className)}
      {...props}
    />
  );
}
