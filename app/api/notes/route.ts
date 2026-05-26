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

    const { data: notes, error } = await supabase
      .from("notes")
      .select(
        `
        *,
        note_tags(tag:tags(id, name, color))
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const transformedNotes = notes?.map((note: any) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.note_tags?.map((nt: any) => nt.tag.id) || [],
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    }));

    return NextResponse.json({ notes: transformedNotes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    const { title, content, tags } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { data: note, error: noteError } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        title,
        content: content || "",
      })
      .select()
      .single();

    if (noteError) {
      return NextResponse.json({ error: noteError.message }, { status: 400 });
    }

    if (tags && tags.length > 0) {
      const noteTags = tags.map((tagId: string) => ({
        note_id: note.id,
        tag_id: tagId,
      }));

      const { error: tagsError } = await supabase.from("note_tags").insert(noteTags);

      if (tagsError) {
        console.error("Error inserting note tags:", tagsError);
      }
    }

    return NextResponse.json(
      {
        note: {
          id: note.id,
          title: note.title,
          content: note.content,
          tags: tags || [],
          createdAt: note.created_at,
          updatedAt: note.updated_at,
        },
        message: "Note created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
