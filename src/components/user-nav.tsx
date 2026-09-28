
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useAuth, useStorage } from "@/firebase";
import { signOut, updateProfile } from "firebase/auth";
import { LogOut, User as UserIcon, Settings, Wallet } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { AuthDialog } from "./auth-dialog";
import { useState, useRef } from "react";
import { uploadAvatar } from "@/firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const storage = useStorage();
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [optimisticAvatarUrl, setOptimisticAvatarUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = () => {
    if (auth) {
      signOut(auth);
      setOptimisticAvatarUrl(null);
    }
  };

  const handleAvatarChangeClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !auth || !storage) {
        return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    toast({ title: "Uploading avatar...", description: "Please wait." });

    try {
      const onProgress = (percentage: number) => {
        setUploadProgress(percentage);
      };
      
      const newUrl = await uploadAvatar(storage, user, file, onProgress);
      
      setOptimisticAvatarUrl(newUrl);

      await updateProfile(user, { photoURL: newUrl });
      await user.getIdToken(true);

      toast({ title: "Success!", description: "Your avatar has been updated." });
    } catch (error: any) {
      console.error("Avatar upload process failed:", error);
      toast({ variant: "destructive", title: "Upload Failed", description: error.message || "An unknown error occurred." });
      setOptimisticAvatarUrl(null); // Revert on failure
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  if (isUserLoading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild>
        <Link href="/editor/new">Build Resume</Link>
      </Button>
    </div>
  )
  
  const userDisplayName = "Visitor";
  const userEmail = "Anonymous session";
  const defaultAvatar = `https://api.dicebear.com/8.x/lorelei/svg?seed=anonymous`;
  const avatarUrl = defaultAvatar;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} alt={`@${userDisplayName}`} />
              <AvatarFallback>
                <UserIcon className="h-5 w-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userDisplayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem disabled>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Session Active</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
