"use client";

import { useEffect, useState } from "react";
import { ACTIVITY_COLORS } from "@/lib/daily-track/colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function ColorPicker({
    color,
    onChange,
}: {
    color: string;
    onChange: (color: string) => void;
}) {
    const [draft, setDraft] = useState(color);

    useEffect(() => {
        setDraft(color);
    }, [color]);

    const isValid = HEX_PATTERN.test(draft);

    const commit = (next: string) => {
        onChange(next);
        setDraft(next);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Change color"
                    className="size-3.5 shrink-0 rounded-full ring-1 ring-foreground/10"
                    style={{ backgroundColor: color }}
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-3">
                <div className="flex items-center justify-between">
                    {ACTIVITY_COLORS.map((swatch) => (
                        <button
                            key={swatch}
                            type="button"
                            aria-label={swatch}
                            onClick={() => commit(swatch)}
                            className="flex size-7 items-center justify-center rounded-full ring-1 ring-foreground/10"
                            style={{ backgroundColor: swatch }}
                        >
                            {swatch.toLowerCase() === color.toLowerCase() && (
                                <Check className="size-3.5 text-white" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <input
                        type="color"
                        value={HEX_PATTERN.test(color) ? color : "#000000"}
                        onChange={(event) => commit(event.target.value)}
                        className="h-8 w-9 cursor-pointer rounded border bg-transparent"
                    />
                    {/* Draft-only: committing per keystroke means a write per character. */}
                    <Input
                        value={draft}
                        aria-invalid={!isValid}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && isValid) {
                                event.preventDefault();
                                commit(draft);
                            }
                        }}
                        className="h-8 font-mono text-xs"
                    />
                </div>

                <Button
                    size="sm"
                    variant="outline"
                    disabled={!isValid}
                    onClick={() => commit(draft)}
                    className="mt-2 w-full"
                >
                    Use {draft}
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
