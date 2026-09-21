"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Activity, ActivityType } from "@/types";
import { useDailyTrackStore } from "@/store/daily-track-store";
import { ColorPicker } from "./color-picker";
import { SegmentedToggle } from "./segmented-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";

function ActivityRow({ activity }: { activity: Activity }) {
    const renameActivity = useDailyTrackStore((state) => state.renameActivity);
    const setActivityColor = useDailyTrackStore((state) => state.setActivityColor);
    const deleteActivity = useDailyTrackStore((state) => state.deleteActivity);

    const [name, setName] = useState(activity.name);

    // Renaming commits on blur, and reverts if blanked or unchanged.
    const handleBlur = async () => {
        const trimmed = name.trim();
        if (!trimmed || trimmed === activity.name) {
            setName(activity.name);
            return;
        }
        try {
            await renameActivity(activity.id, trimmed);
        } catch {
            setName(activity.name);
            toast.error("Failed to rename activity");
        }
    };

    return (
        <div className="flex items-center gap-2">
            <ColorPicker
                color={activity.color}
                onChange={(color) =>
                    setActivityColor(activity.id, color).catch(() =>
                        toast.error("Failed to update color")
                    )
                }
            />
            <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={handleBlur}
                className="h-8"
            />
            <span className="w-16 shrink-0 text-xs text-muted-foreground">
                {activity.type === "number" ? "Number" : "Checkbox"}
            </span>
            <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={() =>
                    deleteActivity(activity.id).catch(() =>
                        toast.error("Failed to delete activity")
                    )
                }
            >
                <Trash2 className="size-4" />
            </Button>
        </div>
    );
}

export function ActivityManager({
    open,
    onOpenChange,
    activities,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activities: Activity[];
}) {
    const createActivity = useDailyTrackStore((state) => state.createActivity);

    const [name, setName] = useState("");
    const [type, setType] = useState<ActivityType>("number");
    const [color, setColor] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            toast.error("Name is required");
            return;
        }
        setIsLoading(true);
        try {
            await createActivity(trimmed, type, color || undefined);
            setName("");
            setColor("");
        } catch {
            toast.error("Failed to add activity");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Activities</DialogTitle>
                    <DialogDescription>
                        Numbers get a line on the chart. Checkboxes feed the habit grid.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    {activities.map((activity) => (
                        <ActivityRow key={activity.id} activity={activity} />
                    ))}
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                    <ColorPicker color={color || "#3b82f6"} onChange={setColor} />
                    <Input
                        placeholder="New activity"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                handleAdd();
                            }
                        }}
                        className="h-8"
                    />
                    <SegmentedToggle<ActivityType>
                        value={type}
                        onChange={setType}
                        options={[
                            { value: "number", label: "Number" },
                            { value: "checkbox", label: "Checkbox" },
                        ]}
                    />
                    <Button size="sm" onClick={handleAdd} disabled={isLoading}>
                        {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Add"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
