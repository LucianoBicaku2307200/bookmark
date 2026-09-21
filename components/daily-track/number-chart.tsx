"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Activity, Entry } from "@/types";
import {
    formatDateLabel,
    toChartRows,
    toCumulativeRows,
} from "@/lib/daily-track/chart-data";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

export function NumberChart({
    entries,
    activities,
    dayKeys,
    cumulative,
}: {
    entries: Entry[];
    activities: Activity[];
    dayKeys: string[];
    cumulative: boolean;
}) {
    const rows = useMemo(() => {
        const dense = toChartRows(entries, activities, dayKeys);
        return cumulative ? toCumulativeRows(dense, activities) : dense;
    }, [entries, activities, dayKeys, cumulative]);

    const config = useMemo<ChartConfig>(
        () =>
            Object.fromEntries(
                activities.map((activity) => [
                    activity.id,
                    { label: activity.name, color: activity.color },
                ])
            ),
        [activities]
    );

    // Unstacked: these are unrelated metrics, so a sum would lie. Sorted by peak
    // descending so the biggest draws first and smaller series stay visible.
    const ordered = useMemo(() => {
        const peak = (id: string) =>
            rows.reduce((max, row) => {
                const value = row[id];
                return typeof value === "number" && value > max ? value : max;
            }, 0);
        return [...activities].sort((a, b) => peak(b.id) - peak(a.id));
    }, [activities, rows]);

    if (activities.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No number activities selected.
            </div>
        );
    }

    return (
        <ChartContainer config={config} className="h-full w-full aspect-auto">
            <AreaChart data={rows} margin={{ left: 4, right: 8, top: 8 }}>
                <defs>
                    {ordered.map((activity) => (
                        <linearGradient
                            key={activity.id}
                            id={`fill-${activity.id}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="5%"
                                stopColor={`var(--color-${activity.id})`}
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor={`var(--color-${activity.id})`}
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={formatDateLabel}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            indicator="dot"
                            labelFormatter={(value) => formatDateLabel(String(value))}
                        />
                    }
                />
                <ChartLegend content={<ChartLegendContent />} />
                {ordered.map((activity) => (
                    <Area
                        key={activity.id}
                        dataKey={activity.id}
                        type="natural"
                        fill={`url(#fill-${activity.id})`}
                        stroke={`var(--color-${activity.id})`}
                        // A running total carries across unlogged days; a daily value must not.
                        connectNulls={cumulative}
                        isAnimationActive={false}
                    />
                ))}
            </AreaChart>
        </ChartContainer>
    );
}
