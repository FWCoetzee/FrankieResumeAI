
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Zap, Target, Bot, BookCopy, Languages, Star, Linkedin, Maximize } from "lucide-react";
import Link from 'next/link';

const features = [
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: "AI Resume Generator",
      description: "Our AI crafts a professional, keyword-rich resume from your raw notes in seconds. No more staring at a blank page."
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Job-Tailored Variants",
      description: "Instantly create multiple versions of your resume, each perfectly tailored to a specific job description."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "ATS Keyword Optimization",
      description: "Beat the bots. We automatically identify and weave in essential keywords to get your resume past applicant tracking systems."
    },
    {
      icon: <BookCopy className="h-8 w-8 text-primary" />,
      title: "AI Cover Letter Generator",
      description: "Generate persuasive cover letters that complement your resume and highlight your most relevant qualifications."
    },
    {
      icon: <Linkedin className="h-8 w-8 text-primary" />,
      title: "LinkedIn Rewrite Tool",
      description: "Optimize your LinkedIn profile summary and experience sections with AI-powered suggestions for maximum impact."
    },
    {
      icon: <Languages className="h-8 w-8 text-primary" />,
      title: "Multi-Language Export",
      description: "Reach a wider audience by exporting your resume in any of South Africa's 11 official languages."
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: "Modern Themes",
      description: "Choose from a library of clean, modern, and professional templates designed to impress recruiters."
    },
    {
        icon: <Maximize className="h-8 w-8 text-primary" />,
        title: "Future Expansion Tools",
        description: "Your lifetime access includes all future tools, such as interview prep simulators and salary negotiation guides."
    }
  ];

  const faqItems = [
    {
      question: "How does the AI work?",
      answer: "Our AI is trained on thousands of successful resumes across various industries. It analyzes your data and a target job description to generate optimized, professional content that highlights your strengths."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We prioritize your privacy. Your data is encrypted and is never shared with third parties. You have full control to delete your information from our servers at any time."
    },
    {
      question: "What is an ATS-optimized resume?",
      answer: "Applicant Tracking Systems (ATS) are used by most companies to filter resumes. An ATS-optimized resume is formatted correctly and contains the right keywords to ensure it gets seen by a human recruiter."
    },
    {
      question: "Can I try it for free?",
      answer: "Yes! Our Free Tier allows you to generate a resume and explore the basic features. The Pro and Lifetime tiers unlock advanced capabilities like unlimited variants, cover letters, and multi-language support."
    },
    {
      question: "What's included in the Lifetime Deal?",
      answer: "The Lifetime Deal is a one-time purchase that gives you permanent access to all current and future Pro features. This includes unlimited resume generations, cover letters, all themes, and multi-language exports."
    },
    {
      question: "Can I customize the generated resume?",
      answer: "Yes. While our AI provides a strong foundation, you can always go back to the form to edit any section of your resume. The AI's role is to eliminate writer's block and do the heavy lifting for you."
    }
  ];

  const testimonials = [
    {
      quote: "This tool is a game-changer. I spent weeks trying to write my resume and got a polished, professional version in five minutes. I got three interview calls the first week I used it.",
      name: "Thabo Ndlovu",
      role: "Senior Software Engineer"
    },
    {
      quote: "As a recent graduate, I had no idea where to start. The AI Resume Builder helped me frame my internship experience in a way that sounded so much more professional. It gave me the confidence to apply for my dream job.",
      name: "Anika Patel",
      role: "Junior Graphic Designer"
    },
     {
      quote: "The ability to create tailored resumes for each application is incredible. It used to take me hours, but now it takes seconds. This is the best R199 I've ever spent on my career.",
      name: "Chris van der Merwe",
      role: "Project Manager"
    }
  ]

export function LandingPage() {
    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="w-full text-center py-20 md:py-32">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-primary">Build Your Future, Faster Than Ever</h1>
                <p className="max-w-2xl mx-auto mt-4 text-lg md:text-xl text-muted-foreground">Let our advanced AI craft a job-winning resume in seconds. Stand out from the crowd and land your dream job.</p>
                <div className="mt-8 flex justify-center gap-4 flex-wrap">
                    <Link href="/#resume-builder"><Button size="lg" className="w-full sm:w-auto">Generate My Resume</Button></Link>
                    <Link href="/subscribe?plan=lifetime"><Button size="lg" variant="outline" className="w-full sm:w-auto">Get Lifetime Access for R199</Button></Link>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Unlock your career potential with the power of AI.</p>
            </section>

            {/* How It Works */}
            <section className="w-full py-16 md:py-24 bg-muted">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">Get Your Perfect Resume in 3 Simple Steps</h2>
                    <div className="mt-12 grid md:grid-cols-3 gap-8 md:gap-12">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">1</div>
                            <h3 className="mt-6 text-xl font-semibold">Enter Your Details</h3>
                            <p className="mt-2 text-muted-foreground">Fill in our intuitive form with your career history, skills, and education. No complex formatting needed.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">2</div>
                            <h3 className="mt-6 text-xl font-semibold">Let the AI Work Its Magic</h3>
                            <p className="mt-2 text-muted-foreground">Our AI analyzes your profile and the target job to write compelling, professional content.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">3</div>
                            <h3 className="mt-6 text-xl font-semibold">Download & Apply</h3>
                            <p className="mt-2 text-muted-foreground">Receive a polished, ATS-friendly resume in seconds. Download in your preferred format and language.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Why This Tool Is Different */}
            <section className="w-full py-16 md:py-24">
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold">The Unfair Advantage for Your Job Hunt</h2>
                        <p className="mt-4 text-lg text-muted-foreground">We built the tool we wished we had. It's more than a template—it's your personal career co-pilot.</p>
                    </div>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-green-500 mt-1 shrink-0" /><div><h4 className="font-semibold">Instant Resume Generation</h4><p className="text-sm text-muted-foreground">Go from draft to distinction in under a minute.</p></div></li>
                        <li className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-green-500 mt-1 shrink-0" /><div><h4 className="font-semibold">ATS Optimization</h4><p className="text-sm text-muted-foreground">Our AI knows what recruiters' robots want to see.</p></div></li>
                        <li className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-green-500 mt-1 shrink-0" /><div><h4 className="font-semibold">Job-Tailored Rewrites</h4><p className="text-sm text-muted-foreground">Create unlimited, perfectly targeted resumes for every application.</p></div></li>
                        <li className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-green-500 mt-1 shrink-0" /><div><h4 className="font-semibold">Modern Design Themes</h4><p className="text-sm text-muted-foreground">Choose from a gallery of templates that are professional, not predictable.</p></div></li>
                        <li className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-green-500 mt-1 shrink-0" /><div><h4 className="font-semibold">Multilingual Export</h4><p className="text-sm text-muted-foreground">Export your resume in all 11 official South African languages.</p></div></li>
                        <li className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-green-500 mt-1 shrink-0" /><div><h4 className="font-semibold">Your Data is Private</h4><p className="text-sm text-muted-foreground">We respect your privacy. Your data is secure and never shared.</p></div></li>
                    </ul>
                </div>
            </section>

             {/* Early Access Offer */}
            <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">Limited Offer: Get Lifetime Access</h2>
                    <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">Become an early supporter and get lifetime access to all Pro features for a single, once-off payment.</p>
                    <div className="mt-8 text-5xl font-extrabold">R199 <span className="text-2xl font-normal opacity-80">once-off</span></div>
                    <p className="mt-2 text-primary-foreground/80">(Normally R99 per month)</p>
                    <div className="mt-8 max-w-md mx-auto text-left space-y-2">
                        <p className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-400" /> Unlimited AI Resume Generations</p>
                        <p className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-400" /> Unlimited Cover Letters</p>
                        <p className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-400" /> All Resume Themes</p>
                        <p className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-400" /> Multi-Language Export</p>
                        <p className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-400" /> All Future Tools & Updates</p>
                    </div>
                    <Link href="/subscribe?plan=lifetime"><Button size="lg" variant="secondary" className="mt-8 w-full sm:w-auto">Claim Your Lifetime Deal</Button></Link>
                </div>
            </section>
            
            {/* Features Section */}
            <section id="features" className="w-full py-16 md:py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Get Hired</h2>
                    <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">Our feature suite is designed to give you an edge at every step of your job application process.</p>
                    <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                        <Card key={index} className="text-left hover:shadow-lg transition-shadow">
                            <CardHeader>
                                {feature.icon}
                                <CardTitle className="mt-4">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Pricing Section */}
            <section id="pricing" className="w-full py-16 md:py-24 bg-muted">
                 <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold">Choose Your Plan</h2>
                        <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">Start for free, or unlock powerful features to accelerate your job search.</p>
                    </div>
                    <div className="mt-12 grid lg:grid-cols-3 gap-8 items-start">
                        <Card className="flex flex-col h-full">
                            <CardHeader>
                                <CardTitle>Free</CardTitle>
                                <p className="text-4xl font-bold">R0</p>
                                <p className="text-muted-foreground">Perfect for a quick start.</p>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2">
                                <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 1 AI Resume Generation</p>
                                <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Basic Resume Theme</p>
                                <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> ATS Optimization</p>
                            </CardContent>
                            <CardFooter>
                                <Link href="/subscribe?plan=free" className="w-full"><Button variant="outline" className="w-full">Get Started</Button></Link>
                            </CardFooter>
                        </Card>
                        <Card className="border-2 border-primary flex flex-col h-full shadow-lg">
                             <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Pro</CardTitle>
                                    <div className="text-sm font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full">Most Popular</div>
                                </div>
                                <div><span className="text-4xl font-bold">R99</span><span className="text-muted-foreground">/mo</span></div>
                                <p className="text-muted-foreground">For the serious job seeker.</p>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2">
                                <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Unlimited AI Resumes</p>
                                <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Unlimited Cover Letters</p>
                                <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> All Modern Themes</p>
                                <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Multi-Language Export</p>
                                <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> LinkedIn Rewrite Tool</p>
                            </CardContent>
                            <CardFooter>
                                <Link href="/subscribe?plan=pro" className="w-full"><Button className="w-full">Go Pro</Button></Link>
                            </CardFooter>
                        </Card>
                         <Card className="flex flex-col h-full">
                            <CardHeader>
                                <CardTitle>Lifetime Access</CardTitle>
                                <div><span className="text-4xl font-bold">R199</span><span className="text-muted-foreground"> once-off</span></div>
                                <p className="text-muted-foreground">Pay once, own it forever.</p>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2">
                                <p className="font-semibold">Everything in Pro, plus:</p>
                                <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> All Future Tools & Updates</p>
                                <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Priority Support</p>
                                <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> One-Time Payment</p>
                            </CardContent>
                            <CardFooter>
                                <Link href="/subscribe?plan=lifetime" className="w-full"><Button variant="outline" className="w-full">Get Lifetime Access</Button></Link>
                            </CardFooter>
                        </Card>
                    </div>
                 </div>
            </section>

             {/* Testimonials */}
             <section className="w-full py-16 md:py-24">
                <div className="container mx-auto px-4">
                     <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold">Loved by Professionals Across South Africa</h2>
                     </div>
                     <div className="mt-12 grid lg:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <p className="italic">"{t.quote}"</p>
                                </CardContent>
                                <CardFooter className="flex flex-col items-start">
                                    <p className="font-semibold">{t.name}</p>
                                    <p className="text-sm text-muted-foreground">{t.role}</p>
                                </CardFooter>
                            </Card>
                        ))}
                     </div>
                </div>
             </section>

             {/* FAQ Section */}
            <section id="faq" className="w-full py-16 md:py-24 bg-muted">
                <div className="container mx-auto px-4 max-w-3xl">
                     <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
                     </div>
                     <Accordion type="single" collapsible className="w-full mt-12">
                        {faqItems.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-lg font-semibold text-left">{item.question}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

             {/* Final CTA */}
            <section className="w-full py-20 md:py-32 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to Land Your Dream Job?</h2>
                    <p className="max-w-xl mx-auto mt-4 text-lg text-muted-foreground">Stop wasting time on formatting and second-guessing. Start building a resume that gets results.</p>
                    <Link href="/#resume-builder"><Button size="lg" className="mt-8 w-full sm:w-auto">Generate Your AI Resume Now</Button></Link>
                </div>
            </section>

        </div>
    );
}
