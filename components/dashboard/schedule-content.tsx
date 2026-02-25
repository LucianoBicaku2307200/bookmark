"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useBookmarksStore } from "@/store/bookmarks-store";
import { BookmarkCard } from "./bookmark-card";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    ExternalLink,
    Plus,
    LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, isSameDay, parseISO, differenceInMinutes, startOfDay } from "date-fns";

export function ScheduleContent() {
    const { getScheduledBookmarks } = useBookmarksStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewType, setViewType] = useState<"calendar" | "grid">("calendar");
    const [mounted, setMounted] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scheduledBookmarks = getScheduledBookmarks();

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobileView(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        // Auto-scroll to current time line on mount
        setTimeout(() => {
            if (scrollContainerRef.current) {
                const now = new Date();
                const top = (now.getHours() * 60 + now.getMinutes()) * (80 / 60);
                const containerHeight = scrollContainerRef.current.clientHeight;
                const offset = Math.max(0, top - (containerHeight * 0.1));
                scrollContainerRef.current.scrollTop = offset;
            }
        }, 100);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const weekDays = useMemo(() => {
        if (mounted && isMobileView) return [currentDate];
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, [currentDate, mounted, isMobileView]);

    const hours = Array.from({ length: 24 }, (_, i) => i);

    const formatMonth = (date: Date) => format(date, "MMMM yyyy");

    const getDayBookmarks = (day: Date) => {
        return scheduledBookmarks.filter(b => {
            if (!b.startAt) return false;
            return isSameDay(parseISO(b.startAt), day);
        });
    };

    const nextDay = () => setCurrentDate(addDays(currentDate, 1));
    const prevDay = () => setCurrentDate(addDays(currentDate, -1));
    const goToToday = () => setCurrentDate(new Date());

    const getEventStyle = (bookmark: any) => {
        if (!bookmark.startAt) return {};
        const start = parseISO(bookmark.startAt);
        const end = bookmark.endAt ? parseISO(bookmark.endAt) : addDays(start, 0.5 / 24);

        const startHour = start.getHours();
        const startMinute = start.getMinutes();
        const durationMinutes = Math.max(differenceInMinutes(end, start), 30);

        const top = (startHour * 60 + startMinute) * (80 / 60);
        const height = durationMinutes * (80 / 60);

        return {
            top: `${top}px`,
            height: `${height}px`,
        };
    };

    return (
        <div className="flex-1 w-full flex flex-col overflow-hidden bg-background">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold min-w-[150px]">
                        {formatMonth(currentDate)}
                    </h2>
                    <div className="flex items-center border rounded-md p-0.5">
                        <Button variant="ghost" size="icon-xs" onClick={prevDay}>
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="px-3" onClick={goToToday}>
                            Today
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={nextDay}>
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md p-0.5 mr-2">
                        <Button
                            variant={viewType === "calendar" ? "secondary" : "ghost"}
                            size="icon-xs"
                            onClick={() => setViewType("calendar")}
                            className="rounded-sm"
                        >
                            <CalendarIcon className="size-4" />
                        </Button>
                        <Button
                            variant={viewType === "grid" ? "secondary" : "ghost"}
                            size="icon-xs"
                            onClick={() => setViewType("grid")}
                            className="rounded-sm"
                        >
                            <LayoutGrid className="size-4" />
                        </Button>
                    </div>
                    <div className="text-sm text-muted-foreground hidden sm:block">
                        {scheduledBookmarks.length} scheduled items
                    </div>
                </div>
            </div>

            {viewType === "grid" ? (
                <div className="flex-1 overflow-auto p-4 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {scheduledBookmarks.map((bookmark) => (
                            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                        ))}
                    </div>
                    {scheduledBookmarks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <CalendarIcon className="size-12 mb-4 opacity-20" />
                            <p>No scheduled bookmarks found.</p>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Calendar Grid Header (Days) */}
                    <div className="flex border-b bg-muted/20">
                        <div className="w-16 border-r shrink-0" />
                        {weekDays.map((day, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex-1 py-3 text-center border-r last:border-r-0",
                                    isSameDay(day, new Date()) && "bg-primary/5"
                                )}
                            >
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                    {format(day, "EEE")}
                                </div>
                                <div className={cn(
                                    "size-8 mx-auto flex items-center justify-center rounded-full text-lg",
                                    isSameDay(day, new Date()) ? "bg-primary text-primary-foreground font-bold" : "text-foreground"
                                )}>
                                    {format(day, "d")}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Scrollable Grid Area */}
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto relative custom-scrollbar no-scrollbar"
                    >
                        <div className="flex min-h-[1920px]">
                            {/* Time Gutter */}
                            <div className="w-16 flex flex-col border-r bg-muted/5 shrink-0">
                                {hours.map(hour => (
                                    <div key={hour} className="h-20 border-b flex justify-center text-[10px] text-muted-foreground pt-1 pr-2 font-medium">
                                        {hour === 0 ? "" : format(startOfDay(currentDate).setHours(hour), "ha")}
                                    </div>
                                ))}
                            </div>

                            {/* Day Columns */}
                            <div className="flex-1 flex relative">
                                {weekDays.map((day, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex-1 border-r last:border-r-0 relative",
                                            isSameDay(day, new Date()) && "bg-primary/[0.02]"
                                        )}
                                    >
                                        {hours.map(hour => (
                                            <div key={hour} className="h-20 border-b last:border-b-0" />
                                        ))}

                                        <div className="absolute inset-0">
                                            {getDayBookmarks(day).map((bookmark) => (
                                                <div
                                                    key={bookmark.id}
                                                    className="absolute inset-x-1 z-10 p-1 group"
                                                    style={getEventStyle(bookmark)}
                                                >
                                                    <div className={cn(
                                                        "h-full w-full rounded-md border p-1.5 shadow-xs transition-all overflow-hidden flex flex-col",
                                                        "bg-card hover:bg-accent/50 hover:shadow-md cursor-pointer",
                                                        bookmark.collectionId === "youtube" ? "border-red-200 dark:border-red-900/50" : "border-border"
                                                    )}
                                                        onClick={() => window.open(bookmark.url, "_blank")}
                                                    >
                                                        <div className="flex items-start gap-1.5 min-w-0">
                                                            {bookmark.collectionId === "youtube" ? (
                                                                <div className="size-4 shrink-0 mt-0.5 rounded-sm bg-red-100 flex items-center justify-center">
                                                                    <span className="text-[10px] text-red-600 font-bold">Y</span>
                                                                </div>
                                                            ) : (
                                                                bookmark.favicon && (
                                                                    <img src={bookmark.favicon} className="size-4 shrink-0 mt-0.5 rounded-sm" alt="" />
                                                                )
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="text-[11px] font-semibold leading-tight line-clamp-2">
                                                                    {bookmark.title}
                                                                </h4>
                                                                <div className="flex items-center gap-1 mt-1 text-[9px] text-muted-foreground font-medium">
                                                                    <Clock className="size-2.5" />
                                                                    {format(parseISO(bookmark.startAt!), "h:mm a")}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded border flex items-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-xs"
                                                                className="size-6"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(bookmark.url, "_blank");
                                                                }}
                                                            >
                                                                <ExternalLink className="size-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <TimeIndicator />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function TimeIndicator() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const top = (now.getHours() * 60 + now.getMinutes()) * (80 / 60);

    return (
        <div
            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
            style={{ top: `${top}px` }}
        >
            <div className="size-2 rounded-full bg-red-500 -ml-1" />
            <div className="h-0.5 flex-1 bg-red-500" />
        </div>
    );
}
