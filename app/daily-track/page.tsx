import { BookmarksSidebar } from "@/components/dashboard/sidebar";
import { DailyTrackHeader } from "@/components/daily-track/daily-track-header";
import { DailyTrackContent } from "@/components/daily-track/daily-track-content";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DailyTrackPage() {
    return (
        <SidebarProvider className="bg-sidebar">
            <BookmarksSidebar />
            <div className="lg:p-2 w-full">
                <div className="lg:border lg:rounded-md flex flex-col items-center justify-start bg-container h-full w-full bg-background">
                    <DailyTrackHeader />
                    <DailyTrackContent />
                </div>
            </div>
        </SidebarProvider>
    );
}
