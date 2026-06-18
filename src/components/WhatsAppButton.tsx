import { getWhatsAppUrl, site } from "@/data/site";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function WhatsAppButton({ message }: { message?: string }) {
  const href = message ? getWhatsAppUrl(message) : site.whatsappHref;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-4 z-50 block h-12 w-12 rounded-full shadow-2xl shadow-black/30 transition-transform hover:scale-110 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
    >
      <WhatsAppIcon className="h-full w-full rounded-full" />
    </a>
  );
}
