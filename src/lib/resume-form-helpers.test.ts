import test from 'node:test';
import assert from 'node:assert/strict';

import { buildReviewResumeData } from './resume-form-helpers';

test('buildReviewResumeData preserves submission metadata needed for generation', () => {
  const formData = {
    title: 'Senior Product Engineer',
    templateId: 'modern',
    fullName: 'Alex Morgan',
    email: 'alex@example.com',
    website: 'alexmorgan.dev',
    phone: '+27 82 555 1234',
    location: 'Cape Town, South Africa',
    jobDescription: 'Build products for customers.',
    language: 'English',
    intent: 'Tech (ATS-Optimized)',
    experienceLevel: 'Senior',
    style: 'Modern',
    sections: {
      summary: { content: 'Experienced engineer' },
      experience: [],
      education: [],
      skills: ['React', 'TypeScript'],
      projects: [],
      certifications: [],
      references: [],
    },
  };

  const resume = buildReviewResumeData(formData, null);

  assert.equal(resume.title, 'Senior Product Engineer');
  assert.equal(resume.fullName, 'Alex Morgan');
  assert.equal(resume.email, 'alex@example.com');
  assert.equal(resume.website, 'alexmorgan.dev');
  assert.equal(resume.phone, '+27 82 555 1234');
  assert.equal(resume.location, 'Cape Town, South Africa');
  assert.equal(resume.jobDescription, 'Build products for customers.');
  assert.equal(resume.sections.summary?.content, 'Experienced engineer');
  assert.deepEqual(resume.sections.skills, ['React', 'TypeScript']);
});
