// Reads booked days from a single Google Calendar using the free/busy API.
//
// Privacy: the calendar should be shared publicly as "See only free/busy
// (hide details)". The freeBusy endpoint only ever returns busy time ranges —
// no titles, descriptions, guests or locations — so event details never reach
// the browser, even for someone inspecting network requests.

const API_KEY = import.meta.env.VITE_GCAL_API_KEY;
const CALENDAR_ID = import.meta.env.VITE_GCAL_CALENDAR_ID;

// Days are bucketed in this timezone. Keep it the same as the Google
// Calendar's own timezone so all-day bookings land on the right date.
export const TIME_ZONE = import.meta.env.VITE_GCAL_TIMEZONE || "Asia/Kolkata";

export const isConfigured = Boolean(API_KEY && CALENDAR_ID);
// Without credentials, show sample data locally so the UI can be previewed.
export const isDemo = !isConfigured && import.meta.env.DEV;

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "YYYY-MM-DD" for the calendar day `date` falls on in TIME_ZONE. */
export function dateKeyInZone(date) {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(date).map((p) => [p.type, p.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/** "YYYY-MM-DD" from numeric parts (month is 0-based). */
export function dayKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Every calendar day (in TIME_ZONE) touched by any busy interval. */
function busyToDayKeys(busy) {
  const keys = new Set();
  for (const { start, end } of busy) {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (!(e > s)) continue;
    // Hourly steps are cheap for a month's worth of bookings and stay
    // correct across DST changes.
    for (let t = s; t < e; t += HOUR_MS) keys.add(dateKeyInZone(new Date(t)));
    keys.add(dateKeyInZone(new Date(e - 1)));
  }
  return keys;
}

function demoBookedDays(year, month) {
  const keys = new Set();
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  for (let d = 1; d <= days; d++) {
    if ((d * 7 + month * 3) % 5 === 0 || (d + month) % 11 === 0) {
      keys.add(dayKey(year, month, d));
    }
  }
  return keys;
}

/**
 * Returns a Set of "YYYY-MM-DD" keys that are booked in the given month
 * (month is 0-based).
 */
export async function fetchBookedDays(year, month, signal) {
  if (isDemo) {
    await new Promise((r) => setTimeout(r, 400));
    return demoBookedDays(year, month);
  }
  if (!isConfigured) throw new Error("Google Calendar is not configured");

  // Pad a day either side so timezone offsets can't clip edge days.
  const body = {
    timeMin: new Date(Date.UTC(year, month, 1) - DAY_MS).toISOString(),
    timeMax: new Date(Date.UTC(year, month + 1, 1) + DAY_MS).toISOString(),
    timeZone: TIME_ZONE,
    items: [{ id: CALENDAR_ID }],
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/freeBusy?key=${encodeURIComponent(API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    }
  );
  if (!res.ok) throw new Error(`Google Calendar request failed (${res.status})`);

  const data = await res.json();
  const calendar = data.calendars?.[CALENDAR_ID];
  if (!calendar) throw new Error("Calendar missing from Google response");
  if (calendar.errors?.length) {
    // e.g. "notFound" when the calendar isn't shared publicly.
    throw new Error(
      `Google Calendar error: ${calendar.errors.map((e) => e.reason).join(", ")}`
    );
  }
  return busyToDayKeys(calendar.busy || []);
}
