"use client";

import { cn } from "@/lib/utils";

type Option<T> = { value: T; label: string };

export function SegmentedToggle<T extends string | boolean>({
    value,
    onChange,
    options,
    className,
}: {
    value: T;
    onChange: (value: T) => void;
    options: Option<T>[];
    className?: string;
}) {
    return (
        <div className={cn("inline-flex items-center rounded-md border p-0.5", className)}>
            {options.map((option) => (
                <button
                    key={String(option.value)}
                    type="button"
                    aria-pressed={option.value === value}
                    onClick={() => onChange(option.value)}
                    className={cn(
                        "rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
                        option.value === value
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
