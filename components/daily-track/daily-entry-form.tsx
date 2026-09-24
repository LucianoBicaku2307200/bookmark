"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { startOfMonth } from "date-fns";
import { toast } from "sonner";
import { Activity, Entry, EntryValue } from "@/types";
import {
    formatDateLabel,
    fromDateKey,
    toDateKey,
    totalsBefore,
} from "@/lib/daily-track/chart-data";
import { useDailyTrackStore } from "@/store/daily-track-store";
import { MonthGrid } from "./month-grid";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, Loader2, Search } from "lucide-react";

type Draft = Record<string, string | boolean>;

// Deltas are float subtractions: 86.6 - 86.8 is -0.20000000000000284.
function roundDelta(value: number): number {
    return Number(value.toFixed(6));
}

function storedValues(entries: Entry[], date: string): Record<string, EntryValue> {
    return entries.find((entry) => entry.date === date)?.values ?? {};
}

export function DailyEntryForm({
    entries,
    activities,
    initialDate,
    onSaved,
}: {
    entries: Entry[];
    activities: Activity[];
    initialDate?: string;
    onSaved?: () => void;
}) {
    const saveDay = useDailyTrackStore((state) => state.saveDay);

    const [date, setDate] = useState(() => initialDate ?? toDateKey(new Date()));
    const [month, setMonth] = useState(() => startOfMonth(fromDateKey(date)));
    const [draft, setDraft] = useState<Draft>({});
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Search narrows the fields on screen only; saving still covers every activity.
    const visible = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return activities;
        return activities.filter((activity) =>
            activity.name.toLowerCase().includes(term)
        );
    }, [activities, search]);

    const stored = useMemo(() => storedValues(entries, date), [entries, date]);
    const priorTotals = useMemo(() => totalsBefore(entries, date), [entries, date]);

    // Read through a ref so that saving, recoloring or deleting an activity --
    // each of which replaces the entries/activities arrays -- does not count as
    // a reason to reset the draft and discard whatever is typed.
    const entriesRef = useRef(entries);
    entriesRef.current = entries;

    const activityKey = activities.map((activity) => activity.id).join(",");
    const activitiesRef = useRef(activities);
    activitiesRef.current = activities;

    // Draft resets only when the date or the activity list changes.
    useEffect(() => {
        const current = entriesRef.current;
        const currentStored = storedValues(current, date);
        const currentPrior = totalsBefore(current, date);

        const next: Draft = {};
        for (const activity of activitiesRef.current) {
            const raw = currentStored[activity.id];
            if (activity.type === "checkbox") {
                next[activity.id] = raw === true;
            } else if (typeof raw === "number") {
                next[activity.id] = String(roundDelta(raw + (currentPrior[activity.id] ?? 0)));
            } else {
                next[activity.id] = "";
            }
        }
        setDraft(next);
    }, [activityKey, date]);

    // Typed values are running totals; entries store the day's delta.
    const toStored = (activity: Activity): EntryValue | null | undefined => {
        const value = draft[activity.id];

        if (activity.type === "checkbox") {
            return value === true ? true : null;
        }

        const text = String(value ?? "").trim();
        if (text === "") return null;

        const parsed = Number(text);
        if (!Number.isFinite(parsed)) return undefined;

        return roundDelta(parsed - (priorTotals[activity.id] ?? 0));
    };

    const dirty = activities.some((activity) => {
        const next = toStored(activity);
        if (next === undefined) return false;
        const current = stored[activity.id];
        if (next === null) return current !== undefined;
        return current !== next;
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const values: Record<string, EntryValue | null> = {};
            for (const activity of activities) {
                const next = toStored(activity);
                // Non-numeric text is skipped entirely: leave the stored value alone.
                if (next === undefined) continue;
                values[activity.id] = next;
            }
            await saveDay(date, values);
            onSaved?.();
        } catch {
            toast.error("Failed to save day");
        } finally {
            setIsLoading(false);
        }
    };

    if (activities.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Add an activity to start tracking.
            </p>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="gap-2">
                            <CalendarDays className="size-4" />
                            {formatDateLabel(date)}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-auto p-3">
                        <div className="mb-2 flex items-center justify-between">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
                                }
                            >
                                Prev
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
                                }
                            >
                                Next
                            </Button>
                        </div>
                        <MonthGrid
                            month={month}
                            selected={date}
                            onSelect={(key) => {
                                setDate(key);
                                setMonth(startOfMonth(fromDateKey(key)));
                            }}
                        />
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="relative min-w-[8rem] flex-1">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search activities"
                        className="h-8 pl-8"
                    />
                </div>
            </div>

            <div className="grid max-h-[55vh] grid-cols-1 gap-x-4 gap-y-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {visible.map((activity) => {
                    const prior = roundDelta(priorTotals[activity.id] ?? 0);
                    const raw = String(draft[activity.id] ?? "").trim();
                    const parsed = Number(raw);
                    const delta =
                        raw !== "" && Number.isFinite(parsed)
                            ? roundDelta(parsed - prior)
                            : null;

                    return (
                        <div key={activity.id} className="space-y-1.5">
                            <Label
                                htmlFor={activity.id}
                                className="flex items-center gap-2 text-sm"
                            >
                                <span
                                    className="size-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: activity.color }}
                                />
                                {activity.name}
                            </Label>

                            {activity.type === "checkbox" ? (
                                <Checkbox
                                    id={activity.id}
                                    checked={draft[activity.id] === true}
                                    onCheckedChange={(checked) =>
                                        setDraft((current) => ({
                                            ...current,
                                            [activity.id]: checked === true,
                                        }))
                                    }
                                />
                            ) : (
                                <>
                                    <Input
                                        id={activity.id}
                                        type="number"
                                        inputMode="numeric"
                                        value={String(draft[activity.id] ?? "")}
                                        onChange={(event) =>
                                            setDraft((current) => ({
                                                ...current,
                                                [activity.id]: event.target.value,
                                            }))
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {delta === null
                                            ? `was ${prior}`
                                            : `${delta >= 0 ? "+" : ""}${delta} from ${prior}`}
                                    </p>
                                </>
                            )}
                        </div>
                    );
                })}

                {visible.length === 0 && (
                    <p className="text-sm text-muted-foreground">No activities match.</p>
                )}
            </div>

            <Button type="submit" size="sm" className="self-start" disabled={!dirty || isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                {isLoading ? "Saving…" : "Save day"}
            </Button>
        </form>
    );
}
