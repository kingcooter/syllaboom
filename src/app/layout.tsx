import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const baseUrl = 'https://syllaboom.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Syllaboom - Turn Your Syllabus Into a Study System',
    template: '%s | Syllaboom',
  },
  description: 'Upload any college syllabus and get a complete AI-powered study system in 90 seconds. Calendar export to Google/Apple, grade calculator, week-by-week battle plan, and exam strategies. One-time $3 payment, no account needed.',
  keywords: ['syllabus', 'study guide', 'college', 'university', 'grade calculator', 'calendar export', 'exam prep', 'AI study tool', 'course planner', 'GPA calculator'],
  authors: [{ name: 'Syllaboom' }],
  creator: 'Syllaboom',
  publisher: 'Syllaboom',
  openGraph: {
    title: 'Syllaboom - Turn Your Syllabus Into a Study System',
    description: 'Drop your syllabus. Get your A. AI-powered study system in 90 seconds.',
    url: baseUrl,
    siteName: 'Syllaboom',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Syllaboom - AI-powered study guide generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syllaboom - Turn Your Syllabus Into a Study System',
    description: 'Drop your syllabus. Get your A. AI-powered study system in 90 seconds.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
};

// JSON-LD structured data for rich snippets
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Syllaboom',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  description: 'AI-powered study guide generator that turns any college syllabus into a complete study system with calendar export, grade calculator, and exam strategies.',
  url: baseUrl,
  offers: {
    '@type': 'Offer',
    price: '3.00',
    priceCurrency: 'USD',
    description: 'Single class study guide',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '50',
  },
  featureList: [
    'Calendar export to Google Calendar and Apple Calendar',
    'Grade calculator with Excel/Sheets export',
    'Week-by-week study plan',
    'Exam strategy guides',
    'Danger zone alerts for busy weeks',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
