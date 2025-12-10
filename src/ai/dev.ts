import { config } from 'dotenv';
config();

import '@/ai/flows/provide-resume-suggestions.ts';
import '@/ai/flows/generate-resume-from-data.ts';
import '@/ai/flows/generate-cover-letter-from-data.ts';
import '@/ai/flows/edit-resume-text.ts';
