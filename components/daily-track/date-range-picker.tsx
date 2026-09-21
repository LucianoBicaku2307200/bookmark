"use client";

import { useState } from "react";
import { addMonths, startOfMonth, subMonths } from "date-fns";
import {
    DateRange,
    addDays,
    formatDateLabel,
    toDateKey,
} from "@/lib/daily-track/chart-data";
import { MonthGrid } from "./month-grid";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESETS = [
    { label: "7d", days: 7 },
    { label: "30d", days: 30 },
    { label: "90d", days: 90 },
];

export function DateRangePicker({
    range,
    onChange,
}: {
    range: DateRange;
    onChange: (range: DateRange) => void;
}) {
    const [month, setMonth] = useState(() => startOfMonth(new Date()));

    const label =
        range.from && range.to
            ? `${formatDateLabel(range.from)} – ${formatDateLabel(range.to)}`
            : "All time";

    const handleSelect = (key: string) => {
        if (!range.from || (range.from && range.to)) {
            onChange({ from: key });
            return;
        }
        onChange(key < range.from ? { from: key, to: range.from } : { from: range.from, to: key });
    };

    const applyPreset = (days: number) => {
        const today = new Date();
        onChange({ from: toDateKey(addDays(today, -(days - 1))), to: toDateKey(today) });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <CalendarDays className="size-4" />
                    <span className="hidden sm:inline">{label}</span>
                </Button>
            </DropdownMenuTrigger>
            {/* Plain children, never DropdownMenuItems: menu roving focus would
                hijack the arrow keys inside the calendar grid. */}
            <DropdownMenuContent align="end" className="w-auto p-3">
                <div className="mb-3 flex items-center gap-1">
                    {PRESETS.map((preset) => (
                        <Button
                            key={preset.label}
                            variant="ghost"
                            size="sm"
                            onClick={() => applyPreset(preset.days)}
                        >
                            {preset.label}
                        </Button>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onChange({})}
                        className={cn(!range.from && !range.to && "bg-muted text-foreground")}
                    >
                        All
                    </Button>
                </div>

                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setMonth(subMonths(month, 1))}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setMonth(addMonths(month, 1))}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>

                <div className="flex gap-4">
                    <MonthGrid
                        month={month}
                        rangeStart={range.from}
                        rangeEnd={range.to}
                        onSelect={handleSelect}
                    />
                    <div className="hidden sm:block">
                        <MonthGrid
                            month={addMonths(month, 1)}
                            rangeStart={range.from}
                            rangeEnd={range.to}
                            onSelect={handleSelect}
                        />
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
