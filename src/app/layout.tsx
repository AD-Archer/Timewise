import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timewise - Pomodoro Timer",
  description: "A simple and cute pomodoro timer to help you stay focused and productive.",
  metadataBase: new URL('https://timewise.adarcher.app'),
  
  // Basic metadata
  icons: {
    icon: '/timewise.svg',
    shortcut: '/timewise.svg',
    apple: '/timewise.svg',
  },
  
  // Open Graph metadata
  openGraph: {
    title: 'Timewise - Pomodoro Timer',
    description: 'A simple and cute pomodoro timer to help you stay focused and productive.',
    type: 'website',
    images: [
      {
        url: '/timewise.svg',
        width: 800,
        height: 800,
        alt: 'Timewise Logo',
      }
    ],
  },
  
  // Twitter metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Timewise - Pomodoro Timer',
    description: 'A simple and cute pomodoro timer to help you stay focused and productive.',
    images: ['/timewise.svg'],
  },
  
  // Additional metadata
  keywords: ['pomodoro', 'timer', 'productivity', 'focus', 'study'],
  authors: [{ name: 'Ad_archer_', url: 'https://github.com/adarcher' }], // Optional: Add your name
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/timewise.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/timewise.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
