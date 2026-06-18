import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-hidden bg-background">
      <Navbar />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
