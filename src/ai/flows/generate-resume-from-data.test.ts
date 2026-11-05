import assert from 'node:assert/strict';
import test from 'node:test';

import { GenerateResumeFromDataInputSchema } from './generate-resume-from-data';

const validInput = {
  target_job_title: 'Software Engineer',
  resume_intent: 'Tech (ATS-Optimized)' as const,
  experience_level: 'Mid-level' as const,
  resume_style: 'Modern' as const,
  language: 'English' as const,
  personal_info: {
    full_name: 'Alex Morgan',
    email: 'alex@example.com',
    phone: '+27 82 555 1234',
  },
  work_experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  references: [],
};

test('accepts a generation input matching the structured resume contract', () => {
  assert.equal(GenerateResumeFromDataInputSchema.safeParse(validInput).success, true);
});

test('rejects oversized generation fields before provider execution', () => {
  const oversizedInput = {
    ...validInput,
    personal_info: {
      ...validInput.personal_info,
      summary: 'x'.repeat(5001),
    },
  };

  assert.equal(GenerateResumeFromDataInputSchema.safeParse(oversizedInput).success, false);
});

test('rejects work experience beyond the generation request limit', () => {
  const oversizedInput = {
    ...validInput,
    work_experience: Array.from({ length: 31 }, () => ({
      job_title: 'Engineer',
      company: 'Example',
    })),
  };

  assert.equal(GenerateResumeFromDataInputSchema.safeParse(oversizedInput).success, false);
});
