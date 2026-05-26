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

    const updates: any = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.content !== undefined) updates.content = body.content;
    updates.updated_at = new Date().toISOString();

    const { data: note, error: updateError } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (body.tags !== undefined) {
      await supabase.from("note_tags").delete().eq("note_id", id);

      if (body.tags.length > 0) {
        const noteTags = body.tags.map((tagId: string) => ({
          note_id: id,
          tag_id: tagId,
        }));
        await supabase.from("note_tags").insert(noteTags);
      }
    }

    return NextResponse.json(
      {
        note: {
          id: note.id,
          title: note.title,
          content: note.content,
          tags: body.tags !== undefined ? body.tags : [],
          createdAt: note.created_at,
          updatedAt: note.updated_at,
        },
        message: "Note updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Note deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
