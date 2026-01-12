import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Syllaboom protects your privacy. We process your syllabus to generate study guides, then immediately discard it. No account required, no data stored.',
  alternates: {
    canonical: 'https://syllaboom.com/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
