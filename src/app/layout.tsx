import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Syllaboom - Turn Your Syllabus Into a Study System',
  description: 'Upload your syllabus, get a complete study guide with calendar export, grade calculator, and practice questions. $3 per class.',
  keywords: ['syllabus', 'study guide', 'college', 'university', 'grade calculator', 'calendar', 'flashcards', 'AI'],
  authors: [{ name: 'Syllaboom' }],
  openGraph: {
    title: 'Syllaboom - Turn Your Syllabus Into a Study System',
    description: 'Drop your syllabus. Get your A. AI-powered study system in 90 seconds.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Syllaboom',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syllaboom - Turn Your Syllabus Into a Study System',
    description: 'Drop your syllabus. Get your A. AI-powered study system in 90 seconds.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
