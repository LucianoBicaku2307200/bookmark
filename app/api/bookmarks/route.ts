import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("collectionId");
    const tags = searchParams.get("tags")?.split(",").filter(Boolean);
    const search = searchParams.get("search");
    const favorites = searchParams.get("favorites") === "true";
    const archived = searchParams.get("archived") === "true";
    const trashed = searchParams.get("trashed") === "true";

    let query = supabase
      .from("bookmarks")
      .select(
        `
        *,
        collection:collections(id, name, icon, color),
        bookmark_tags(tag:tags(id, name, color))
      `
      )
      .eq("user_id", user.id);

    // Filter by collection
    if (collectionId && collectionId !== "all") {
      query = query.eq("collection_id", collectionId);
    }

    // Filter by archived/trashed status
    if (archived) {
      query = query.not("archived_at", "is", null);
    } else if (trashed) {
      query = query.not("trashed_at", "is", null);
    } else {
      query = query.is("archived_at", null).is("trashed_at", null);
    }

    // Filter by favorites
    if (favorites) {
      query = query.eq("is_favorite", true);
    }

    // Search
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,url.ilike.%${search}%`
      );
    }

    const { data: bookmarks, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Transform data to match frontend structure
    const transformedBookmarks = bookmarks?.map((bookmark: any) => ({
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      favicon: bookmark.favicon,
      thumbnail: bookmark.thumbnail,
      duration: bookmark.duration,
      collectionId: bookmark.collection_id,
      tags: bookmark.bookmark_tags?.map((bt: any) => bt.tag.id) || [],
      createdAt: bookmark.created_at,
      isFavorite: bookmark.is_favorite,
      hasDarkIcon: bookmark.has_dark_icon,
      archivedAt: bookmark.archived_at,
      trashedAt: bookmark.trashed_at,
    }));

    // Filter by tags if specified (client-side filtering for now)
    let filteredBookmarks = transformedBookmarks;
    if (tags && tags.length > 0) {
      filteredBookmarks = transformedBookmarks?.filter((bookmark: any) =>
        tags.some((tag) => bookmark.tags.includes(tag))
      );
    }

    return NextResponse.json({ bookmarks: filteredBookmarks }, { status: 200 });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      url,
      description,
      favicon,
      thumbnail,
      duration,
      collectionId,
      tags,
      isFavorite,
      hasDarkIcon,
    } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 }
      );
    }

    // Insert bookmark
    const { data: bookmark, error: bookmarkError } = await supabase
      .from("bookmarks")
      .insert({
        user_id: user.id,
        title,
        url,
        description: description || "",
        favicon: favicon || "",
        thumbnail: thumbnail || null,
        duration: duration || null,
        collection_id: collectionId || null,
        is_favorite: isFavorite || false,
        has_dark_icon: hasDarkIcon || false,
      })
      .select()
      .single();

    if (bookmarkError) {
      return NextResponse.json(
        { error: bookmarkError.message },
        { status: 400 }
      );
    }

    // Insert bookmark tags if provided
    if (tags && tags.length > 0) {
      const bookmarkTags = tags.map((tagId: string) => ({
        bookmark_id: bookmark.id,
        tag_id: tagId,
      }));

      const { error: tagsError } = await supabase
        .from("bookmark_tags")
        .insert(bookmarkTags);

      if (tagsError) {
        console.error("Error inserting bookmark tags:", tagsError);
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
          tags: tags || [],
          createdAt: bookmark.created_at,
          isFavorite: bookmark.is_favorite,
          hasDarkIcon: bookmark.has_dark_icon,
        },
        message: "Bookmark created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
