// pages/Terms.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-10">

      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline mb-6"
        >
          <FiArrowLeft size={16} />
          Back to registration
        </Link>

        {/* Content */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-10">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Terms of Service
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Last updated: August 2026
          </p>

          <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-300 leading-7">

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account and using StudentGenie, you agree to
                follow these Terms of Service. If you do not agree with these
                terms, please do not use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                2. Use of StudentGenie
              </h2>
              <p>
                StudentGenie is designed to help students with studying,
                learning, revision, organization, and academic productivity.
                You agree to use the platform responsibly and only for lawful
                purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                3. Your Account
              </h2>
              <p>
                You are responsible for providing accurate information during
                registration and for keeping your account credentials secure.
                You should not share your password with others.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                4. AI-Generated Content
              </h2>
              <p>
                StudentGenie may use artificial intelligence to generate
                explanations, summaries, quizzes, flashcards, study plans,
                and other educational content. AI-generated information may
                sometimes be inaccurate, incomplete, or outdated.
              </p>
              <p className="mt-2">
                Students should verify important academic information using
                reliable sources and should not blindly rely on AI-generated
                answers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                5. User Content
              </h2>
              <p>
                You are responsible for any notes, documents, questions, or
                other content that you upload or provide to StudentGenie.
                Do not upload content that you do not have permission to use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                6. Prohibited Use
              </h2>
              <p>
                You must not use StudentGenie for illegal activities, abuse
                the service, attempt unauthorized access, interfere with the
                platform, or knowingly misuse its features.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                7. Service Availability
              </h2>
              <p>
                We aim to keep StudentGenie available and functional, but the
                service may occasionally be unavailable because of maintenance,
                technical problems, or other circumstances.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                8. Changes to These Terms
              </h2>
              <p>
                These Terms of Service may be updated from time to time.
                Updated terms will be published on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                9. Contact
              </h2>
              <p>
                If you have questions about these terms, please contact the
                StudentGenie team.
              </p>
            </section>

          </div>

        </div>
      </div>

    </div>
  );
};

export default Terms;