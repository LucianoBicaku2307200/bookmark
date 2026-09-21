"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ListChecks, LogOut } from "lucide-react";
import { useDailyTrackStore } from "@/store/daily-track-store";
import { useAuth } from "@/components/auth/auth-provider";
import { DateRangePicker } from "./date-range-picker";
import { ActivityManager } from "./activity-manager";

function UserProfileDropdown() {
    const { user, signOut } = useAuth();

    if (!user) return null;

    const getInitials = (email: string) => email.substring(0, 2).toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="size-8">
                        <AvatarFallback className="text-xs">
                            {getInitials(user.email || "U")}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 size-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function DailyTrackHeader() {
    const [managerOpen, setManagerOpen] = useState(false);
    const { activities, entries, range, setRange } = useDailyTrackStore();

    return (
        <>
            <header className="w-full border-b">
                <div className="flex items-center justify-between h-14 px-4">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="h-5" />
                        <div className="hidden sm:block">
                            <h1 className="text-base font-semibold leading-tight">
                                Daily Track
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {entries.length} logged days · {activities.length} activities
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DateRangePicker range={range} onChange={setRange} />

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setManagerOpen(true)}
                        >
                            <ListChecks className="size-4" />
                            <span className="hidden sm:inline ml-2">Activities</span>
                        </Button>

                        <Separator orientation="vertical" className="h-5 hidden sm:block" />

                        <UserProfileDropdown />

                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <ActivityManager
                open={managerOpen}
                onOpenChange={setManagerOpen}
                activities={activities}
            />
        </>
    );
}
