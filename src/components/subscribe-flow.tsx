
'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSubscription, type PlanId } from '@/hooks/use-subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, ShieldCheck, UploadCloud, Lock, FileText, Mail, User } from 'lucide-react';
import { StripeLogo, PaypalLogo } from './icons';
import Link from 'next/link';

const userDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  email: z.string().email('Please enter a valid email address'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  emailUpdates: z.boolean().optional(),
  cvFile: z.any().optional(),
});

type UserDetailsForm = z.infer<typeof userDetailsSchema>;

const PlanConfirmationStep = ({ plan, onContinue, onChooseDifferent }: { plan: any, onContinue: () => void, onChooseDifferent: () => void }) => (
    <Card>
        <CardHeader>
            <CardTitle>Confirm Your Plan</CardTitle>
            <CardDescription>You've selected a great option to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="text-xl font-bold text-primary">{plan.name}</h3>
                <p className="text-2xl font-bold">{plan.price} <span className="text-sm font-normal text-muted-foreground">{plan.pricePeriod}</span></p>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            </div>
            <div className="space-y-2">
                <h4 className="font-semibold">Key features included:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {feature}</li>
                    ))}
                </ul>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button onClick={onContinue} className="w-full sm:w-auto">Continue</Button>
            <Button variant="ghost" onClick={onChooseDifferent} className="w-full sm:w-auto">Choose a Different Plan</Button>
        </CardFooter>
    </Card>
);

const UserDetailsStep = ({ onBack, onSubmit }: { onBack: () => void, onSubmit: (data: UserDetailsForm) => void }) => {
    const form = useForm<UserDetailsForm>({
        resolver: zodResolver(userDetailsSchema),
        defaultValues: {
            firstName: '',
            email: '',
            acceptTerms: false,
            emailUpdates: true,
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <CardDescription>Just a few details to set up your account. We only ask for what's essential.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form id="user-details-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="firstName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl><Input placeholder="John" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="cvFile" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Upload Existing CV (Optional)</FormLabel>
                                <FormControl>
                                    <div className="relative border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                                        <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
                                        <p className="mt-2 text-sm text-muted-foreground">Drag & drop your file here, or click to browse.</p>
                                        <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => field.onChange(e.target.files)} />
                                    </div>
                                </FormControl>
                                <FormDescription>We'll use this to pre-fill your information, saving you time.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="acceptTerms" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>I agree to the <Link href="/terms" className="underline hover:text-primary">Terms & Conditions</Link></FormLabel>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="emailUpdates" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Receive email updates about new features and offers.</FormLabel>
                                </div>
                            </FormItem>
                        )} />
                    </form>
                </Form>
                 <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm flex items-start gap-3 text-muted-foreground">
                    <ShieldCheck className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                        <strong>Your Information is Safe.</strong> We will never share or sell your data. Your privacy is our top priority. All payments are securely processed and encrypted.
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col-reverse sm:flex-row justify-between gap-2">
                <Button variant="ghost" onClick={onBack}>Back</Button>
                <Button type="submit" form="user-details-form">Proceed to Secure Checkout</Button>
            </CardFooter>
        </Card>
    );
};

const CheckoutStep = ({ plan, userDetails, onBack, onCheckout }: { plan: any, userDetails: UserDetailsForm, onBack: () => void, onCheckout: () => void }) => {
    const microFaq = [
        { q: "Why is my email required?", a: "We use your email to create your secure account and send you a receipt." },
        { q: "How is my data used?", a: "Your data is only used to generate your resume documents. We do not sell or share it." },
        { q: "What is the refund policy?", a: "We offer a 14-day money-back guarantee on our Lifetime Deal. Monthly plans can be cancelled anytime." },
        { q: "Can I change my plan later?", a: "Yes, you can upgrade, downgrade, or cancel your plan from your account dashboard at any time." },
    ];
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Checkout Summary</CardTitle>
                <CardDescription>You're one step away from unlocking your career potential. Please confirm your order.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="p-4 border rounded-lg bg-muted/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-primary">{plan.name}</p>
                                <p className="text-sm text-muted-foreground">Billed {plan.pricePeriod === 'once-off' ? 'once' : 'monthly'}</p>
                            </div>
                            <p className="text-xl font-bold">{plan.price}</p>
                        </div>
                        <div className="border-t my-3"></div>
                         <div className="flex justify-between font-bold">
                            <p>Total</p>
                            <p>{plan.price}</p>
                        </div>
                    </div>
                    <div className="text-sm space-y-3">
                         <h4 className="font-semibold">What you'll unlock immediately:</h4>
                         <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                            {plan.features.map((f: string, i: number) => <li key={i}>{f}</li>)}
                         </ul>
                         {plan.id === 'pro' && <p className="text-xs text-muted-foreground">You can cancel your subscription at any time.</p>}
                         {plan.id === 'lifetime' && <p className="text-xs text-muted-foreground">This is a one-time payment with no recurring charges.</p>}
                    </div>

                    <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-2">Secure Payment Options:</h4>
                        <div className="flex items-center gap-4">
                            <StripeLogo className="h-8 w-auto text-gray-500" />
                            <PaypalLogo className="h-8 w-auto" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                     <h4 className="font-semibold text-sm">Quick Questions</h4>
                     <Accordion type="single" collapsible className="w-full">
                        {microFaq.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-sm text-left">{item.q}</AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground">
                                {item.a}
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col-reverse sm:flex-row justify-between gap-2">
                <Button variant="ghost" onClick={onBack}>Back to Details</Button>
                <Button onClick={onCheckout} size="lg"><Lock className="mr-2 h-4 w-4" /> Proceed to Checkout</Button>
            </CardFooter>
        </Card>
    )
}

function SubscribeFlowContent({ selectedPlanId }: { selectedPlanId: PlanId }) {
    const { plan, setPlanId, userDetails, setUserDetails, currentStep, setCurrentStep } = useSubscription(selectedPlanId);

    const goTo = (step: number) => setCurrentStep(step);
    const goNext = () => setCurrentStep(currentStep + 1);
    const goBack = () => setCurrentStep(currentStep - 1);

    const handleUserDetailsSubmit = (data: UserDetailsForm) => {
        setUserDetails(data);
        goNext();
    };

    const handleGoToPricing = () => {
        // This will navigate the user back to the pricing page
        window.location.href = '/pricing';
    }
    
    const handleGoToCheckout = () => {
        // Here you would integrate with Stripe/Paypal
        console.log("Proceeding to checkout with:", { plan, userDetails });
        alert("Redirecting to payment gateway...");
    }

    if (!plan) {
        return (
            <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Loading plan details...</p>
            </div>
        );
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <PlanConfirmationStep plan={plan} onContinue={goNext} onChooseDifferent={handleGoToPricing} />;
            case 2:
                return <UserDetailsStep onBack={goBack} onSubmit={handleUserDetailsSubmit} />;
            case 3:
                if (!userDetails) {
                    goTo(2); // Should not happen, but as a safeguard
                    return null;
                }
                return <CheckoutStep plan={plan} userDetails={userDetails} onBack={goBack} onCheckout={handleGoToCheckout} />;
            default:
                goTo(1);
                return null;
        }
    };

    return (
        <div className="w-full">
            {renderStep()}
        </div>
    );
}


// A wrapper component is needed to use the useSearchParams hook, as it must be inside a <Suspense> boundary.
export function SubscribeFlow({ selectedPlanId: initialPlanId }: { selectedPlanId: string }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscribeFlowResolver initialPlanId={initialPlanId} />
    </Suspense>
  )
}

function SubscribeFlowResolver({ initialPlanId }: { initialPlanId: string }) {
  const searchParams = useSearchParams();
  const planIdFromUrl = searchParams.get('plan');
  
  // The plan from the URL has the highest priority. Fallback to the prop from the server component.
  const finalPlanId = (planIdFromUrl || initialPlanId) as PlanId;

  return <SubscribeFlowContent selectedPlanId={finalPlanId} />
}
