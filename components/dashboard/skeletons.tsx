import { Skeleton } from "@/components/ui/skeleton";

export function BookmarkCardSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
    if (variant === "list") {
        return (
            <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
        );
    }

    return (
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-md h-[180px]">
            <div className="space-y-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="size-8 rounded-lg" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                    <Skeleton className="size-8 rounded-md" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
            </div>
        </div>
    );
}

export function SidebarItemSkeleton() {
    return (
        <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-4 w-24 rounded-sm" />
        </div>
    );
}
