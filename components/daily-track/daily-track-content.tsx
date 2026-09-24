"use client";

import { useMemo, useState } from "react";
import { Activity } from "@/types";
import { useDailyTrackStore } from "@/store/daily-track-store";
import { eachDayInRange, resolveRange } from "@/lib/daily-track/chart-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivitySelect } from "./activity-select";
import { RecentDays, recentDaysTitle } from "./recent-days";
import { HabitHeatmap } from "./habit-heatmap";
import { NumberChart } from "./number-chart";
import { SegmentedToggle } from "./segmented-toggle";

export function DailyTrackContent() {
    const { activities, entries, range, loading } = useDailyTrackStore();

    const [hidden, setHidden] = useState<Set<string>>(new Set());
    const [cumulative, setCumulative] = useState(false);

    const dayKeys = useMemo(
        () => eachDayInRange(...resolveRange(range, entries)),
        [range, entries]
    );

    const numberActivities = useMemo(
        () => activities.filter((a) => a.type === "number"),
        [activities]
    );
    const checkboxActivities = useMemo(
        () => activities.filter((a) => a.type === "checkbox"),
        [activities]
    );

    const visibleNumbers = useMemo(
        () => numberActivities.filter((a) => !hidden.has(a.id)),
        [numberActivities, hidden]
    );
    const visibleHabits = useMemo(
        () => checkboxActivities.filter((a) => !hidden.has(a.id)),
        [checkboxActivities, hidden]
    );

    const toggle = (id: string, visible: boolean) =>
        setHidden((current) => {
            const next = new Set(current);
            if (visible) next.delete(id);
            else next.add(id);
            return next;
        });

    // Scoped to the group's own ids: both dropdowns share one hidden Set.
    const toggleAll = (group: Activity[], visible: boolean) =>
        setHidden((current) => {
            const next = new Set(current);
            for (const activity of group) {
                if (visible) next.delete(activity.id);
                else next.add(activity.id);
            }
            return next;
        });

    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto w-full px-4 pb-4">
                <div className="mx-auto max-w-7xl pt-3 grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-[420px] rounded-xl border bg-muted animate-pulse" />
                        <div className="h-48 rounded-xl border bg-muted animate-pulse" />
                    </div>
                    <div className="h-72 rounded-xl border bg-muted animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto w-full px-4 pb-4">
            <div className="mx-auto max-w-7xl pt-3 grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between gap-2">
                            <CardTitle>Values over time</CardTitle>
                            <div className="flex items-center gap-2">
                                <SegmentedToggle<boolean>
                                    value={cumulative}
                                    onChange={setCumulative}
                                    options={[
                                        { value: false, label: "Daily" },
                                        { value: true, label: "Total" },
                                    ]}
                                />
                                <ActivitySelect
                                    activities={numberActivities}
                                    hidden={hidden}
                                    onToggle={toggle}
                                    onToggleAll={(visible) =>
                                        toggleAll(numberActivities, visible)
                                    }
                                    noun="values"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="h-[420px]">
                            <NumberChart
                                entries={entries}
                                activities={visibleNumbers}
                                dayKeys={dayKeys}
                                cumulative={cumulative}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex-row items-center justify-between gap-2">
                            <CardTitle>Habits</CardTitle>
                            <ActivitySelect
                                activities={checkboxActivities}
                                hidden={hidden}
                                onToggle={toggle}
                                onToggleAll={(visible) =>
                                    toggleAll(checkboxActivities, visible)
                                }
                                noun="habits"
                            />
                        </CardHeader>
                        <CardContent>
                            <HabitHeatmap
                                entries={entries}
                                activities={visibleHabits}
                                dayKeys={dayKeys}
                            />
                        </CardContent>
                    </Card>
                </div>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>{recentDaysTitle(range)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentDays entries={entries} activities={activities} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
