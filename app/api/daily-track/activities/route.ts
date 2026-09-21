import { createClient } from "@/lib/supabase/server";
import { ACTIVITY_COLORS } from "@/lib/daily-track/colors";
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

    const { data: activities, error } = await supabase
      .from("activities")
      .select("id, name, type, color")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ activities }, { status: 200 });
  } catch (error) {
    console.error("Error fetching activities:", error);
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
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const { type, color } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (type !== "number" && type !== "checkbox") {
      return NextResponse.json({ error: "Invalid activity type" }, { status: 400 });
    }

    let resolvedColor = color;

    if (!resolvedColor) {
      const { data: existing } = await supabase
        .from("activities")
        .select("color")
        .eq("user_id", user.id);

      const used = new Set((existing ?? []).map((row) => row.color));
      resolvedColor =
        ACTIVITY_COLORS.find((candidate) => !used.has(candidate)) ??
        ACTIVITY_COLORS[(existing?.length ?? 0) % ACTIVITY_COLORS.length];
    }

    const { data: activity, error } = await supabase
      .from("activities")
      .insert({ user_id: user.id, name, type, color: resolvedColor })
      .select("id, name, type, color")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { activity, message: "Activity created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
