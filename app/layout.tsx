import type { Metadata } from "next";
import "./globals.css";
import "./ipad.css";

export const metadata: Metadata = {
  title: "MN Maldives | Job Portal",
  description: "Secure administrative job tracking from customer brief to delivery.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
