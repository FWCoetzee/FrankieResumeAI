
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Bot, Zap, Target, BookCopy, Linkedin, Languages, Star, Maximize, TrendingUp, ShieldCheck } from "lucide-react";
import Link from 'next/link';

const faqItems = [
    {
        question: "Can I cancel my Pro plan anytime?",
        answer: "Yes, absolutely. You can cancel your monthly subscription at any time from your account dashboard. You will retain access to Pro features until the end of your current billing cycle."
    },
    {
        question: "How do refunds work?",
        answer: "For the Lifetime Deal, we offer a 14-day money-back guarantee. If you're not satisfied, just contact support within 14 days of your purchase for a full refund. Monthly subscriptions are non-refundable."
    },
    {
        question: "Will my resume be deleted if I cancel my subscription?",
        answer: "No. Your account and all the resumes you've created will remain securely stored. You will revert to the Free plan and can still access and view your documents, but Pro features will be disabled."
    },
    {
        question: "Is the payment process secure?",
        answer: "Yes. All payments are processed through Stripe, a certified PCI Service Provider Level 1. This is the most stringent level of certification available in the payments industry. We do not store your credit card details on our servers."
    },
    {
        question: "What happens after I purchase the Lifetime Deal?",
        answer: "Your account will be instantly upgraded to have permanent access to all current and future Pro features. There are no further payments or hidden fees. You get everything, forever."
    },
    {
        question: "Is this tool suitable for all industries and experience levels?",
        answer: "Yes. Our AI is trained on a vast range of successful resumes from students to executives across dozens of industries, including tech, creative, finance, and healthcare. You can tailor the output to match your specific career goals."
    },
    {
        question: "What are the 'future tools' included in the Lifetime Deal?",
        answer: "We are constantly working on new features to help your career. Upcoming tools include an AI-powered interview preparation simulator, a salary negotiation guide, and more advanced analytics. As a Lifetime member, you get them all at no extra cost."
    },
    {
        question: "Can I edit the resume after the AI generates it?",
        answer: "Of course. The AI provides a powerful, optimized foundation, but you always have the final say. You can easily go back to the form to edit any section of your resume and regenerate it as many times as you need."
    }
];

const features = [
    {
        icon: <Bot className="h-6 w-6 text-primary" />,
        title: "AI Resume Generator",
        description: "Transform your notes and career history into a polished, professional resume in seconds. Our AI handles the writing, formatting, and keyword optimization."
    },
    {
        icon: <Zap className="h-6 w-6 text-primary" />,
        title: "ATS Optimizer",
        description: "Beat the application tracking systems (ATS) that filter out most resumes. Our tool ensures your resume has the right keywords and format to get seen by recruiters."
    },
    {
        icon: <Target className="h-6 w-6 text-primary" />,
        title: "Job-Tailored Rewrites",
        description: "Stop sending generic resumes. Instantly create unlimited versions of your resume, each perfectly tailored to a specific job description to maximize your chances."
    },
    {
        icon: <BookCopy className="h-6 w-6 text-primary" />,
        title: "AI Cover Letter Generator",
        description: "Generate a compelling cover letter that complements your resume and highlights your most relevant qualifications for the job you want."
    },
    {
        icon: <Linkedin className="h-6 w-6 text-primary" />,
        title: "LinkedIn Rewrite Tool",
        description: "Optimize your LinkedIn profile summary and experience sections with AI-powered suggestions to attract recruiters and build your professional brand."
    },
    {
        icon: <Languages className="h-6 w-6 text-primary" />,
        title: "Multi-Language Support",
        description: "Reach a wider audience. Export your resume and cover letter in any of South Africa's 11 official languages with a single click."
    },
    {
        icon: <Star className="h-6 w-6 text-primary" />,
        title: "Modern Design Templates",
        description: "Choose from a library of clean, modern, and professional templates that are designed to impress recruiters and make your profile stand out."
    },
    {
        icon: <Maximize className="h-6 w-6 text-primary" />,
        title: "Future Tools & Expansions",
        description: "Your one-time purchase of the Lifetime Deal includes permanent access to all future tools, such as interview prep simulators and salary negotiation guides."
    }
]

export function PricingPage() {
    return (
        <div className="flex flex-col items-center">
            {/* Title Section */}
            <section className="w-full text-center py-16 md:py-24">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary">Find the Plan That’s Right for You</h1>
                <p className="max-w-xl mx-auto mt-4 text-lg text-muted-foreground">All plans are powered by our advanced AI to help you build a job-winning resume in minutes.</p>
            </section>

             {/* Pricing Comparison Table */}
            <section className="w-full pb-16 md:pb-24">
                 <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                        {/* Free Plan */}
                        <Card className="flex flex-col">
                            <CardHeader className="flex-grow">
                                <CardTitle>Free</CardTitle>
                                <p className="text-4xl font-bold">R0</p>
                                <CardDescription>Perfect for getting started and testing the waters.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-muted-foreground mt-1 shrink-0" /><div><strong>1 Resume</strong> generation</div></div>
                                <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-muted-foreground mt-1 shrink-0" /><div><strong>Basic Template</strong> access</div></div>
                                <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-muted-foreground mt-1 shrink-0" /><div><strong>Watermarked</strong> PDF download</div></div>
                                <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-muted-foreground mt-1 shrink-0" /><div>No advanced AI enhancements</div></div>
                            </CardContent>
                            <CardFooter>
                                <Link href="/subscribe?plan=free" className="w-full"><Button variant="outline" className="w-full">Choose Plan</Button></Link>
                            </CardFooter>
                        </Card>

                        {/* Pro Plan */}
                        <Card className="border-2 border-primary flex flex-col shadow-lg">
                             <CardHeader className="flex-grow">
                                <div className="flex justify-between items-center">
                                    <CardTitle>Pro</CardTitle>
                                    <div className="text-sm font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full">Most Popular</div>
                                </div>
                                <div><span className="text-4xl font-bold">R99</span><span className="text-muted-foreground"> / month</span></div>
                                <CardDescription>The essential toolkit for active job seekers.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" /><div><strong>Unlimited</strong> Resumes</div></div>
                                <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" /><div>All <strong>Pro Templates</strong></div></div>
                                <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" /><div>Job-Tailored Rewrites</div></div>
                                <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" /><div>AI Cover Letters</div></div>
                                <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" /><div>LinkedIn Enhancements</div></div>
                                <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" /><div>Multi-Language Export</div></div>
                            </CardContent>
                            <CardFooter>
                                <Link href="/subscribe?plan=pro" className="w-full"><Button className="w-full">Choose Plan</Button></Link>
                            </CardFooter>
                        </Card>

                        {/* Lifetime Deal */}
                        <Card className="flex flex-col">
                            <CardHeader className="flex-grow">
                                <CardTitle>Lifetime Deal</CardTitle>
                                <div><span className="text-4xl font-bold">R199</span><span className="text-muted-foreground"> once-off</span></div>
                                <CardDescription>Pay once and own it forever. No subscriptions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="font-semibold">Everything in Pro, plus:</p>
                                <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" /><div><strong>Unlimited Forever</strong> access</div></div>
                                <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" /><div>All <strong>Future Tools</strong> included</div></div>
                                <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" /><div>One-Time Payment</div></div>
                                <div className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" /><div>Priority Support</div></div>
                            </CardContent>
                            <CardFooter>
                                <Link href="/subscribe?plan=lifetime" className="w-full"><Button variant="outline" className="w-full">Choose Plan</Button></Link>
                            </CardFooter>
                        </Card>
                    </div>
                 </div>
            </section>

            {/* Feature Breakdown */}
            <section className="w-full py-16 md:py-24 bg-muted">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold">Features That Give You an Edge</h2>
                        <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">We built the tools you need to not just apply, but to stand out and get hired.</p>
                    </div>
                    <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                        <div key={index} className="text-left">
                            <div className="flex items-center gap-4">
                                {feature.icon}
                                <h3 className="text-lg font-semibold">{feature.title}</h3>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Value Justification */}
            <section className="w-full py-16 md:py-24">
                <div className="container mx-auto px-4 max-w-4xl">
                     <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold">Why Invest in an AI Resume Builder?</h2>
                        <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">Your resume is the single most important document in your job search. Here's why our AI gives you a crucial advantage.</p>
                     </div>
                     <div className="mt-12 grid md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-xl flex items-center gap-2"><TrendingUp/>AI-Powered Content Converts Better</h3>
                            <p className="text-muted-foreground">Our AI doesn't just fill a template. It writes persuasive, keyword-rich summaries and bullet points that grab a recruiter's attention in the first 6 seconds, dramatically increasing your chance of getting an interview.</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-xl flex items-center gap-2"><ShieldCheck/>Beat the Applicant Tracking Systems (ATS)</h3>
                            <p className="text-muted-foreground">Over 90% of large companies use ATS bots to filter resumes. Our tool ensures your resume is formatted correctly and contains the right keywords, so you don't get automatically rejected before a human ever sees your application.</p>
                        </div>
                         <div className="space-y-2">
                            <h3 className="font-semibold text-xl flex items-center gap-2"><Target/>Job-Tailoring is No Longer a Chore</h3>
                            <p className="text-muted-foreground">Recruiters expect you to tailor your resume for their specific role. This used to take hours. Now, you can create a perfectly optimized version for every single application in seconds, multiplying your effectiveness.</p>
                        </div>
                         <div className="space-y-2">
                            <h3 className="font-semibold text-xl flex items-center gap-2"><Zap/>Pay Once, Benefit Forever</h3>
                            <p className="text-muted-foreground">Your career isn't a subscription. Our Lifetime Deal is a small, one-time investment in your professional future. Get every tool you need, forever, without worrying about monthly bills. It's the smartest career purchase you'll make.</p>
                        </div>
                     </div>
                </div>
            </section>

             {/* Which plan should I choose? */}
            <section className="w-full py-16 md:py-24 bg-muted">
                <div className="container mx-auto px-4">
                     <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold">Which Plan Should I Choose?</h2>
                     </div>
                     <div className="mt-12 grid lg:grid-cols-3 gap-8 text-center">
                        <div>
                            <h3 className="text-xl font-semibold">Choose <span className="text-primary">Free</span> if...</h3>
                            <p className="mt-2 text-muted-foreground">You just want to quickly test the AI and see how it works. It's perfect for a one-off resume to get a feel for the platform.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Choose <span className="text-primary">Pro</span> if...</h3>
                            <p className="mt-2 text-muted-foreground">You are actively job hunting right now and need to create multiple, tailored resumes and cover letters for different applications.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Choose <span className="text-primary">Lifetime</span> if...</h3>
                            <p className="mt-2 text-muted-foreground">You are serious about your long-term career growth and want permanent access to a powerful tool at an unbeatable one-time price.</p>
                        </div>
                     </div>
                </div>
            </section>
            
            {/* FAQ Section */}
            <section className="w-full py-16 md:py-24">
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
            <section className="w-full py-20 md:py-24 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">Ready to Take Control of Your Career?</h2>
                    <p className="max-w-xl mx-auto mt-4 text-lg text-primary-foreground/80">Stop letting opportunities pass you by. Build a resume that opens doors.</p>

                    <div className="mt-8 flex justify-center gap-4 flex-wrap">
                        <Link href="/subscribe?plan=lifetime"><Button size="lg" variant="secondary">Choose Lifetime Deal</Button></Link>
                        <Link href="/subscribe?plan=free"><Button size="lg" variant="outline">Try Free Plan</Button></Link>
                    </div>
                     <p className="mt-4 text-sm text-primary-foreground/80">Your dream job is just a click away.</p>
                </div>
            </section>

        </div>
    );
}
