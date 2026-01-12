import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Syllaboom. Read our terms for using our AI-powered study guide generator.',
  alternates: {
    canonical: 'https://syllaboom.com/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
