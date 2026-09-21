"use client";

import { Activity } from "@/types";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export function ActivitySelect({
    activities,
    hidden,
    onToggle,
    noun,
}: {
    activities: Activity[];
    hidden: Set<string>;
    onToggle: (id: string, visible: boolean) => void;
    noun: string;
}) {
    if (activities.length === 0) return null;

    const visible = activities.filter((a) => !hidden.has(a.id));

    const label =
        visible.length === 0
            ? `No ${noun}`
            : visible.length === 1
              ? visible[0].name
              : visible.length === activities.length
                ? `All ${noun}`
                : `${visible.length} of ${activities.length} ${noun}`;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-[200px] justify-between">
                    <span className="truncate">{label}</span>
                    <ChevronDown className="size-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                {activities.map((activity) => (
                    <DropdownMenuCheckboxItem
                        key={activity.id}
                        checked={!hidden.has(activity.id)}
                        // Without preventDefault the menu closes on every click.
                        onSelect={(event) => event.preventDefault()}
                        onCheckedChange={(checked) => onToggle(activity.id, checked)}
                    >
                        <span className="flex items-center gap-2">
                            <span
                                className="size-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: activity.color }}
                            />
                            <span className="truncate">{activity.name}</span>
                        </span>
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
