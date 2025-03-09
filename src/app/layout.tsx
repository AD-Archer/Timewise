import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AchievementsProvider } from './contexts/AchievementsContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { TimerProvider } from './contexts/TimerContext';
import { MoodProvider } from './contexts/MoodContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timewise & Mood Tracker",
  description: "Track your mood and manage your time with this simple and beautiful app.",
  metadataBase: new URL('https://timewise.adarcher.app'),
  
  // Basic metadata
  icons: {
    icon: '/timewise.svg',
    shortcut: '/timewise.svg',
    apple: '/timewise.svg',
  },
  
  // Open Graph metadata
  openGraph: {
    title: 'Timewise & Mood Tracker',
    description: 'Track your mood and manage your time with this simple and beautiful app.',
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
    title: 'Timewise & Mood Tracker',
    description: 'Track your mood and manage your time with this simple and beautiful app.',
    images: ['/timewise.svg'],
  },
  
  // Additional metadata
  keywords: ['mood tracker', 'pomodoro', 'timer', 'productivity', 'focus', 'study', 'mental health'],
  authors: [{ name: 'Ad_archer_', url: 'https://github.com/adarcher' }],
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SettingsProvider>
          <AchievementsProvider>
            <TimerProvider>
              <MoodProvider>
                {children}
                <ToastContainer />
              </MoodProvider>
            </TimerProvider>
          </AchievementsProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
