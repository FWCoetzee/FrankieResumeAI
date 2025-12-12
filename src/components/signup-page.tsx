
'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, useUser } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});
type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect them to the dashboard
    if (user) {
      router.replace('/app/dashboard');
    }
  }, [user, router]);
  
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const handleSignUp = async (values: SignUpFormValues) => {
    if (!auth) return;
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(userCredential.user, { displayName: values.name });
      toast({ title: "Account Created", description: "Welcome! You've been successfully signed up." });
      router.push('/app/dashboard');
    } catch (err: any) {
       if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists. Please log in instead.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>It's free to get started. Save your work and access your history.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="password" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               {error && <p className="text-sm text-center text-destructive pt-2">{error}</p>}
              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col gap-4 text-center text-sm">
            <p className="text-muted-foreground">
                Already have an account? <Link href="/auth/login" className="underline hover:text-primary">Log in</Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
