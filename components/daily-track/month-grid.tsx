"use client";

import { addDays, startOfMonth, startOfWeek } from "date-fns";
import { toDateKey } from "@/lib/daily-track/chart-data";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const MONTH_LABEL = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export function MonthGrid({
    month,
    selected,
    rangeStart,
    rangeEnd,
    onSelect,
}: {
    month: Date;
    selected?: string;
    rangeStart?: string;
    rangeEnd?: string;
    onSelect: (key: string) => void;
}) {
    const first = startOfMonth(month);
    const gridStart = startOfWeek(first);
    const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
    const todayKey = toDateKey(new Date());

    return (
        <div className="w-[15rem]">
            <div className="mb-2 text-center text-sm font-medium">
                {MONTH_LABEL[first.getMonth()]} {first.getFullYear()}
            </div>
            <div className="grid grid-cols-7">
                {WEEKDAYS.map((day, index) => (
                    <div
                        key={index}
                        className="pb-1 text-center text-[11px] text-muted-foreground"
                    >
                        {day}
                    </div>
                ))}
                {days.map((day) => {
                    const key = toDateKey(day);
                    const outside = day.getMonth() !== first.getMonth();
                    const isSelected = key === selected;
                    const inRange =
                        rangeStart && rangeEnd && key >= rangeStart && key <= rangeEnd;
                    const isEdge = key === rangeStart || key === rangeEnd;

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onSelect(key)}
                            className={cn(
                                "h-8 text-xs transition-colors hover:bg-accent",
                                outside && "text-muted-foreground/40",
                                inRange && !isEdge && "bg-accent",
                                (isSelected || isEdge) &&
                                    "bg-primary text-primary-foreground hover:bg-primary",
                                key === todayKey &&
                                    !isSelected &&
                                    !isEdge &&
                                    "font-semibold underline underline-offset-2",
                                key === rangeStart && "rounded-l-md",
                                key === rangeEnd && "rounded-r-md",
                                !inRange && !isSelected && "rounded-md"
                            )}
                        >
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
