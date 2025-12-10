
import * as React from "react";
import type { GeneratedResumeData } from "@/lib/schema";
import { EditableField } from "../editable-field";
import { Link as LinkIcon, Phone, Mail } from "lucide-react";

interface TemplateProps {
  resume: GeneratedResumeData;
  onAcceptEdit: (fieldPath: string, newValue: string) => void;
  targetJob?: string;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600 border-b border-gray-300 pb-1 mb-3">{title}</h2>
        {children}
    </section>
);


export const MinimalistTemplate: React.FC<TemplateProps> = ({ resume, onAcceptEdit, targetJob }) => {
  const { header, summary, skills, experience, education, projects, headings } = resume;

  return (
    <div className="bg-white text-gray-800 p-10 font-serif text-sm leading-relaxed">
        {/* Header */}
        <header className="text-center mb-8">
            <EditableField
                as="h1"
                fieldPath="header.name"
                value={header.name}
                onAccept={onAcceptEdit}
                targetJob={targetJob}
                className="text-3xl font-bold tracking-wider"
            />
            <div className="flex justify-center items-center gap-x-3 text-xs text-gray-500 mt-2">
                <p>{header.location}</p>
                <span className="text-gray-300">|</span>
                <a href={`mailto:${header.email}`} className="hover:text-black">{header.email}</a>
                <span className="text-gray-300">|</span>
                <a href={`tel:${header.phone}`} className="hover:text-black">{header.phone}</a>
                {header.website && (
                    <>
                        <span className="text-gray-300">|</span>
                        <a href={header.website} target="_blank" rel="noopener noreferrer" className="hover:text-black">
                            {header.website.replace(/https?:\/\//, '')}
                        </a>
                    </>
                )}
            </div>
        </header>

        {/* Summary */}
        <Section title={headings.summary}>
            <EditableField
                as="p"
                fieldPath="summary"
                value={summary}
                onAccept={onAcceptEdit}
                targetJob={targetJob}
            />
        </Section>

        {/* Experience */}
        <Section title={headings.experience}>
            {experience.map((job, index) => (
                <div key={index} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <EditableField as="h3" fieldPath={`experience[${index}].title`} value={job.title} onAccept={onAcceptEdit} targetJob={targetJob} className="font-bold text-base" />
                        <p className="text-xs font-sans text-gray-500">{job.dates}</p>
                    </div>
                    <p className="text-sm font-bold">{job.company}</p>
                    <ul className="mt-1 space-y-1">
                        {job.bulletPoints.map((point, i) => (
                            <li key={i} className="flex">
                                <span className="mr-2 text-gray-400">&#8211;</span>
                                <EditableField
                                    fieldPath={`experience[${index}].bulletPoints[${i}]`}
                                    value={point}
                                    onAccept={onAcceptEdit}
                                    targetJob={targetJob}
                                    isListItem
                                    className="text-justify"
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </Section>

        {/* Skills */}
        <Section title={headings.skills}>
             <div className="flex flex-wrap items-center -ml-2">
                {skills.map((skill, index) => (
                    <React.Fragment key={index}>
                        <div className="px-2">
                            <EditableField
                                as="span"
                                fieldPath={`skills[${index}]`}
                                value={skill}
                                onAccept={onAcceptEdit}
                                targetJob={targetJob}
                                className="font-sans"
                            />
                        </div>
                        {index < skills.length - 1 && (
                            <span className="text-gray-300 font-sans">&bull;</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </Section>

        <div className="grid grid-cols-2 gap-x-12">
            {/* Education */}
            <Section title={headings.education}>
                {education.map((edu, index) => (
                    <div key={index} className="mb-2 last:mb-0">
                        <h3 className="font-bold text-base">{edu.degree}</h3>
                        <div className="flex justify-between items-baseline">
                            <p className="text-sm">{edu.institution}</p>
                            <p className="text-xs font-sans text-gray-500">{edu.year}</p>
                        </div>
                    </div>
                ))}
            </Section>

             {/* Projects */}
            {projects && projects.length > 0 && (
                <Section title={headings.projects}>
                    {projects.map((proj, index) => (
                        <div key={index} className="mb-3 last:mb-0">
                            <EditableField as="h3" fieldPath={`projects[${index}].title`} value={proj.title} onAccept={onAcceptEdit} targetJob={targetJob} className="font-bold text-base" />
                            <EditableField as="p" fieldPath={`projects[${index}].description`} value={proj.description} onAccept={onAcceptEdit} targetJob={targetJob} className="mt-1 text-sm" />
                        </div>
                    ))}
                </Section>
            )}
        </div>
    </div>
  );
};
