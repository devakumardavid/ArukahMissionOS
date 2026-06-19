import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arukah MissionOS",
  description: "Accountable compassion from verified need to measurable impact."
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
