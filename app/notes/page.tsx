import { BookmarksSidebar } from "@/components/dashboard/sidebar";
import { NotesHeader } from "@/components/notes/notes-header";
import { NotesContent } from "@/components/notes/notes-content";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function NotesPage() {
  return (
    <SidebarProvider className="bg-sidebar">
      <BookmarksSidebar />
      <div className="h-svh overflow-hidden lg:p-2 w-full">
        <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background">
          <NotesHeader />
          <NotesContent />
        </div>
      </div>
    </SidebarProvider>
  );
}
