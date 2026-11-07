/**
 * @author Franklin Coetzee
 * @id 8510305083081
 * @email salazar3593@gmail.com
 * @credit AI assistance
 */

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqItems = [
    {
      question: "How does the AI work?",
      answer: "Our AI is trained on thousands of successful resumes across various industries. It analyzes your data and a target job description to generate optimized, professional content that highlights your strengths."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We prioritize your privacy. Your data is encrypted and is never shared with third parties. You have full control to delete your information from our servers at any time."
    },
    {
      question: "What is an ATS-optimized resume?",
      answer: "Applicant Tracking Systems (ATS) are used by most companies to filter resumes. An ATS-optimized resume is formatted correctly and contains the right keywords to ensure it gets seen by a human recruiter."
    },
    {
    question: "Can I build a resume without signing up?",
    answer: "Yes. You can build and preview a resume with Gemini without creating an account. Payment is required only when you download the final PDF."
    },
    {
    question: "How much does PDF export cost?",
    answer: "The recommended launch price is USD $4.99 internationally or ZAR R99 in South Africa, charged once per PDF export."
    },
    {
      question: "Can I customize the generated resume?",
      answer: "Yes. While our AI provides a strong foundation, you can always go back to the form to edit any section of your resume. The AI's role is to eliminate writer's block and do the heavy lifting for you."
    }
  ];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <div className="text-center mb-12 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">FAQ</p>
        <h1 className="text-4xl font-bold">Common Questions</h1>
        <p className="text-muted-foreground">Everything you need to know about using Frankie Resume AI.</p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="text-lg font-semibold text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
