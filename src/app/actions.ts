
"use client";

// This file is being deprecated for resume actions.
// All resume-related data operations should go through the new /app/api endpoints.
// This is to enforce a stricter client-server boundary and improve security and data integrity.

// Existing non-resume actions can remain here, but for the AI Resume Builder,
// this file should not be used for creating, updating, or generating resumes.
// See src/app/api/resumes/ for the new implementation.

import { editResumeText, type EditResumeTextInput } from "@/ai/flows/edit-resume-text";

export { editResumeText, type EditResumeTextInput };
