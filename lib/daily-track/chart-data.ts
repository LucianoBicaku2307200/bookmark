import { Activity, Entry, EntryValue } from "@/types";

export type DateRange = { from?: string; to?: string };

export type ChartRow = { date: string } & Record<string, number | null | string>;

export type HeatmapDay = {
  date: string;
  done: string[];
  total: number;
  level: 0 | 1 | 2 | 3 | 4;
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const pad = (n: number) => String(n).padStart(2, "0");

// Local calendar day, never toISOString() -- that shifts the day across timezones.
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, n: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + n);
  return next;
}

export function eachDayInRange(from: string, to: string): string[] {
  const keys: string[] = [];
  let cursor = fromDateKey(from);
  const end = fromDateKey(to);
  while (cursor <= end) {
    keys.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }
  return keys;
}

export function formatDateLabel(key: string): string {
  const date = fromDateKey(key);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function entryBounds(entries: Entry[]): { from: string; to: string } {
  const today = toDateKey(new Date());
  if (entries.length === 0) {
    return { from: toDateKey(addDays(new Date(), -29)), to: today };
  }
  const first = entries[0].date;
  const last = entries[entries.length - 1].date;
  return { from: first, to: last > today ? last : today };
}

export function resolveRange(range: DateRange, entries: Entry[]): [string, string] {
  const bounds = entryBounds(entries);
  const from = range.from ?? bounds.from;
  const to = range.to ?? bounds.to;
  return from <= to ? [from, to] : [to, from];
}

// Dense: one row per day, null for unlogged so the chart draws a gap rather
// than a straight line through missing days.
export function toChartRows(
  entries: Entry[],
  activities: Activity[],
  dayKeys: string[]
): ChartRow[] {
  const byDate = new Map(entries.map((entry) => [entry.date, entry.values]));
  return dayKeys.map((key) => {
    const values = byDate.get(key);
    const row: ChartRow = { date: key };
    for (const activity of activities) {
      const raw = values?.[activity.id];
      row[activity.id] = typeof raw === "number" ? raw : null;
    }
    return row;
  });
}

// Accumulation deliberately starts within the selected range. Days before a
// series' first value stay null so a leading zero never invents history.
export function toCumulativeRows(rows: ChartRow[], activities: Activity[]): ChartRow[] {
  const totals: Record<string, number | null> = {};
  for (const activity of activities) totals[activity.id] = null;

  return rows.map((row) => {
    const next: ChartRow = { date: row.date };
    for (const activity of activities) {
      const raw = row[activity.id];
      if (typeof raw === "number") {
        totals[activity.id] = (totals[activity.id] ?? 0) + raw;
      }
      next[activity.id] = totals[activity.id];
    }
    return next;
  });
}

// Spans all history, not the selected range -- accumulation is a fact about the
// data, not about the view.
export function totalsBefore(entries: Entry[], date: string): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const entry of entries) {
    if (entry.date >= date) continue;
    for (const [activityId, value] of Object.entries(entry.values)) {
      if (typeof value !== "number") continue;
      totals[activityId] = (totals[activityId] ?? 0) + value;
    }
  }
  return totals;
}

export function toHeatmapDays(
  entries: Entry[],
  checkboxActivities: Activity[],
  dayKeys: string[]
): HeatmapDay[] {
  const byDate = new Map(entries.map((entry) => [entry.date, entry.values]));
  const total = checkboxActivities.length;

  return dayKeys.map((key) => {
    const values = byDate.get(key);
    const done = checkboxActivities
      .filter((activity) => values?.[activity.id] === true)
      .map((activity) => activity.name);

    const ratio = total === 0 ? 0 : done.length / total;
    const level = (
      done.length === 0 ? 0 : Math.min(4, Math.max(1, Math.round(ratio * 4)))
    ) as HeatmapDay["level"];

    return { date: key, done, total, level };
  });
}

// Pads out to whole Sun-Sat columns, GitHub-contributions style.
export function toWeekColumns(days: HeatmapDay[]): (HeatmapDay | null)[][] {
  if (days.length === 0) return [];

  const cells: (HeatmapDay | null)[] = [
    ...Array<null>(fromDateKey(days[0].date).getDay()).fill(null),
    ...days,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const columns: (HeatmapDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) columns.push(cells.slice(i, i + 7));
  return columns;
}

export function entryValueOf(
  numValue: number | null,
  boolValue: boolean | null
): EntryValue {
  return numValue !== null ? Number(numValue) : Boolean(boolValue);
}
