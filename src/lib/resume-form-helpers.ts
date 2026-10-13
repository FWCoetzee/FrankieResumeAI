import type { ResumeData, ResumeFormData } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';

export function buildReviewResumeData(
  data: ResumeFormData,
  existingResume?: ResumeData | null,
): ResumeData {
  return {
    resumeId: existingResume?.resumeId || 0,
    ownerId: existingResume?.ownerId || 0,
    title: data.title,
    templateId: data.templateId,
    status: 'DRAFT',
    phone: data.phone || existingResume?.phone || '',
    location: data.location || existingResume?.location || '',
    jobDescription: data.jobDescription || existingResume?.jobDescription || '',
    settings: existingResume?.settings || { fontSize: 10, spacing: 'normal' },
    isDeleted: false,
    sections: {
      summary: {
        content: data.sections.summary?.content || existingResume?.sections.summary?.content || '',
        lastEdited: new Date().toISOString(),
      },
      experience: (data.sections.experience || existingResume?.sections.experience || []).map((exp, index) => ({
        id: exp.id || uuidv4(),
        role: exp.role,
        company: exp.company,
        startDate: exp.startDate,
        endDate: exp.endDate,
        bullets: exp.bullets || [],
        order: index,
      })),
      education: (data.sections.education || existingResume?.sections.education || []).map((edu, index) => ({
        id: edu.id || uuidv4(),
        degree: edu.degree,
        institution: edu.institution,
        startYear: edu.startYear,
        endYear: edu.endYear,
        order: index,
      })),
      skills: data.sections.skills || existingResume?.sections.skills || [],
      projects: (data.sections.projects || existingResume?.sections.projects || []).map((proj, index) => ({
        id: proj.id || uuidv4(),
        title: proj.title,
        description: proj.description || '',
        order: index,
      })),
      certifications: data.sections.certifications || existingResume?.sections.certifications || [],
      references: (data.sections.references || existingResume?.sections.references || []).map((ref, index) => ({
        id: ref.id || uuidv4(),
        name: ref.name,
        contact: ref.contact,
        order: index,
      })),
    },
  };
}
