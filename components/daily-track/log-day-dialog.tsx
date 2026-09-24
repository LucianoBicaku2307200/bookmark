"use client";

import { useDailyTrackStore } from "@/store/daily-track-store";
import { DailyEntryForm } from "./daily-entry-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function LogDayDialog() {
    const { activities, entries, logDate, closeLogDay } = useDailyTrackStore();

    return (
        <Dialog open={logDate !== null} onOpenChange={(open) => !open && closeLogDay()}>
            <DialogContent className="max-h-[90vh] sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Log a day</DialogTitle>
                    <DialogDescription>
                        Numbers are running totals. Checkboxes mark the habit done.
                    </DialogDescription>
                </DialogHeader>

                {/* Remounts per opened day: the form owns its date state. */}
                {logDate !== null && (
                    <DailyEntryForm
                        key={logDate}
                        entries={entries}
                        activities={activities}
                        initialDate={logDate}
                        onSaved={closeLogDay}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
