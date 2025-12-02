
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
import { signOut } from "firebase/auth";
import { LogIn, LogOut, User, UserPlus, Image as ImageIcon, Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { AuthDialog } from "./auth-dialog";
import { useState, useRef, useEffect } from "react";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { uploadAvatar } from "@/firebase/storage";
import { useToast } from "@/hooks/use-toast";

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const storage = useStorage();
  const { toast } = useToast();

  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogMode, setAuthDialogMode] = useState<"login" | "signup">("login");
  const [isUploading, setIsUploading] = useState(false);
  const [optimisticAvatarUrl, setOptimisticAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    // When the user object changes (login/logout), reset the optimistic URL
    // and sync it with the user's current photoURL.
    setOptimisticAvatarUrl(user?.photoURL || null);
  }, [user]);


  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = () => {
    if (auth) {
      signOut(auth);
    }
  };
  
  const handleAnonymousSignIn = () => {
    if (auth) {
      initiateAnonymousSignIn(auth);
    }
  }

  const openAuthDialog = (mode: "login" | "signup") => {
    setAuthDialogMode(mode);
    setAuthDialogOpen(true);
  }

  const handleAvatarChangeClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user && auth && storage) {
      setIsUploading(true);
      toast({ title: "Uploading avatar...", description: "Please wait." });
      try {
        const newUrl = await uploadAvatar(storage, auth, user, file);
        setOptimisticAvatarUrl(newUrl);
        toast({ title: "Success!", description: "Your avatar has been updated." });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Upload Failed", description: error.message });
      } finally {
        setIsUploading(false);
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  }

  if (isUserLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  const userDisplayName = user?.isAnonymous ? "Anonymous User" : user?.displayName || "User";
  const userEmail = user?.isAnonymous ? "Anonymous session" : user?.email || user?.uid;
  const defaultAvatar = `https://api.dicebear.com/8.x/lorelei/svg?seed=${user?.uid}`;
  const avatarUrl = optimisticAvatarUrl || user?.photoURL || defaultAvatar;


  return (
    <>
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen} 
        initialMode={authDialogMode}
      />
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/gif"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
             {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
            ) : (
                 <Avatar className="h-9 w-9">
                    <AvatarImage src={avatarUrl} alt={`@${userDisplayName}`} />
                    <AvatarFallback>
                        <User className="h-5 w-5" />
                    </AvatarFallback>
                </Avatar>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          {user ? (
            <>
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
                <DropdownMenuItem onClick={handleAvatarChangeClick} disabled={isUploading}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  <span>Change Avatar</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Not Logged In</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Log in to save your work
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                 <DropdownMenuItem onClick={() => openAuthDialog("signup")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openAuthDialog("login")}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </DropdownMenuItem>
                 <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAnonymousSignIn}>
                  Log in anonymously
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
