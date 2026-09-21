import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Entry, EntryValue } from "@/types";

type EntryRow = {
  activity_id: string;
  date: string;
  num_value: number | null;
  bool_value: boolean | null;
};

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Deliberately unfiltered by date range: totalsBefore needs all history
    // before the edited day, and entryBounds needs the true first/last logged
    // day. Range filtering happens in memory in toChartRows/toHeatmapDays.
    const { data: rows, error } = await supabase
      .from("entries")
      .select("activity_id, date, num_value, bool_value")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const byDate = (rows as EntryRow[]).reduce((acc, row) => {
      const values = acc.get(row.date) ?? {};
      values[row.activity_id] =
        row.num_value !== null ? Number(row.num_value) : Boolean(row.bool_value);
      acc.set(row.date, values);
      return acc;
    }, new Map<string, Record<string, EntryValue>>());

    const entries: Entry[] = Array.from(byDate, ([date, values]) => ({ date, values }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ entries }, { status: 200 });
  } catch (error) {
    console.error("Error fetching entries:", error);
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
    const { date } = body;
    const values: Record<string, EntryValue | null> = body.values ?? {};

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const clearedIds: string[] = [];
    const upserts = [];

    for (const [activityId, value] of Object.entries(values)) {
      if (value === null) {
        clearedIds.push(activityId);
      } else if (typeof value === "number") {
        upserts.push({
          user_id: user.id,
          activity_id: activityId,
          date,
          num_value: value,
          bool_value: null,
        });
      } else if (typeof value === "boolean") {
        upserts.push({
          user_id: user.id,
          activity_id: activityId,
          date,
          num_value: null,
          bool_value: value,
        });
      }
    }

    if (upserts.length > 0) {
      const { error } = await supabase
        .from("entries")
        .upsert(upserts, { onConflict: "user_id,activity_id,date" });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    if (clearedIds.length > 0) {
      // The .eq("date", date) is not optional: without it this wipes the
      // activity's entire history instead of clearing the one day.
      const { error } = await supabase
        .from("entries")
        .delete()
        .eq("user_id", user.id)
        .eq("date", date)
        .in("activity_id", clearedIds);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    const { data: rows, error: readError } = await supabase
      .from("entries")
      .select("activity_id, num_value, bool_value")
      .eq("user_id", user.id)
      .eq("date", date);

    if (readError) {
      return NextResponse.json({ error: readError.message }, { status: 400 });
    }

    const saved: Record<string, EntryValue> = {};
    for (const row of rows as Omit<EntryRow, "date">[]) {
      saved[row.activity_id] =
        row.num_value !== null ? Number(row.num_value) : Boolean(row.bool_value);
    }

    return NextResponse.json(
      { entry: { date, values: saved }, message: "Day saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving day:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
