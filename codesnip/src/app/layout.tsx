import "~/styles/globals.css";

import { type Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";

import { Navbar } from "~/components/layout/Navbar";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "CodeSnip",
  description: "Manage and share code snippets.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="app-shell">
        <TRPCReactProvider>
          <Navbar />
          <div className="fade-in">{children}</div>
          <footer className="mx-auto mt-8 w-full max-w-6xl px-4 pb-8 text-center text-xs muted">
            Copyright {currentYear} CodeSnip. All rights reserved.
          </footer>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
