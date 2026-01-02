
import * as React from "react";
import type { GeneratedResumeData } from "@/lib/schema";
import { Link as LinkIcon, Phone, Mail, MapPin } from "lucide-react";

interface TemplateProps {
  resume: GeneratedResumeData;
}

const SidebarSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <section className={`mb-6 ${className}`}>
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-200/80 mb-3">{title}</h3>
        {children}
    </section>
);


export const CreativeTemplate: React.FC<TemplateProps> = ({ resume }) => {
  const { header, summary, skills, experience, education, projects, certifications, references, headings } = resume;

  return (
    <div className="bg-white text-gray-800 font-sans flex min-h-full">
      {/* Sidebar */}
      <aside className="w-1/3 bg-gray-800 text-white p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">{header.name}</h1>
        </div>

        <SidebarSection title="Contact">
          <div className="space-y-2 text-sm text-gray-300">
            <a href={`mailto:${header.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="h-4 w-4 text-blue-300" /> <span>{header.email}</span>
            </a>
            <a href={`tel:${header.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="h-4 w-4 text-blue-300" /> <span>{header.phone}</span>
            </a>
             <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-300" /> <span>{header.location}</span>
            </div>
            {header.website && (
              <a href={header.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <LinkIcon className="h-4 w-4 text-blue-300" /> <span>{header.website.replace(/https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        </SidebarSection>

        <SidebarSection title={headings.skills}>
          <ul className="space-y-1 text-sm text-gray-300">
            {skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </SidebarSection>
        
        <SidebarSection title={headings.education}>
           {education.map((edu, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <h4 className="font-semibold text-white">{edu.degree}</h4>
              <p className="text-sm text-gray-400">{edu.institution}</p>
              <p className="text-xs text-gray-500">{edu.year}</p>
            </div>
          ))}
        </SidebarSection>

        {certifications && certifications.length > 0 && (
            <SidebarSection title={headings.certifications}>
                 <ul className="space-y-1 text-sm text-gray-300">
                    {certifications.map((cert, index) => (
                        <li key={index}>{cert}</li>
                    ))}
                </ul>
            </SidebarSection>
        )}
      </aside>

      {/* Main Content */}
      <main className="w-2/3 p-8">
        <section className="mb-8">
            <h2 className="text-xl font-bold uppercase tracking-wider text-gray-500 mb-4">{headings.summary}</h2>
            <p className="text-base leading-relaxed text-gray-700">{summary}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold uppercase tracking-wider text-gray-500 mb-4">{headings.experience}</h2>
          {experience.map((job, index) => (
            <div key={index} className="mb-6 last:mb-0 relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-px before:bg-gray-200 after:absolute after:left-[-2px] after:top-2 after:h-2.5 after:w-2.5 after:rounded-full after:bg-gray-800">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-lg">{job.title}</h3>
                <p className="text-sm text-gray-500">{job.dates}</p>
              </div>
              <p className="text-base font-semibold text-gray-700">{job.company}</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {job.bulletPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {projects && projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold uppercase tracking-wider text-gray-500 mb-4">{headings.projects}</h2>
            <div className="space-y-4">
              {projects.map((proj, index) => (
                <div key={index}>
                  <h3 className="font-bold text-base">{proj.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {references && references.length > 0 && (
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wider text-gray-500 mb-4">{headings.references}</h2>
             <div className="space-y-3">
              {references.map((ref, index) => (
                <div key={index}>
                  <p className="text-gray-700"><span className="font-bold">{ref.name}</span> - {ref.contact}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
