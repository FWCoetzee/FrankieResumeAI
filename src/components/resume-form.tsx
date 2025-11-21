"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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

const defaultValues: Partial<ResumeData> = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  jobDescription: "",
  skills: [{ value: "React" }, { value: "Next.js" }, {value: "TypeScript"}],
  experience: [
    {
      title: "Software Engineer",
      company: "Tech Corp",
      startDate: "2022-01-01",
      endDate: "Present",
      description: "- Developed and maintained web applications using React and Node.js.\n- Collaborated with cross-functional teams to deliver high-quality software.",
    },
  ],
  education: [
    {
      institution: "University of Technology",
      degree: "B.S. in Computer Science",
      startDate: "2018-09-01",
      endDate: "2022-05-01",
      description: "Graduated with honors.",
    },
  ],
  projects: [
    {
      name: "Personal Portfolio",
      description: "A responsive portfolio website built with Next.js and Tailwind CSS.",
    },
  ],
  additionalSections: [],
};

export function ResumeForm({ onGenerate, isLoading }: ResumeFormProps) {
  const form = useForm<ResumeData>({
    resolver: zodResolver(resumeSchema),
    defaultValues,
    mode: "onBlur",
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control: form.control, name: "skills" });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: "experience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: "education" });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control: form.control, name: "projects" });
  const { fields: addFields, append: appendAdd, remove: removeAdd } = useFieldArray({ control: form.control, name: "additionalSections" });

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
        <Accordion type="multiple" defaultValue={['personal', 'job']} className="w-full">
          <AccordionItem value="personal">
            <AccordionTrigger className="text-xl font-bold">Personal Details</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <FormField name="name" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField name="email" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john.doe@email.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="phone" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem> )} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField name="linkedin" control={form.control} render={({ field }) => ( <FormItem><FormLabel>LinkedIn Profile</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/johndoe" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="github" control={form.control} render={({ field }) => ( <FormItem><FormLabel>GitHub Profile</FormLabel><FormControl><Input placeholder="https://github.com/johndoe" {...field} /></FormControl><FormMessage /></FormItem> )} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="job">
            <AccordionTrigger className="text-xl font-bold">Target Job</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
               <FormField name="jobDescription" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Job Description</FormLabel><FormControl><Textarea placeholder="Paste the job description here to get tailored suggestions..." {...field} rows={6} /></FormControl><FormMessage /></FormItem> )} />
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

          <AccordionItem value="experience">
            <AccordionTrigger className="text-xl font-bold">Work Experience</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <SectionHeader title="Your Experience" onAdd={() => appendExp({ title: "", company: "", startDate: "", endDate: "", description: "" })} />
              {expFields.map((field, index) => (
                <Card key={field.id} className="relative">
                  <CardContent className="pt-6 space-y-4">
                    <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => removeExp(index)}><Trash2 className="h-4 w-4" /></Button>
                    <FormField name={`experience.${index}.title`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="Software Engineer" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField name={`experience.${index}.company`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Acme Inc." {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField name={`experience.${index}.startDate`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                      <FormField name={`experience.${index}.endDate`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>End Date (optional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                    <FormField name={`experience.${index}.description`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your responsibilities and achievements..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </CardContent>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
          
          {/* Similar AccordionItems for Education, Projects, Additional Sections */}
          <AccordionItem value="education">
            <AccordionTrigger className="text-xl font-bold">Education</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <SectionHeader title="Your Education" onAdd={() => appendEdu({ institution: "", degree: "", startDate: "", endDate: "", description: "" })} />
              {eduFields.map((field, index) => (
                <Card key={field.id} className="relative">
                  <CardContent className="pt-6 space-y-4">
                    <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => removeEdu(index)}><Trash2 className="h-4 w-4" /></Button>
                    <FormField name={`education.${index}.institution`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Institution</FormLabel><FormControl><Input placeholder="University of Example" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField name={`education.${index}.degree`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Degree</FormLabel><FormControl><Input placeholder="B.S. in Computer Science" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField name={`education.${index}.startDate`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                      <FormField name={`education.${index}.endDate`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>End Date (optional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                     <FormField name={`education.${index}.description`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Description (optional)</FormLabel><FormControl><Textarea placeholder="Relevant coursework, achievements..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </CardContent>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="projects">
            <AccordionTrigger className="text-xl font-bold">Projects</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <SectionHeader title="Your Projects" onAdd={() => appendProj({ name: "", description: "" })} />
              {projFields.map((field, index) => (
                 <Card key={field.id} className="relative">
                  <CardContent className="pt-6 space-y-4">
                    <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => removeProj(index)}><Trash2 className="h-4 w-4" /></Button>
                    <FormField name={`projects.${index}.name`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input placeholder="My Awesome App" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField name={`projects.${index}.description`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A brief description of the project..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </CardContent>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="additional">
            <AccordionTrigger className="text-xl font-bold">Additional Sections</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <SectionHeader title="Custom Sections" onAdd={() => appendAdd({ title: "", content: "" })} />
               {addFields.map((field, index) => (
                 <Card key={field.id} className="relative">
                  <CardContent className="pt-6 space-y-4">
                    <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => removeAdd(index)}><Trash2 className="h-4 w-4" /></Button>
                    <FormField name={`additionalSections.${index}.title`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Section Title</FormLabel><FormControl><Input placeholder="e.g., Certifications" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField name={`additionalSections.${index}.content`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Content</FormLabel><FormControl><Textarea placeholder="Details of the section..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </CardContent>
                </Card>
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
            "Generate Resume"
          )}
        </Button>
      </form>
    </Form>
  );
}
