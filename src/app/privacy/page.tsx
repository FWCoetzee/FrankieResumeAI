/**
 * @author Franklin Coetzee
 * @id 8510305083081
 * @email salazar3593@gmail.com
 * @credit AI assistance
 */

import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 text-slate-800 leading-relaxed">
      <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
      <p className="mb-4 text-slate-600 italic text-center">Last Updated: November 2026</p>
      
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
          <p>
            Welcome to Frankie Resume AI. We value your privacy and are committed to protecting your personal data. 
            This policy explains how we handle information when you use our AI-powered resume building services.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">2. Data Collection</h2>
          <p>
            Our service is designed for maximum privacy. We primarily operate on an anonymous session basis.
          </p>
          <ul className="list-disc ml-6 space-y-2 mt-2">
            <li><strong>Anonymous Sessions:</strong> We use browser-based identifiers to allow you to build your resume without creating an account.</li>
            <li><strong>Resume Data:</strong> We store the resume content you provide so you can edit it during your session. This data is automatically deleted after a set period of inactivity.</li>
            <li><strong>Payment Information:</strong> We do not store credit card details. All payments are handled securely via our third-party providers (PayPal, Lemon Squeezy, PayFast, and Yoco).</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Data</h2>
          <p>
            Your data is used exclusively to:
            <ul className="list-disc ml-6 space-y-2 mt-2">
              <li>Provide the AI generation and editing services.</li>
              <li>Process your one-time payment for PDF export.</li>
              <li>Prevent abuse and malicious bot activity.</li>
            </ul>
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">4. Data Retention</h2>
          <p>
            Resume drafts created during anonymous sessions are temporary and are automatically purged from our database after 24 hours of inactivity. Once a PDF is exported, the associated transaction record is kept for accounting and tax purposes only.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
          <p>
            Since you use our service anonymously, you can clear your browser cache to remove your session identifier. You may contact us at the email address provided in our contact page for any specific data requests.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">6. Contact</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact Franklin Coetzee via the Contact page.
          </p>
        </div>
      </section>
    </div>
  );
}
