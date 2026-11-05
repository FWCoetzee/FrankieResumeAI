import assert from 'node:assert/strict';
import test from 'node:test';

import { classifyProviderError, verifyGeneratedResume } from './generation-verification';

const validResume = {
  headings: {
    summary: 'Summary',
    skills: 'Skills',
    experience: 'Experience',
    education: 'Education',
    projects: 'Projects',
    certifications: 'Certifications',
    references: 'References',
  },
  header: {
    name: 'Alex Morgan',
    email: 'alex@example.com',
    phone: '+27 82 555 1234',
    location: 'Cape Town',
  },
  summary: 'Experienced engineer.',
  skills: ['TypeScript'],
  experience: [],
  education: [],
};

test('verifies generated output against the resume schema', () => {
  assert.equal(verifyGeneratedResume(validResume), true);
  assert.equal(verifyGeneratedResume({ ...validResume, experience: 'invalid' }), false);
});

test('classifies provider failures without exposing provider messages', () => {
  assert.equal(classifyProviderError(new Error('401 API key invalid')), 'authentication');
  assert.equal(classifyProviderError(new Error('429 resource exhausted')), 'quota');
  assert.equal(classifyProviderError(new Error('404 model not found')), 'model');
  assert.equal(classifyProviderError(new Error('deadline exceeded')), 'timeout');
  assert.equal(classifyProviderError(new Error('connection reset')), 'provider-or-network');
});
