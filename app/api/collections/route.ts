import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get collections with bookmark counts
    const { data: collections, error } = await supabase
      .from("collections")
      .select(
        `
        *,
        bookmarks:bookmarks(count)
      `
      )
      .eq("user_id", user.id)
      .is("bookmarks.archived_at", null)
      .is("bookmarks.trashed_at", null)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get total count for "All Bookmarks"
    const { count: totalCount } = await supabase
      .from("bookmarks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("archived_at", null)
      .is("trashed_at", null);

    // Transform data to match frontend structure
    const transformedCollections = [
      {
        id: "all",
        name: "All Bookmarks",
        icon: "bookmark",
        color: "neutral",
        count: totalCount || 0,
      },
      ...(collections?.map((collection: any) => ({
        id: collection.id,
        name: collection.name,
        icon: collection.icon,
        color: collection.color,
        count: collection.bookmarks?.[0]?.count || 0,
      })) || []),
    ];

    return NextResponse.json(
      { collections: transformedCollections },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching collections:", error);
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
    const { name, icon, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Collection name is required" },
        { status: 400 }
      );
    }

    const { data: collection, error } = await supabase
      .from("collections")
      .insert({
        user_id: user.id,
        name,
        icon: icon || "bookmark",
        color: color || "neutral",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        collection: {
          id: collection.id,
          name: collection.name,
          icon: collection.icon,
          color: collection.color,
          count: 0,
        },
        message: "Collection created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
