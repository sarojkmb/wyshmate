import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "./components/site-header";

export const metadata: Metadata = {
  title: "Wyshmate",
  description: "Create and share celebration boards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
