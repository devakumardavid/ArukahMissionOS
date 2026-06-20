import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arukah MissionOS | Internal case management",
  description: "Arukah's internal workspace for accountable assistance case management."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
