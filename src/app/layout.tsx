import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Play My Thing - YouTube Playlist Player',
  description: 'Play YouTube playlists in the background with audio focus',
  openGraph: {
    title: 'Play My Thing - YouTube Playlist Player',
    description: 'Play YouTube playlists in the background with audio focus',
    url: 'https://play-my-thing.netlify.app/',
    siteName: 'Play My Thing',
    images: [
      {
        url: 'https://play-my-thing.netlify.app/social-preview.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Play My Thing - YouTube Playlist Player',
    description: 'Play YouTube playlists in the background with audio focus',
    images: ['https://play-my-thing.netlify.app/social-preview.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}