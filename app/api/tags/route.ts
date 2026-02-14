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

    // Get tags with usage counts
    const { data: tags, error } = await supabase
      .from("tags")
      .select(
        `
        *,
        bookmark_tags(count)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Transform data to match frontend structure
    const transformedTags = tags?.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      count: tag.bookmark_tags?.[0]?.count || 0,
    }));

    return NextResponse.json({ tags: transformedTags }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tags:", error);
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
    const { name, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    const { data: tag, error } = await supabase
      .from("tags")
      .insert({
        user_id: user.id,
        name,
        color: color || "bg-gray-500/10 text-gray-500",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        tag: {
          id: tag.id,
          name: tag.name,
          color: tag.color,
          count: 0,
        },
        message: "Tag created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
