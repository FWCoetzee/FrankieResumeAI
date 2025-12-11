
'use client';

import { useUser, useAuth } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { Loader2, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function AccountPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
    if (user) {
      form.reset({ displayName: user.displayName || '' });
    }
  }, [user, isUserLoading, router, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !auth) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    
    setIsSaving(true);
    try {
      await updateProfile(user, { displayName: data.displayName });
      toast({ title: 'Success', description: 'Your profile has been updated.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const defaultAvatar = `https://api.dicebear.com/8.x/lorelei/svg?seed=${user?.uid}`;
  const avatarUrl = user?.photoURL || defaultAvatar;

  if (isUserLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your public profile and account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Avatar</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>
                    <UserIcon className="h-8 w-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">
                You can change your avatar from the user menu in the top-right corner.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <Label>Display Name</Label>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email || 'No email associated'} disabled />
                 <p className="text-sm text-muted-foreground">Email address cannot be changed.</p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
