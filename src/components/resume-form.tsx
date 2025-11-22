
"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeSchema, type ResumeData, resumeIntentSchema, experienceLevelSchema, resumeStyleSchema } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2, Loader2, FilePlus2, Eraser } from "lucide-react";
import { useAutosave } from "@/hooks/use-autosave";
import { useEffect } from "react";

interface ResumeFormProps {
  onGenerate: (data: ResumeData) => void;
  isLoading: boolean;
  initialData: ResumeData | null;
}

const emptyValues: ResumeData = {
  jobDescription: "",
  target_job_title: "",
  resume_intent: "Tech (ATS-Optimized)",
  experience_level: "Mid-level",
  resume_style: "Modern",
  personal_info: {
    full_name: "",
    email: "",
    phone: "",
    location: "",
    summary: ""
  },
  work_experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};


const sampleValues: ResumeData = {
  jobDescription: "We are seeking a highly motivated Senior Frontend Engineer with over 5 years of experience in building modern, responsive, and performant web applications. The ideal candidate will have a strong command of React, TypeScript, and the Next.js framework. You will be responsible for leading the development of our customer-facing dashboard, mentoring junior engineers, and working closely with our design and product teams to implement new features. Experience with data visualization libraries and a passion for beautiful UI/UX are major pluses.",
  target_job_title: "Senior Frontend Engineer",
  resume_intent: "Tech (ATS-Optimized)",
  experience_level: "Senior",
  resume_style: "Modern",
  personal_info: {
    full_name: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "123-456-7890",
    location: "San Francisco, CA",
    summary: "A passionate and experienced Senior Frontend Engineer with a proven track record of building and launching successful web applications. Expert in React, TypeScript, and Next.js, with a keen eye for detail and a dedication to creating exceptional user experiences. Seeking to leverage my skills to contribute to a mission-driven team."
  },
  work_experience: [
    {
      job_title: "Senior Frontend Engineer",
      company: "Innovate Inc.",
      start_date: "2020-01",
      end_date: "Present",
      responsibilities: "Led the architecture and development of a new customer-facing analytics dashboard. Mentored a team of 3 junior engineers, providing code reviews and technical guidance. Collaborated with product managers to translate requirements into technical specifications.",
      achievements: "Improved application load times by 40% by implementing code splitting and lazy loading. Redesigned the state management system using Zustand, reducing boilerplate code by 60%. Received the 'Engineer of the Quarter' award for performance and leadership."
    },
    {
      job_title: "Software Engineer",
      company: "Tech Solutions LLC",
      start_date: "2018-06",
      end_date: "2020-01",
      responsibilities: "Developed and maintained components for a large-scale e-commerce platform using React and Redux. Wrote unit and integration tests to ensure code quality and reliability.",
      achievements: "Successfully migrated legacy class components to modern functional components with Hooks, improving code readability and maintainability. Contributed to a 20% increase in conversion rates by optimizing the checkout flow."
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of Technology",
      start_year: "2014",
      end_year: "2018",
    }
  ],
  skills: ["React", "TypeScript", "Next.js", "JavaScript (ES6+)", "HTML5 & CSS3", "Tailwind CSS", "State Management (Zustand, Redux)", "Testing (Jest, React Testing Library)"],
  projects: [
    {
      title: "Personal Portfolio Website",
      description: "A fully responsive personal portfolio built with Next.js and deployed on Vercel. Features a blog, project gallery, and contact form.",
      technologies: ["Next.js", "Tailwind CSS", "MDX"],
    }
  ],
  certifications: ["Certified React Developer", "AWS Certified Cloud Practitioner"],
};

export function ResumeForm({ onGenerate, isLoading, initialData }: ResumeFormProps) {
  const form = useForm<ResumeData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: initialData || emptyValues,
    mode: "onBlur",
  });
  
  useAutosave(form, "deep-resume-form", emptyValues);

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: "work_experience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: "education" });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control: form.control, name: "projects" });

  const handleFillSampleData = () => {
    form.reset(sampleValues);
  }
  
  const handleClearForm = () => {
    form.reset(emptyValues);
    localStorage.removeItem("deep-resume-form");
  }

  const SectionHeader = ({ title, onAdd }: { title: string; onAdd: () => void }) => (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Button type="button" variant="ghost" size="sm" onClick={onAdd} className="gap-1">
        <PlusCircle className="h-4 w-4" /> Add
      </Button>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-8">

        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" onClick={handleFillSampleData}><FilePlus2 className="mr-2 h-4 w-4" /> Fill with Sample Data</Button>
                    <Button type="button" size="sm" variant="outline" onClick={handleClearForm}><Eraser className="mr-2 h-4 w-4" /> Clear Form</Button>
                </div>
            </CardContent>
        </Card>

        <Accordion type="multiple" defaultValue={['customization', 'personal_info']} className="w-full">
          
          <AccordionItem value="customization">
            <AccordionTrigger className="text-xl font-bold">Resume Customization</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <FormField name="target_job_title" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Target Job Title</FormLabel><FormControl><Input placeholder="e.g., Senior Software Engineer" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <div className="grid md:grid-cols-3 gap-4">
                <FormField control={form.control} name="resume_intent" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume Intent</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select intent..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {resumeIntentSchema.options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="experience_level" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select level..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {experienceLevelSchema.options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="resume_style" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select style..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {resumeStyleSchema.options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField name="jobDescription" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Paste the job description (for tailored suggestions)</FormLabel><FormControl><Textarea placeholder="e.g., Seeking a software engineer with 5+ years of experience in..." {...field} rows={6} /></FormControl><FormMessage /></FormItem> )} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="personal_info">
            <AccordionTrigger className="text-xl font-bold">Personal Info</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <FormField name="personal_info.full_name" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField name="personal_info.email" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john.doe@email.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="personal_info.phone" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem> )} />
              </div>
              <FormField name="personal_info.location" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Location (e.g. City, State)</FormLabel><FormControl><Input placeholder="San Francisco, CA" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField name="personal_info.summary" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Professional Summary</FormLabel><FormControl><Textarea placeholder="A brief summary of your career, skills, and goals..." {...field} rows={4} /></FormControl><FormMessage /></FormItem> )} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="work_experience">
            <AccordionTrigger className="text-xl font-bold">Work Experience</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <SectionHeader title="Your Experience" onAdd={() => appendExp({ job_title: "", company: "", start_date: "", end_date: "", responsibilities: "", achievements: "" })} />
              {expFields.map((field, index) => (
                <Card key={field.id} className="relative">
                  <CardContent className="pt-6 space-y-4">
                    <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => removeExp(index)}><Trash2 className="h-4 w-4" /></Button>
                    <FormField name={`work_experience.${index}.job_title`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="Software Engineer" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField name={`work_experience.${index}.company`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Acme Inc." {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField name={`work_experience.${index}.start_date`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input placeholder="e.g., 2020-01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                      <FormField name={`work_experience.${index}.end_date`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>End Date</FormLabel><FormControl><Input placeholder="e.g., 2024-05 or Present" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                    <FormField name={`work_experience.${index}.responsibilities`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Responsibilities</FormLabel><FormControl><Textarea placeholder="Describe your key duties and tasks..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField name={`work_experience.${index}.achievements`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Achievements</FormLabel><FormControl><Textarea placeholder="List key accomplishments, preferably with metrics..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </CardContent>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="education">
            <AccordionTrigger className="text-xl font-bold">Education</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <SectionHeader title="Your Education" onAdd={() => appendEdu({ degree: "", institution: "", start_year: "", end_year: "" })} />
              {eduFields.map((field, index) => (
                <Card key={field.id} className="relative">
                  <CardContent className="pt-6 space-y-4">
                    <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => removeEdu(index)}><Trash2 className="h-4 w-4" /></Button>
                    <FormField name={`education.${index}.degree`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Degree</FormLabel><FormControl><Input placeholder="B.S. in Computer Science" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField name={`education.${index}.institution`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Institution</FormLabel><FormControl><Input placeholder="University of Example" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField name={`education.${index}.start_year`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Start Year</FormLabel><FormControl><Input placeholder="2018" {...field} /></FormControl><FormMessage /></FormItem> )} />
                      <FormField name={`education.${index}.end_year`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>End Year</FormLabel><FormControl><Input placeholder="2022" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="skills">
            <AccordionTrigger className="text-xl font-bold">Skills</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <FormField
                name="skills"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Skills</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter skills separated by commas"
                        {...field}
                        onChange={e => {
                          const value = e.target.value;
                          const skillsArray = value.split(',').map(s => s.trim()).filter(s => s);
                          field.onChange(skillsArray);
                        }}
                        value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                      />
                    </FormControl>
                    <FormDescription>Separate each skill with a comma.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="projects">
            <AccordionTrigger className="text-xl font-bold">Projects</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <SectionHeader title="Your Projects" onAdd={() => appendProj({ title: "", description: "", technologies: [] })} />
              {projFields.map((field, index) => (
                 <Card key={field.id} className="relative">
                  <CardContent className="pt-6 space-y-4">
                    <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => removeProj(index)}><Trash2 className="h-4 w-4" /></Button>
                    <FormField name={`projects.${index}.title`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Project Title</FormLabel><FormControl><Input placeholder="My Awesome App" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField name={`projects.${index}.description`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A brief description of the project..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField
                        name={`projects.${index}.technologies`}
                        control={form.control}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Technologies Used</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="e.g., Next.js, Tailwind CSS, MDX"
                                {...field}
                                onChange={e => {
                                  const value = e.target.value;
                                  const techArray = value.split(',').map(s => s.trim()).filter(s => s);
                                  field.onChange(techArray);
                                }}
                                value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                            />
                            </FormControl>
                             <FormDescription>Separate each technology with a comma.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </CardContent>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="certifications">
            <AccordionTrigger className="text-xl font-bold">Certifications</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
               <FormField
                name="certifications"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Certifications</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter certifications separated by commas"
                        {...field}
                        onChange={e => {
                          const value = e.target.value;
                          const certsArray = value.split(',').map(s => s.trim()).filter(s => s);
                          field.onChange(certsArray);
                        }}
                        value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                      />
                    </FormControl>
                    <FormDescription>Separate each certification with a comma.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            "Review & Generate"
          )}
        </Button>
      </form>
    </Form>
  );
}

    