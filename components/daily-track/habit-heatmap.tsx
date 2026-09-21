"use client";

import { useMemo } from "react";
import { Activity, Entry } from "@/types";
import {
    HeatmapDay,
    fromDateKey,
    toHeatmapDays,
    toWeekColumns,
} from "@/lib/daily-track/chart-data";
import { cn } from "@/lib/utils";

// Painted from --primary, never from activity colors: this is one combined grid
// over all visible habits. In this theme that reads as a grayscale ramp.
const LEVELS = [
    "bg-muted",
    "bg-primary/25",
    "bg-primary/50",
    "bg-primary/75",
    "bg-primary",
];

const WEEKDAY_GUTTER = ["", "Mon", "", "Wed", "", "Fri", ""];

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function cellTitle(day: HeatmapDay): string {
    const date = fromDateKey(day.date);
    const label = date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    if (day.total === 0) return label;
    if (day.done.length === 0) return `${label} — 0/${day.total}: nothing logged`;
    return `${label} — ${day.done.length}/${day.total}: ${day.done.join(", ")}`;
}

export function HabitHeatmap({
    entries,
    activities,
    dayKeys,
}: {
    entries: Entry[];
    activities: Activity[];
    dayKeys: string[];
}) {
    const columns = useMemo(
        () => toWeekColumns(toHeatmapDays(entries, activities, dayKeys)),
        [entries, activities, dayKeys]
    );

    if (activities.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No habits selected.
            </div>
        );
    }

    let lastMonth = -1;

    return (
        <div className="space-y-2">
            <div className="overflow-x-auto">
                <div className="flex gap-1">
                    <div className="flex flex-col gap-1 pr-1 pt-[1.125rem]">
                        {WEEKDAY_GUTTER.map((label, index) => (
                            <div
                                key={index}
                                className="flex h-3.5 items-center text-[10px] text-muted-foreground"
                            >
                                {label}
                            </div>
                        ))}
                    </div>

                    {columns.map((column, columnIndex) => {
                        const firstDay = column.find((day) => day !== null);
                        const month = firstDay ? fromDateKey(firstDay.date).getMonth() : -1;
                        const showMonth = month !== -1 && month !== lastMonth;
                        if (showMonth) lastMonth = month;

                        return (
                            <div key={columnIndex} className="flex flex-col gap-1">
                                <div className="h-4 text-[10px] text-muted-foreground">
                                    {showMonth ? MONTHS[month] : ""}
                                </div>
                                {column.map((day, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        title={day ? cellTitle(day) : undefined}
                                        className={cn(
                                            "size-3.5 rounded-[3px] ring-1 ring-foreground/5",
                                            day ? LEVELS[day.level] : "bg-transparent ring-0"
                                        )}
                                    />
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                <span>Less</span>
                {LEVELS.map((level) => (
                    <div
                        key={level}
                        className={cn("size-3.5 rounded-[3px] ring-1 ring-foreground/5", level)}
                    />
                ))}
                <span>More</span>
            </div>
        </div>
    );
}
