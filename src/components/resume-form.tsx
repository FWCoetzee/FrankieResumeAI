"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeSchema, type ResumeData } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { PlusCircle, Trash2, Loader2 } from "lucide-react";

interface ResumeFormProps {
  onGenerate: (data: ResumeData) => void;
  isLoading: boolean;
}

const defaultValues: ResumeData = {
  jobDescription: "",
  personal_info: {
    full_name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    location: "San Francisco, CA",
    summary: "A passionate software developer with expertise in building modern web applications."
  },
  work_experience: [
    {
      job_title: "Senior Software Engineer",
      company: "FutureTech Inc.",
      start_date: "2020-01",
      end_date: "Present",
      responsibilities: "Leading the development of the main user-facing platform, mentoring junior developers, and collaborating with product managers to define new features.",
      achievements: "Increased application performance by 30% by optimizing database queries and refactoring critical components."
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "State University",
      start_year: "2016",
      end_year: "2020",
    }
  ],
  skills: [{ value: "React" }, { value: "TypeScript" }, { value: "Node.js" }, { value: "GraphQL" }],
  projects: [
    {
      title: "E-commerce Platform",
      description: "A full-stack e-commerce site with features like product search, shopping cart, and Stripe integration.",
      technologies: [{ value: "Next.js" }, { value: "Tailwind CSS" }, { value: "Firebase" }],
    }
  ],
  certifications: [{ value: "AWS Certified Developer - Associate" }],
};


export function ResumeForm({ onGenerate, isLoading }: ResumeFormProps) {
  const form = useForm<ResumeData>({
    resolver: zodResolver(resumeSchema),
    defaultValues,
    mode: "onBlur",
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: "work_experience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: "education" });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control: form.control, name: "skills" });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control: form.control, name: "projects" });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control: form.control, name: "certifications" });

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
        <Accordion type="multiple" defaultValue={['personal_info', 'job']} className="w-full">
          
          <AccordionItem value="job">
            <AccordionTrigger className="text-xl font-bold">Target Job Description</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
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
              <SectionHeader title="Your Skills" onAdd={() => appendSkill({ value: "" })} />
              {skillFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField name={`skills.${index}.value`} control={form.control} render={({ field }) => ( <FormItem className="flex-grow"><FormControl><Input placeholder="e.g., Python" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
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
                    <Controller
                      name={`projects.${index}.technologies`}
                      control={form.control}
                      render={({ field }) => {
                        const { fields: techFields, append: appendTech, remove: removeTech } = useFieldArray({
                          control: form.control,
                          name: `projects.${index}.technologies`
                        });
                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <FormLabel>Technologies Used</FormLabel>
                              <Button type="button" variant="outline" size="sm" onClick={() => appendTech({ value: "" })}>Add Tech</Button>
                            </div>
                            {techFields.map((techField, techIndex) => (
                              <div key={techField.id} className="flex items-center gap-2">
                                <FormField name={`projects.${index}.technologies.${techIndex}.value`} control={form.control} render={({ field }) => ( <FormItem className="flex-grow"><FormControl><Input placeholder="e.g., Next.js" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeTech(techIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="certifications">
            <AccordionTrigger className="text-xl font-bold">Certifications</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <SectionHeader title="Your Certifications" onAdd={() => appendCert({ value: "" })} />
              {certFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField name={`certifications.${index}.value`} control={form.control} render={({ field }) => ( <FormItem className="flex-grow"><FormControl><Input placeholder="e.g., AWS Certified Cloud Practitioner" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeCert(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
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
