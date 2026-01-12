'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TermsOfService() {
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

          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-gray-400 mb-8">Last updated: January 10, 2026</p>

          <div className="prose prose-invert prose-gray max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing or using Syllaboom (&quot;the Service&quot;), you agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            {/* Description of Service */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-300 leading-relaxed">
                Syllaboom is an AI-powered study guide generator that processes course syllabi to create
                personalized study materials, including weekly schedules, flashcards, exam strategies,
                and grade calculators.
              </p>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Acceptable Use</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You agree to use the Service only for lawful purposes. You may not:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Upload content that infringes on intellectual property rights</li>
                <li>Attempt to reverse engineer, hack, or disrupt the Service</li>
                <li>Use the Service to generate content for academic dishonesty</li>
                <li>Share your account access with others</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </section>

            {/* User Content */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. User Content</h2>
              <p className="text-gray-300 leading-relaxed">
                You retain ownership of any syllabi or documents you upload. By uploading content,
                you grant us a limited, temporary license to process that content solely for the
                purpose of generating your study guide. As described in our Privacy Policy, we do
                not store your uploaded content after processing.
              </p>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Payment and Refunds</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Payment is processed securely through Stripe. By making a purchase, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Provide accurate payment information</li>
                <li>Pay the fees associated with your selected plan</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                <strong className="text-white">Refund Policy:</strong> If you are unsatisfied with
                your generated study guide, please contact us within 7 days of purchase. We offer
                refunds on a case-by-case basis for guides that fail to generate properly or contain
                significant errors.
              </p>
            </section>

            {/* AI-Generated Content */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. AI-Generated Content</h2>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                <p className="text-amber-400 font-medium mb-2">Important Disclaimer</p>
                <p className="text-gray-300 text-sm">
                  Study guides are generated by AI and may contain inaccuracies. Always verify
                  important information against your official course materials and syllabus.
                </p>
              </div>
              <p className="text-gray-300 leading-relaxed">
                The Service uses artificial intelligence to analyze syllabi and generate study materials.
                While we strive for accuracy, AI-generated content may occasionally contain errors,
                omissions, or misinterpretations. You are responsible for verifying all information
                before relying on it for academic purposes.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed">
                The Service, including its design, features, and underlying technology, is owned by
                Syllaboom and protected by intellectual property laws. Your generated study guides
                are yours to use for personal, educational purposes.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SYLLABOOM SHALL NOT BE LIABLE FOR ANY
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
                BUT NOT LIMITED TO LOSS OF GRADES, ACADEMIC STANDING, OR EDUCATIONAL OPPORTUNITIES,
                RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                The Service is provided &quot;as is&quot; without warranties of any kind, either express
                or implied.
              </p>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Academic Integrity</h2>
              <p className="text-gray-300 leading-relaxed">
                Syllaboom is designed to help you study more effectively, not to complete assignments
                or exams on your behalf. You are responsible for ensuring your use of the Service
                complies with your institution&apos;s academic integrity policies. Using generated
                content inappropriately may constitute academic dishonesty.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. Termination</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to suspend or terminate your access to the Service at any time,
                without notice, for conduct that we believe violates these Terms or is harmful to
                other users, us, or third parties.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">11. Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update these Terms from time to time. We will notify you of any material
                changes by posting the new Terms on this page and updating the &quot;Last updated&quot;
                date. Your continued use of the Service after changes constitutes acceptance of
                the new Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">12. Governing Law</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the
                United States, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">13. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <a
                href="mailto:support@syllaboom.com"
                className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                support@syllaboom.com
              </a>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-white/10 flex justify-center gap-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Back to Syllaboom
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
