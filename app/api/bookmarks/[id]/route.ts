import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Build update object based on provided fields
    const updates: any = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.url !== undefined) updates.url = body.url;
    if (body.description !== undefined) updates.description = body.description;
    if (body.favicon !== undefined) updates.favicon = body.favicon;
    if (body.thumbnail !== undefined) updates.thumbnail = body.thumbnail;
    if (body.duration !== undefined) updates.duration = body.duration;
    if (body.collectionId !== undefined)
      updates.collection_id = body.collectionId;
    if (body.isFavorite !== undefined) updates.is_favorite = body.isFavorite;
    if (body.hasDarkIcon !== undefined)
      updates.has_dark_icon = body.hasDarkIcon;
    if (body.archivedAt !== undefined) updates.archived_at = body.archivedAt;
    if (body.trashedAt !== undefined) updates.trashed_at = body.trashedAt;

    // Update bookmark
    const { data: bookmark, error: updateError } = await supabase
      .from("bookmarks")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    // Update tags if provided
    if (body.tags !== undefined) {
      // Delete existing tags
      await supabase.from("bookmark_tags").delete().eq("bookmark_id", id);

      // Insert new tags
      if (body.tags.length > 0) {
        const bookmarkTags = body.tags.map((tagId: string) => ({
          bookmark_id: id,
          tag_id: tagId,
        }));

        await supabase.from("bookmark_tags").insert(bookmarkTags);
      }
    }

    return NextResponse.json(
      {
        bookmark: {
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description,
          favicon: bookmark.favicon,
          thumbnail: bookmark.thumbnail,
          duration: bookmark.duration,
          collectionId: bookmark.collection_id,
          tags: body.tags || [],
          createdAt: bookmark.created_at,
          isFavorite: bookmark.is_favorite,
          hasDarkIcon: bookmark.has_dark_icon,
          archivedAt: bookmark.archived_at,
          trashedAt: bookmark.trashed_at,
        },
        message: "Bookmark updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating bookmark:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Bookmark deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
