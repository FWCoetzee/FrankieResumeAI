/**
 * @author Franklin Coetzee
 * @id 8510305083081
 * @email salazar3593@gmail.com
 * @credit AI assistance
 */

import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 text-slate-800 leading-relaxed">
      <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
      <p className="mb-4 text-slate-600 italic text-center">Last Updated: November 2026</p>
      
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Frankie Resume AI, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our service.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">2. Service Description</h2>
          <p>
            Frankie Resume AI provides an AI-powered tool to help users generate and refine resumes and cover letters. 
            We provide the tool "as is" without any guarantees of employment outcomes.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">3. Payment and Exports</h2>
          <p>
            Building and previewing resumes is free. Exporting a final PDF requires a one-time payment.
          </p>
          <ul className="list-disc ml-6 space-y-2 mt-2">
            <li>Payments are non-refundable once the PDF has been successfully generated and delivered.</li>
            <li>Prices are subject to change without notice.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">4. Acceptable Use</h2>
          <p>
            You agree not to use the service for any malicious purposes, including but not limited to:
            <ul className="list-disc ml-6 space-y-2 mt-2">
              <li>Attempting to scrape the service or bypass payment gates.</li>
              <li>Using automated bots to generate mass content.</li>
              <li>Uploading illegal or harmful content.</li>
            </ul>
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">5. Limitation of Liability</h2>
          <p>
            In no event shall Franklin Coetzee be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the materials on Frankie Resume AI.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">6. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of South Africa, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </div>
      </section>
    </div>
  );
}
