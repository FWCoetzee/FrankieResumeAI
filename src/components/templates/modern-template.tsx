
import * as React from "react";
import type { GeneratedResumeData } from "@/lib/schema";
import { EditableField } from "../editable-field";
import { Link as LinkIcon, Phone, Mail } from "lucide-react";

interface TemplateProps {
  resume: GeneratedResumeData;
  onAcceptEdit: (fieldPath: string, newValue: string) => void;
  targetJob?: string;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ resume, onAcceptEdit, targetJob }) => {
  const { header, summary, skills, experience, education, projects, headings } = resume;

  return (
    <div className="bg-white text-black p-8 font-sans text-sm">
      {/* Header */}
      <div className="text-center border-b pb-4 mb-6">
        <EditableField
          as="h1"
          fieldPath="header.name"
          value={header.name}
          onAccept={onAcceptEdit}
          targetJob={targetJob}
          className="text-4xl font-bold tracking-tight"
        />
        <div className="flex justify-center items-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-2 flex-wrap">
          <a href={`mailto:${header.email}`} className="flex items-center gap-1 hover:text-blue-600"><Mail className="h-3 w-3" />{header.email}</a>
          <span className="text-gray-300 hidden md:inline">|</span>
          <a href={`tel:${header.phone}`} className="flex items-center gap-1 hover:text-blue-600"><Phone className="h-3 w-3" />{header.phone}</a>
          <span className="text-gray-300 hidden md:inline">|</span>
          <p className="flex items-center gap-1">{header.location}</p>
          {header.website && (
            <>
            <span className="text-gray-300 hidden md:inline">|</span>
            <a href={header.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                <LinkIcon className="h-3 w-3" />{header.website.replace(/https?:\/\//, '')}
            </a>
            </>
          )}
        </div>
      </div>
      
      {/* Summary */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-2 border-b-2 border-gray-200 pb-1">{headings.summary}</h2>
        <EditableField
          as="p"
          fieldPath="summary"
          value={summary}
          onAccept={onAcceptEdit}
          targetJob={targetJob}
          className="text-gray-700 leading-relaxed"
        />
      </section>

      {/* Skills */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-2 border-b-2 border-gray-200 pb-1">{headings.skills}</h2>
        <div className="flex flex-wrap items-center gap-y-2">
          {skills.map((skill, index) => (
              <React.Fragment key={index}>
                  <EditableField
                    as="span"
                    fieldPath={`skills[${index}]`}
                    value={skill}
                    onAccept={onAcceptEdit}
                    targetJob={targetJob}
                    className="font-medium"
                  />
                  {index < skills.length - 1 && (
                      <span className="text-gray-300 mx-2">|</span>
                  )}
              </React.Fragment>
          ))}
        </div>
      </section>
      
      {/* Experience */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-2 border-b-2 border-gray-200 pb-1">{headings.experience}</h2>
        {experience.map((job, index) => (
          <div key={index} className="mb-4 last:mb-0">
            <div className="flex justify-between items-baseline mb-1">
                <EditableField as="h3" fieldPath={`experience[${index}].title`} value={job.title} onAccept={onAcceptEdit} targetJob={targetJob} className="font-bold text-base" />
              <p className="text-xs text-gray-600">{job.dates}</p>
            </div>
            <p className="text-sm font-medium italic text-gray-800">{job.company}</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-gray-700">
              {job.bulletPoints.map((point, i) => (
                 <li key={i}>
                    <EditableField
                      fieldPath={`experience[${index}].bulletPoints[${i}]`}
                      value={point}
                      onAccept={onAcceptEdit}
                      targetJob={targetJob}
                      isListItem
                    />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-2 border-b-2 border-gray-200 pb-1">{headings.education}</h2>
        {education.map((edu, index) => (
          <div key={index} className="flex justify-between items-baseline">
            <div>
              <h3 className="font-bold text-base">{edu.degree}</h3>
              <p className="text-sm italic text-gray-800">{edu.institution}</p>
            </div>
            <p className="text-xs text-gray-600">{edu.year}</p>
          </div>
        ))}
      </section>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-2 border-b-2 border-gray-200 pb-1">{headings.projects}</h2>
          {projects.map((proj, index) => (
            <div key={index} className="mb-3 last:mb-0">
               <EditableField as="h3" fieldPath={`projects[${index}].title`} value={proj.title} onAccept={onAcceptEdit} targetJob={targetJob} className="font-bold text-base" />
               <EditableField as="p" fieldPath={`projects[${index}].description`} value={proj.description} onAccept={onAcceptEdit} targetJob={targetJob} className="mt-1 list-disc list-inside space-y-1 text-gray-700" />
            </div>
          ))}
        </section>
      )}

    </div>
  );
};
