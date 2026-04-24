import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

// Load the ABCDiatype font (Regular and Bold only)
const abcdDiatype = localFont({
  src: [
    { path: "./fonts/ABCDiatype-Regular.otf", weight: "400" },
    { path: "./fonts/ABCDiatype-Bold.otf", weight: "700" },
  ],
  variable: "--font-abcd-diatype",
});

// Load the Reckless font (Regular and Medium only)
const reckless = localFont({
  src: [
    { path: "./fonts/RecklessTRIAL-Regular.woff2", weight: "400" },
    { path: "./fonts/RecklessTRIAL-Medium.woff2", weight: "500" },
  ],
  variable: "--font-reckless",
});

export const metadata: Metadata = {
  title: 'The Ripper - Rips Facts from Fiction',
  description: 'Detect Hallucinations in Your Content Instantly for Free.',
  metadataBase: new URL('https://the-ripper-omega.vercel.app/'),

  // Favicon
  icons: {
    icon: '/favicon1.ico',
    shortcut: '/favicon1.ico',
    apple: '/favicon1.ico',
  },

  // Open Graph
  openGraph: {
    title: 'The Ripper - Rips Facts from Fiction',
    description: 'Detect Hallucinations in Your Content Instantly for Free.',
    url: 'https://the-ripper-omega.vercel.app/',
    siteName: 'The Ripper',
    images: [
      {
        url: '/opengraph-image.jpg',
        width: 1200,
        height: 630,
        alt: 'The Ripper - Hallucinations Detector',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'The Ripper - Rips Facts from Fiction',
    description: 'Detect Hallucinations in Your Content Instantly for Free.',
    images: ['https://the-ripper-omega.vercel.app/opengraph-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${abcdDiatype.variable} ${reckless.variable} antialiased`}
      >
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <rect x="2" y="2" width="36" height="36" rx="4" fill="#254bf1"/>
                <path d="M8 12L20 20L32 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 20L20 28L32 20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 16L20 20L26 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
              </svg>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter leading-none text-brand-default">
                  THE RIPPER
                </span>
                <span className="text-xs font-medium tracking-widest uppercase text-gray-600">
                  Rips facts from fiction
                </span>
              </div>
            </Link>
            <Link
              href="https://github.com/drewsephski/the-ripper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-700 hover:text-brand-default transition-colors"
            >
              GitHub
            </Link>
          </div>
        </nav>
        {children}
        <Analytics />
      </body>
    </html>
  );
}