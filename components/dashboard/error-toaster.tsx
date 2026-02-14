"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useBookmarksStore } from "@/store/bookmarks-store";
import { useCollectionsStore } from "@/store/collections-store";
import { useTagsStore } from "@/store/tags-store";

export function ErrorToaster() {
    const bookmarksError = useBookmarksStore((state) => state.error);
    const collectionsError = useCollectionsStore((state) => state.error);
    const tagsError = useTagsStore((state) => state.error);

    useEffect(() => {
        if (bookmarksError) {
            toast.error(bookmarksError);
        }
    }, [bookmarksError]);

    useEffect(() => {
        if (collectionsError) {
            toast.error(collectionsError);
        }
    }, [collectionsError]);

    useEffect(() => {
        if (tagsError) {
            toast.error(tagsError);
        }
    }, [tagsError]);

    return null;
}
