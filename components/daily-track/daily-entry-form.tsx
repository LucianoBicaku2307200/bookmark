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
import { SegmentedToggle } from "./segmented-toggle";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, Loader2 } from "lucide-react";

type Mode = "change" | "total";

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
}: {
    entries: Entry[];
    activities: Activity[];
}) {
    const saveDay = useDailyTrackStore((state) => state.saveDay);

    const [date, setDate] = useState(() => toDateKey(new Date()));
    const [mode, setMode] = useState<Mode>("change");
    const [month, setMonth] = useState(() => startOfMonth(new Date()));
    const [draft, setDraft] = useState<Draft>({});
    const [isLoading, setIsLoading] = useState(false);
    const [savedAt, setSavedAt] = useState(false);

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

    // Draft resets only when the date, the activity list or the mode changes.
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
                next[activity.id] =
                    mode === "total"
                        ? String(roundDelta(raw + (currentPrior[activity.id] ?? 0)))
                        : String(raw);
            } else {
                next[activity.id] = "";
            }
        }
        setDraft(next);
        setSavedAt(false);
    }, [activityKey, date, mode]);

    // Compared in stored terms so Total mode never falsely reads as dirty.
    const toStored = (activity: Activity): EntryValue | null | undefined => {
        const value = draft[activity.id];

        if (activity.type === "checkbox") {
            return value === true ? true : null;
        }

        const text = String(value ?? "").trim();
        if (text === "") return null;

        const parsed = Number(text);
        if (!Number.isFinite(parsed)) return undefined;

        return mode === "total"
            ? roundDelta(parsed - (priorTotals[activity.id] ?? 0))
            : parsed;
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
            setSavedAt(true);
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between gap-2">
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

                <SegmentedToggle<Mode>
                    value={mode}
                    onChange={setMode}
                    options={[
                        { value: "change", label: "Change" },
                        { value: "total", label: "Total" },
                    ]}
                />
            </div>

            <div className="space-y-3">
                {activities.map((activity) => {
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
                                    {mode === "total" && (
                                        <p className="text-xs text-muted-foreground">
                                            {delta === null
                                                ? `was ${prior}`
                                                : `${delta >= 0 ? "+" : ""}${delta} from ${prior}`}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" size="sm" disabled={!dirty || isLoading}>
                    {isLoading && <Loader2 className="size-4 animate-spin" />}
                    {isLoading ? "Saving…" : "Save day"}
                </Button>
                {savedAt && !dirty && (
                    <span className="text-xs text-muted-foreground">✓ Saved</span>
                )}
            </div>
        </form>
    );
}
