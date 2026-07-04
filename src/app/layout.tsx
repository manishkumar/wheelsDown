import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wheels Down — Know Before the Airline Tells You",
  description:
    "Real-time flight delay checker and pickup tracker. See delays hours early. Know exactly when to leave for pickup.",
  openGraph: {
    title: "Wheels Down — Real-time Flight Tracker",
    description:
      "See delays hours early. Know exactly when to leave for pickup.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
