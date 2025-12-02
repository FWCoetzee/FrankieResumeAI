
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
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { LogIn, LogOut, User, UserPlus } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { AuthDialog } from "./auth-dialog";
import { useState } from "react";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogMode, setAuthDialogMode] = useState<"login" | "signup">("login");

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

  if (isUserLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  const userDisplayName = user?.isAnonymous ? "Anonymous User" : user?.displayName || "User";
  const userEmail = user?.isAnonymous ? "Anonymous session" : user?.email || user?.uid;
  const avatarUrl = user ? `https://api.dicebear.com/8.x/lorelei/svg?seed=${user.uid}` : '';


  return (
    <>
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen} 
        initialMode={authDialogMode}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              {user && <AvatarImage src={avatarUrl} alt={`@${userDisplayName}`} />}
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
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
                <DropdownMenuItem disabled>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  Billing
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
