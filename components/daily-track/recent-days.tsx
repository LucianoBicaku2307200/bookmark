"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Activity, Entry, EntryValue } from "@/types";
import {
    DateRange,
    eachDayInRange,
    formatDateLabel,
    resolveRange,
    toDateKey,
} from "@/lib/daily-track/chart-data";
import { useDailyTrackStore } from "@/store/daily-track-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";

const DEFAULT_DAYS = 7;

// Mirrors the header range: a preset reads as "Last 30 logged days", a custom
// span as its own dates. With no range picked it falls back to the last 7.
export function recentDaysTitle(range: DateRange): string {
    if (!range.from || !range.to) return `Last ${DEFAULT_DAYS} logged days`;

    const days = eachDayInRange(range.from, range.to).length;
    if (range.to === toDateKey(new Date())) return `Last ${days} logged days`;

    return `${formatDateLabel(range.from)} – ${formatDateLabel(range.to)}`;
}

function valueLabel(value: EntryValue): string | null {
    if (typeof value === "number") return `${value >= 0 ? "+" : ""}${value}`;
    return value ? "✓" : null;
}

function DayRow({ entry, activities }: { entry: Entry; activities: Activity[] }) {
    const openLogDay = useDailyTrackStore((state) => state.openLogDay);
    const saveDay = useDailyTrackStore((state) => state.saveDay);

    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await saveDay(
                entry.date,
                Object.fromEntries(Object.keys(entry.values).map((id) => [id, null]))
            );
        } catch {
            toast.error("Failed to delete log");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="rounded-md border">
            <div className="flex items-center gap-1 p-2">
                <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpen((current) => !current)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                    <ChevronDown
                        className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform",
                            open && "rotate-180"
                        )}
                    />
                    <span className="truncate text-sm font-medium">
                        {formatDateLabel(entry.date)}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                        {activities.length}
                    </span>
                </button>

                <Button variant="ghost" size="icon-sm" onClick={() => openLogDay(entry.date)}>
                    <Pencil className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    disabled={isDeleting}
                    onClick={handleDelete}
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>

            {open && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 border-t px-2 py-2">
                    {activities.map((activity) => {
                        const label = valueLabel(entry.values[activity.id]);
                        if (label === null) return null;
                        return (
                            <span
                                key={activity.id}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                            >
                                <span
                                    className="size-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: activity.color }}
                                />
                                <span className="truncate">{activity.name}</span>
                                <span className="text-foreground">{label}</span>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function RecentDays({
    entries,
    activities,
}: {
    entries: Entry[];
    activities: Activity[];
}) {
    const range = useDailyTrackStore((state) => state.range);

    const recent = useMemo(() => {
        const [from, to] = resolveRange(range, entries);
        const inRange = entries.filter(
            (entry) => entry.date >= from && entry.date <= to
        );
        const capped =
            range.from && range.to ? inRange : inRange.slice(-DEFAULT_DAYS);
        return capped.reverse();
    }, [entries, range]);

    if (recent.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No days logged in this range.
            </p>
        );
    }

    return (
        <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {recent.map((entry) => (
                <DayRow
                    key={entry.date}
                    entry={entry}
                    activities={activities.filter(
                        (activity) => entry.values[activity.id] !== undefined
                    )}
                />
            ))}
        </div>
    );
}
