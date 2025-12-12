
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";


interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "login" | "signup";
}

export function AuthDialog({ open, onOpenChange, initialMode = 'login' }: AuthDialogProps) {
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Almost there!</DialogTitle>
          <DialogDescription>
            To save your resume and access all features, you need an account. It's free to get started.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col !space-y-2 pt-4 sm:flex-col sm:!space-x-0">
            <Button asChild size="lg">
                <Link href="/auth/signup">Create an Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">Log In to Existing Account</Link>
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
