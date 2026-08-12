// pages/Privacy.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const Privacy = () => {
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
            Privacy Policy
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Last updated: August 2026
          </p>

          <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-300 leading-7">

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                1. Information We Collect
              </h2>
              <p>
                When you create an account, StudentGenie may collect
                information such as your name, email address, college,
                branch, semester, and account credentials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                2. How We Use Your Information
              </h2>
              <p>
                Your information may be used to create and manage your
                account, provide personalized study features, maintain your
                profile, authenticate your account, and improve the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                3. Email Verification
              </h2>
              <p>
                StudentGenie may send verification codes and account-related
                emails to the email address associated with your account.
                These emails help protect your account and provide important
                authentication functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                4. Uploaded Content
              </h2>
              <p>
                If you upload notes, documents, or other study material,
                that content may be processed by StudentGenie features to
                provide requested summaries, quizzes, flashcards, or other
                educational assistance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                5. AI Services
              </h2>
              <p>
                Some StudentGenie features may use third-party artificial
                intelligence services to process requests and generate
                educational content. Information sent to such services is
                handled according to the applicable service policies and
                configuration of StudentGenie.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                6. Account Security
              </h2>
              <p>
                We take reasonable measures to protect account information.
                However, no online service can guarantee complete security.
                You should keep your password private and notify the
                StudentGenie team if you believe your account has been
                compromised.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                7. Your Information
              </h2>
              <p>
                You may review and update certain profile information through
                the profile section of StudentGenie.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                8. Changes to This Privacy Policy
              </h2>
              <p>
                This Privacy Policy may be updated when StudentGenie changes
                its features, data practices, or services. Updated versions
                will be published on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                9. Contact
              </h2>
              <p>
                If you have questions about this Privacy Policy or how your
                information is handled, please contact the StudentGenie team.
              </p>
            </section>

          </div>

        </div>
      </div>

    </div>
  );
};

export default Privacy;