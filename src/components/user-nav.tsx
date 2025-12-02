
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
import { LogOut, Image as ImageIcon, Loader2, Settings } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { AuthDialog } from "./auth-dialog";
import { useState, useRef, useEffect } from "react";
import { uploadAvatar } from "@/firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "./ui/progress";

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const storage = useStorage();
  const { toast } = useToast();

  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogMode, setAuthDialogMode] = useState<"login" | "signup">("login");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [optimisticAvatarUrl, setOptimisticAvatarUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // When user changes, reset optimistic URL
  useEffect(() => {
    setOptimisticAvatarUrl(null);
  }, [user?.uid]);

  const handleSignOut = () => {
    if (auth) {
      signOut(auth);
    }
  };
  
  const openAuthDialog = (mode: "login" | "signup") => {
    setAuthDialogMode(mode);
    setAuthDialogOpen(true);
  }

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
      
      await updateProfile(user, { photoURL: newUrl });
      await user.getIdToken(true);

      setOptimisticAvatarUrl(newUrl);

      toast({ title: "Success!", description: "Your avatar has been updated." });
    } catch (error: any) {
      console.error("Avatar upload process failed:", error);
      toast({ variant: "destructive", title: "Upload Failed", description: error.message || "An unknown error occurred." });
      setOptimisticAvatarUrl(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  if (isUserLoading) {
    return <Skeleton className="h-24 w-24 rounded-full" />;
  }

  if (!user) {
     return (
        <>
            <AuthDialog 
                open={authDialogOpen} 
                onOpenChange={setAuthDialogOpen} 
                initialMode={authDialogMode}
            />
            <div className="flex items-center gap-2">
                <Button onClick={() => openAuthDialog('login')}>Log In</Button>
                <Button variant="secondary" onClick={() => openAuthDialog('signup')}>Sign Up</Button>
            </div>
        </>
     )
  }
  
  const userDisplayName = user?.isAnonymous ? "Anonymous User" : user?.displayName || "User";
  const userEmail = user?.isAnonymous ? "Anonymous session" : user?.email || user?.uid;
  const defaultAvatar = `https://api.dicebear.com/8.x/lorelei/svg?seed=${user?.uid}`;
  const avatarUrl = optimisticAvatarUrl || user.photoURL || defaultAvatar;

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
        disabled={isUploading}
      />
      <div className="flex items-center gap-4">
        <div className="relative group">
            
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full transition-opacity z-10">
                <div className="relative h-28 w-28">
                   <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle
                      className="text-muted"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-primary"
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={(2 * Math.PI * 40) * (1 - uploadProgress / 100)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                  </svg>
                   <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
                        {Math.round(uploadProgress)}%
                    </span>
                </div>
              </div>
            )}
            
            {!isUploading && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                  onClick={handleAvatarChangeClick}
                >
                    <ImageIcon className="h-8 w-8 text-white" />
                </div>
            )}
            
            <Avatar className="h-24 w-24 border-4 border-muted">
                <AvatarImage src={avatarUrl} alt={`@${userDisplayName}`} />
                <AvatarFallback>
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </AvatarFallback>
            </Avatar>
        </div>
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Settings />
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
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
