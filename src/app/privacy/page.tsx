'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Ambient background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>

          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-gray-400 mb-8">Last updated: January 9, 2026</p>

          <div className="prose prose-invert prose-gray max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                Syllaboom (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, and safeguard your information when you
                use our service to generate study guides from course syllabi.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                <strong className="text-white">TL;DR:</strong> We process your syllabus to generate your study guide,
                then immediately discard it. Your study guide is stored only in your browser. We don&apos;t
                have a database of user data.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Information We Collect</h2>

              <h3 className="text-lg font-medium text-gray-200 mt-6 mb-3">1. Syllabus Content</h3>
              <p className="text-gray-300 leading-relaxed">
                When you upload a syllabus PDF, we extract the text content to generate your personalized
                study guide. This content is processed in real-time and is <strong className="text-white">not stored</strong> on
                our servers after processing is complete.
              </p>

              <h3 className="text-lg font-medium text-gray-200 mt-6 mb-3">2. Email Address</h3>
              <p className="text-gray-300 leading-relaxed">
                We collect your email address during checkout solely to send you a payment receipt via
                Stripe. We do not use your email for marketing purposes unless you explicitly opt in.
              </p>

              <h3 className="text-lg font-medium text-gray-200 mt-6 mb-3">3. Payment Information</h3>
              <p className="text-gray-300 leading-relaxed">
                Payment processing is handled entirely by Stripe. We never see, store, or have access to
                your credit card number, CVV, or other sensitive payment details. Stripe may collect
                additional information as described in their{' '}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 underline"
                >
                  Privacy Policy
                </a>.
              </p>

              <h3 className="text-lg font-medium text-gray-200 mt-6 mb-3">4. Analytics Data</h3>
              <p className="text-gray-300 leading-relaxed">
                We use Vercel Analytics to collect anonymous usage data such as page views, referral
                sources, and general geographic location (country level). This data is aggregated and
                cannot be used to identify individual users.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>To generate your personalized study guide from your syllabus</li>
                <li>To process your payment and send a receipt</li>
                <li>To improve our service based on aggregated, anonymous analytics</li>
                <li>To respond to support inquiries</li>
              </ul>
            </section>

            {/* Data Storage */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Data Storage & Retention</h2>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <p className="text-emerald-400 font-medium mb-2">Local-First Architecture</p>
                <p className="text-gray-300 text-sm">
                  Your study guide is stored exclusively in your browser&apos;s local storage. We do not
                  maintain a database of user-generated content. This means your data stays on your
                  device and is never transmitted to or stored on our servers.
                </p>
              </div>

              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong className="text-white">Syllabus text:</strong> Processed in memory, never written to disk, discarded immediately after generation</li>
                <li><strong className="text-white">Study guide:</strong> Stored in your browser only (localStorage)</li>
                <li><strong className="text-white">Payment records:</strong> Maintained by Stripe per their retention policies</li>
                <li><strong className="text-white">Analytics:</strong> Retained by Vercel for up to 30 days</li>
              </ul>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Third-Party Services</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We use the following third-party services to operate Syllaboom:
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <h4 className="font-medium text-white mb-1">Stripe</h4>
                  <p className="text-gray-400 text-sm">Payment processing</p>
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                  >
                    View Stripe Privacy Policy →
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <h4 className="font-medium text-white mb-1">OpenRouter</h4>
                  <p className="text-gray-400 text-sm">AI processing for study guide generation</p>
                  <a
                    href="https://openrouter.ai/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                  >
                    View OpenRouter Privacy Policy →
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <h4 className="font-medium text-white mb-1">Vercel</h4>
                  <p className="text-gray-400 text-sm">Hosting and analytics</p>
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                  >
                    View Vercel Privacy Policy →
                  </a>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Cookies & Tracking</h2>
              <p className="text-gray-300 leading-relaxed">
                We use minimal cookies necessary to operate our service:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
                <li><strong className="text-white">Essential cookies:</strong> Required for the website to function properly</li>
                <li><strong className="text-white">Analytics cookies:</strong> Anonymous usage data via Vercel Analytics (can be blocked by browser settings)</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                We do not use advertising cookies or sell your data to third parties.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Your Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Because we don&apos;t store your personal data on our servers, many traditional data rights
                (access, deletion, portability) are automatically fulfilled:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong className="text-white">Delete your study guide:</strong> Clear your browser&apos;s local storage or use your browser&apos;s &quot;Clear site data&quot; feature</li>
                <li><strong className="text-white">Export your data:</strong> Use the export buttons in the study guide to download your data in various formats</li>
                <li><strong className="text-white">Payment records:</strong> Contact Stripe directly for payment-related inquiries</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Data Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
                <li>All data transmission is encrypted using HTTPS/TLS</li>
                <li>Payment processing is PCI-DSS compliant (via Stripe)</li>
                <li>We use secure, rate-limited APIs to prevent abuse</li>
                <li>Our infrastructure is hosted on Vercel&apos;s secure cloud platform</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Children&apos;s Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Syllaboom is intended for users who are at least 13 years old. We do not knowingly
                collect personal information from children under 13. If you believe a child has
                provided us with personal information, please contact us.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes
                by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <a
                href="mailto:privacy@syllaboom.com"
                className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                privacy@syllaboom.com
              </a>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
            <Link href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              ← Back to Syllaboom
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
