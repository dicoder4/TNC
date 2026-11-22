import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  dateKeyInZone,
  dayKey,
  fetchBookedDays,
  isConfigured,
  isDemo,
} from "../lib/googleCalendar";
import { INSTAGRAM_DM_URL } from "../lib/enquiry";
import EnquiryPanel from "./EnquiryPanel";

const easeOut = [0.16, 1, 0.3, 1];
const MAX_MONTHS_AHEAD = 18;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MODES = [
  {
    id: "event",
    label: "Event date",
    dot: "bg-tnc-gold",
    hint: "The day(s) you'll perform. Tap one or more open dates.",
  },
  {
    id: "sessions",
    label: "Choreo sessions",
    dot: "bg-tnc-pink",
    hint: "When you'd like to rehearse. Tap a start date, then an end date.",
  },
  {
    id: "consult",
    label: "Consultation call",
    dot: "bg-tnc-teal",
    hint: "A quick call to plan your choreo. Tap one open date.",
  },
];

const monthLabelFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});
const shortDayFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
});
const longDateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function utcDate(year, month, day = 1) {
  // Noon UTC so formatting never slips to a neighbouring day.
  return new Date(Date.UTC(year, month, day, 12));
}

function keyToUtc(key) {
  const [y, m, d] = key.split("-").map(Number);
  return utcDate(y, m - 1, d);
}

function getToday() {
  const key = dateKeyInZone(new Date());
  const [y, m, d] = key.split("-").map(Number);
  return { year: y, month: m - 1, day: d, key };
}

const EMPTY_DETAILS = {
  name: "",
  contact: "",
  location: "",
  occasions: [],
  performances: [],
  notes: "",
};

export default function Availability() {
  // In production without calendar credentials, hide the section entirely.
  if (!isConfigured && !isDemo) return null;
  return <AvailabilityCalendar />;
}

function AvailabilityCalendar() {
  const today = useMemo(getToday, []);
  const [view, setView] = useState({ year: today.year, month: today.month });
  const [months, setMonths] = useState({}); // "y-m" -> { status, days }
  const [retryToken, setRetryToken] = useState(0);

  // selections
  const [mode, setMode] = useState("event");
  const [eventDates, setEventDates] = useState([]); // sorted keys
  const [sessions, setSessions] = useState({ start: null, end: null });
  const [consult, setConsult] = useState({ date: null, time: "Any time" });
  const [details, setDetails] = useState(EMPTY_DETAILS);

  const id = `${view.year}-${view.month}`;
  const current = months[id];
  const loading = current?.status !== "ready";

  useEffect(() => {
    if (months[id]?.status === "ready") return;
    const controller = new AbortController();
    setMonths((m) => ({ ...m, [id]: { status: "loading" } }));
    fetchBookedDays(view.year, view.month, controller.signal)
      .then((days) => setMonths((m) => ({ ...m, [id]: { status: "ready", days } })))
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setMonths((m) => ({ ...m, [id]: { status: "error" } }));
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, retryToken]);

  const monthsAhead = (view.year - today.year) * 12 + (view.month - today.month);
  const canPrev = monthsAhead > 0;
  const canNext = monthsAhead < MAX_MONTHS_AHEAD;

  function shiftMonth(delta) {
    setView(({ year, month }) => {
      const next = new Date(Date.UTC(year, month + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  }

  function handleDayClick(key) {
    if (mode === "event") {
      setEventDates((dates) =>
        dates.includes(key) ? dates.filter((d) => d !== key) : [...dates, key].sort()
      );
    } else if (mode === "consult") {
      setConsult((c) => ({ ...c, date: c.date === key ? null : key }));
    } else {
      setSessions(({ start, end }) => {
        if (!start || end) return { start: key, end: null };
        if (key === start) return { start: null, end: null };
        if (key < start) return { start: key, end: null };
        return { start, end: key };
      });
    }
  }

  const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
  const leadingBlanks = (new Date(Date.UTC(view.year, view.month, 1)).getUTCDay() + 6) % 7;

  const cells = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const key = dayKey(view.year, view.month, d);
    cells.push({
      day: d,
      key,
      isPast: key < today.key,
      isBooked: !loading && current.days.has(key),
      isToday: key === today.key,
    });
  }
  const openCount = loading ? null : cells.filter((c) => !c.isPast && !c.isBooked).length;

  const activeMode = MODES.find((m) => m.id === mode);
  const modeSummary = {
    event: eventDates.length
      ? `${eventDates.length} date${eventDates.length > 1 ? "s" : ""}`
      : null,
    sessions: sessions.start
      ? sessions.end
        ? `${shortDayFormat.format(keyToUtc(sessions.start))} – ${shortDayFormat.format(keyToUtc(sessions.end))}`
        : `From ${shortDayFormat.format(keyToUtc(sessions.start))}`
      : null,
    consult: consult.date ? shortDayFormat.format(keyToUtc(consult.date)) : null,
  };
  const hint =
    mode === "sessions" && sessions.start && !sessions.end
      ? "Now tap the last day of your sessions."
      : activeMode.hint;

  return (
    <section id="availability" className="relative overflow-hidden bg-tnc-cream px-4 py-24 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(173,36,81,0.07), transparent 45%), radial-gradient(circle at 85% 80%, rgba(207,159,66,0.14), transparent 45%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <span className="mb-4 inline-block text-[11px] font-medium uppercase tracking-[0.25em] text-tnc-pink">
            Availability
          </span>
          <h2 className="font-display text-3xl italic leading-tight text-tnc-teal sm:text-4xl">
            Plan your dates
          </h2>
          <p className="mt-4 text-sm text-tnc-teal/70">
            Pick your event date, when you&apos;d like to rehearse, and a time for a
            quick call. Choose any or all, then send it to us in one message.
          </p>
        </motion.div>

        <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
            className="rounded-3xl border border-tnc-beige bg-tnc-ivory/85 p-4 shadow-[0_4px_30px_rgba(83,44,32,0.06)] backdrop-blur-sm sm:p-7"
          >
            {/* mode tabs */}
            <div className="mb-3 grid grid-cols-3 gap-2" role="tablist" aria-label="Date type">
              {MODES.map((m) => {
                const active = m.id === mode;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setMode(m.id)}
                    className={`flex flex-col items-start gap-1 rounded-2xl border px-3 py-2.5 text-left transition-colors ${
                      active
                        ? "border-tnc-pink/50 bg-white/70"
                        : "border-tnc-beige hover:border-tnc-tan"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-[11px] font-semibold leading-tight tracking-wide text-tnc-teal sm:text-xs">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${m.dot}`} />
                      {m.label}
                    </span>
                    <span className="h-4 truncate text-[10px] text-tnc-teal/55">
                      {modeSummary[m.id] ?? "Not set"}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mb-6 min-h-[2rem] text-center text-xs text-tnc-teal/65" aria-live="polite">
              {hint}
            </p>

            {/* month header */}
            <div className="mb-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                disabled={!canPrev}
                aria-label="Previous month"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-tnc-teal/20 text-tnc-teal transition-colors hover:bg-tnc-teal/5 disabled:pointer-events-none disabled:opacity-25"
              >
                ←
              </button>
              <div className="text-center">
                <div className="font-display text-xl italic text-tnc-teal sm:text-2xl">
                  {monthLabelFormat.format(utcDate(view.year, view.month))}
                </div>
                <div className="mt-1 h-4 text-[11px] uppercase tracking-[0.2em] text-tnc-tan">
                  {openCount !== null &&
                    (openCount === 0
                      ? "Fully booked"
                      : `${openCount} date${openCount === 1 ? "" : "s"} open`)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                disabled={!canNext}
                aria-label="Next month"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-tnc-teal/20 text-tnc-teal transition-colors hover:bg-tnc-teal/5 disabled:pointer-events-none disabled:opacity-25"
              >
                →
              </button>
            </div>

            {current?.status === "error" ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <p className="text-sm text-tnc-teal/70">Couldn&apos;t load availability right now.</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRetryToken((t) => t + 1)}
                    className="rounded-full border border-tnc-teal/20 px-5 py-2 text-xs font-semibold tracking-wide text-tnc-teal transition-colors hover:bg-tnc-teal/5"
                  >
                    Try again
                  </button>
                  <a
                    href={INSTAGRAM_DM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-gradient-to-r from-tnc-pink to-tnc-burgundy px-5 py-2 text-xs font-semibold tracking-wide text-tnc-ivory"
                  >
                    DM us to check a date
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-2 grid grid-cols-7 gap-1.5 sm:gap-2">
                  {WEEKDAYS.map((w) => (
                    <div
                      key={w}
                      className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-tnc-teal/50"
                    >
                      {w}
                    </div>
                  ))}
                </div>

                <div
                  className={`grid grid-cols-7 gap-1.5 sm:gap-2 ${loading ? "animate-pulse opacity-50" : ""}`}
                  aria-busy={loading}
                >
                  {Array.from({ length: leadingBlanks }, (_, i) => (
                    <div key={`blank-${i}`} />
                  ))}
                  {cells.map((c) => {
                    const isEvent = eventDates.includes(c.key);
                    const isConsult = consult.date === c.key;
                    const rangeRole =
                      c.key === sessions.start || c.key === sessions.end
                        ? "end"
                        : sessions.start && sessions.end && c.key > sessions.start && c.key < sessions.end
                          ? "mid"
                          : null;
                    // Event & call dates must be open; rehearsals may span booked days.
                    const disabled =
                      loading || c.isPast || (c.isBooked && mode !== "sessions");

                    let tone;
                    if (loading) tone = "border-tnc-beige/50 bg-white/30 text-tnc-teal/30";
                    else if (isEvent)
                      tone = "border-transparent bg-gradient-to-br from-tnc-gold-soft to-tnc-gold font-semibold text-tnc-teal";
                    else if (rangeRole === "end")
                      tone = "border-transparent bg-tnc-pink font-semibold text-tnc-ivory";
                    else if (rangeRole === "mid")
                      tone = "border-tnc-pink/30 bg-tnc-pink/15 text-tnc-burgundy";
                    else if (c.isPast) tone = "border-transparent text-tnc-teal/25";
                    else if (c.isBooked)
                      tone = "border-tnc-beige bg-tnc-beige/50 text-tnc-tan";
                    else tone = "border-tnc-beige bg-white/60 text-tnc-teal";

                    const hover =
                      !disabled && !isEvent && !rangeRole
                        ? " hover:border-tnc-pink/50 hover:bg-white"
                        : "";
                    const ring = isConsult
                      ? " ring-2 ring-tnc-teal ring-offset-2 ring-offset-tnc-ivory"
                      : "";

                    const tags = [
                      loading ? "loading" : c.isPast ? "past" : c.isBooked ? "booked" : "open",
                      isEvent && "event date",
                      rangeRole && "choreo session",
                      isConsult && "consultation call",
                    ].filter(Boolean);

                    return (
                      <button
                        key={c.key}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleDayClick(c.key)}
                        aria-label={`${longDateFormat.format(
                          utcDate(view.year, view.month, c.day)
                        )}, ${tags.join(", ")}`}
                        className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm transition-colors disabled:cursor-not-allowed ${tone}${hover}${ring}`}
                      >
                        <span
                          className={
                            c.isBooked && !loading && !rangeRole
                              ? "line-through decoration-tnc-tan/60"
                              : ""
                          }
                        >
                          {c.day}
                        </span>
                        {!loading && c.isBooked && (
                          <span
                            className={`mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.12em] sm:block ${
                              rangeRole ? "text-tnc-ivory/80" : "text-tnc-tan"
                            }`}
                          >
                            Booked
                          </span>
                        )}
                        {c.isToday && (
                          <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-tnc-burgundy" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* legend */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.15em] text-tnc-teal/60">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded border border-tnc-beige bg-white/70" />
                    Open
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded border border-tnc-beige bg-tnc-beige/70" />
                    Booked
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-tnc-gold" />
                    Event
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-tnc-pink" />
                    Sessions
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded ring-2 ring-tnc-teal" />
                    Call
                  </span>
                </div>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.2, ease: easeOut }}
          >
            <EnquiryPanel
              eventDates={eventDates}
              sessions={sessions}
              consult={consult}
              details={details}
              onDetailsChange={setDetails}
              onConsultTimeChange={(time) => setConsult((c) => ({ ...c, time }))}
              onRemoveEventDate={(key) =>
                setEventDates((dates) => dates.filter((d) => d !== key))
              }
              onClearSessions={() => setSessions({ start: null, end: null })}
              onClearConsult={() => setConsult((c) => ({ ...c, date: null }))}
            />
            {isDemo && (
              <p className="mt-4 text-center text-[11px] text-tnc-burgundy/80">
                Showing sample dates. Add your Google Calendar details to
                <code className="mx-1">.env</code>to see real bookings.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
