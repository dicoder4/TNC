import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  dateKeyInZone,
  dayKey,
  fetchBookedDays,
  isConfigured,
  isDemo,
} from "../lib/googleCalendar";

const easeOut = [0.16, 1, 0.3, 1];
const MAX_MONTHS_AHEAD = 18;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DM_URL = "https://ig.me/m/the_naach_company";

const monthLabelFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
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

function monthId(year, month) {
  return `${year}-${month}`;
}

function getToday() {
  const key = dateKeyInZone(new Date());
  const [y, m, d] = key.split("-").map(Number);
  return { year: y, month: m - 1, day: d, key };
}

export default function Availability() {
  // In production without calendar credentials, hide the section entirely.
  if (!isConfigured && !isDemo) return null;
  return <AvailabilityCalendar />;
}

function AvailabilityCalendar() {
  const today = useMemo(getToday, []);
  const [view, setView] = useState({ year: today.year, month: today.month });
  const [months, setMonths] = useState({}); // monthId -> { status, days, error }
  const [selected, setSelected] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  const id = monthId(view.year, view.month);
  const current = months[id];

  useEffect(() => {
    if (months[id]?.status === "ready") return;
    const controller = new AbortController();
    setMonths((m) => ({ ...m, [id]: { status: "loading" } }));
    fetchBookedDays(view.year, view.month, controller.signal)
      .then((days) =>
        setMonths((m) => ({ ...m, [id]: { status: "ready", days } }))
      )
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setMonths((m) => ({ ...m, [id]: { status: "error", error } }));
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, retryToken]);

  const monthsAhead =
    (view.year - today.year) * 12 + (view.month - today.month);
  const canPrev = monthsAhead > 0;
  const canNext = monthsAhead < MAX_MONTHS_AHEAD;

  function shiftMonth(delta) {
    setSelected(null);
    setView(({ year, month }) => {
      const next = new Date(Date.UTC(year, month + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  }

  const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
  const leadingBlanks = (new Date(Date.UTC(view.year, view.month, 1)).getUTCDay() + 6) % 7;

  const cells = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const key = dayKey(view.year, view.month, d);
    const isPast = key < today.key;
    const isBooked = current?.status === "ready" && current.days.has(key);
    cells.push({ day: d, key, isPast, isBooked, isToday: key === today.key });
  }

  const openCount =
    current?.status === "ready"
      ? cells.filter((c) => !c.isPast && !c.isBooked).length
      : null;

  const selectedDate = selected
    ? utcDate(...selected.split("-").map((n, i) => (i === 1 ? n - 1 : Number(n))))
    : null;

  return (
    <section id="availability" className="relative overflow-hidden bg-[#08060a] px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(236,72,153,0.12), transparent 45%), radial-gradient(circle at 85% 80%, rgba(246,196,83,0.08), transparent 45%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <span className="mb-4 inline-block text-[11px] font-medium uppercase tracking-[0.25em] text-pink-200/70">
            Availability
          </span>
          <h2 className="font-display text-3xl italic leading-tight text-white sm:text-4xl">
            Find your date
          </h2>
          <p className="mt-4 text-sm text-gray-400">
            Pick an open date and DM us to lock it in. Dates go fast in
            wedding season.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm sm:p-7"
        >
          {/* header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              disabled={!canPrev}
              aria-label="Previous month"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-pink-100 transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-25"
            >
              ←
            </button>
            <div className="text-center">
              <div className="font-display text-xl italic text-white sm:text-2xl">
                {monthLabelFormat.format(utcDate(view.year, view.month))}
              </div>
              <div className="mt-1 h-4 text-[11px] uppercase tracking-[0.2em] text-gray-500">
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
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-pink-100 transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-25"
            >
              →
            </button>
          </div>

          {current?.status === "error" ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-sm text-gray-400">
                Couldn&apos;t load availability right now.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRetryToken((t) => t + 1)}
                  className="rounded-full border border-white/15 px-5 py-2 text-xs font-semibold tracking-wide text-pink-50 transition-colors hover:bg-white/10"
                >
                  Try again
                </button>
                <a
                  href={DM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gradient-to-r from-pink-500 to-amber-400 px-5 py-2 text-xs font-semibold tracking-wide text-black"
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
                    className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500"
                  >
                    {w}
                  </div>
                ))}
              </div>

              <div
                className={`grid grid-cols-7 gap-1.5 transition-opacity sm:gap-2 ${
                  current?.status === "ready" ? "" : "animate-pulse opacity-50"
                }`}
                aria-busy={current?.status !== "ready"}
              >
                {Array.from({ length: leadingBlanks }, (_, i) => (
                  <div key={`blank-${i}`} />
                ))}
                {cells.map((c) => {
                  const loading = current?.status !== "ready";
                  const disabled = loading || c.isPast || c.isBooked;
                  const isSelected = selected === c.key;
                  const status = c.isPast
                    ? "past"
                    : c.isBooked
                      ? "booked"
                      : "available";

                  let cls =
                    "relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm transition-colors ";
                  if (loading) cls += "border-white/5 bg-white/[0.02] text-gray-600";
                  else if (c.isPast) cls += "border-transparent text-gray-700";
                  else if (c.isBooked)
                    cls += "border-pink-500/15 bg-pink-500/[0.08] text-pink-200/40";
                  else if (isSelected)
                    cls += "border-transparent bg-gradient-to-br from-pink-500 to-amber-400 font-semibold text-black";
                  else
                    cls += "border-white/10 bg-white/[0.04] text-white hover:border-pink-300/50 hover:bg-white/[0.08]";

                  return (
                    <button
                      key={c.key}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelected(isSelected ? null : c.key)}
                      aria-pressed={isSelected}
                      aria-label={`${longDateFormat.format(
                        utcDate(view.year, view.month, c.day)
                      )}, ${loading ? "loading" : status}`}
                      className={cls}
                    >
                      <span className={c.isBooked && !loading ? "line-through decoration-pink-300/40" : ""}>
                        {c.day}
                      </span>
                      {!loading && c.isBooked && (
                        <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.12em] text-pink-300/60 sm:block">
                          Booked
                        </span>
                      )}
                      {c.isToday && !isSelected && (
                        <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-amber-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* legend */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.15em] text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-white/10 bg-white/[0.06]" />
                  Open
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-pink-500/20 bg-pink-500/[0.12]" />
                  Booked
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                  Today
                </span>
              </div>
            </>
          )}

          <AnimatePresence>
            {selectedDate && (
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                transition={{ duration: 0.4, ease: easeOut }}
                className="overflow-hidden"
              >
                <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-pink-300/20 bg-pink-500/[0.06] p-5 text-center sm:flex-row sm:justify-between sm:text-left">
                  <div>
                    <div className="font-display text-lg italic text-white">
                      {longDateFormat.format(selectedDate)}
                    </div>
                    <div className="mt-1 text-sm text-gray-400">
                      This date is open. Message us to lock it in.
                    </div>
                  </div>
                  <a
                    href={DM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-full bg-gradient-to-r from-pink-500 to-amber-400 px-6 py-2.5 text-sm font-semibold tracking-wide text-black shadow-[0_8px_30px_rgba(236,72,153,0.3)]"
                  >
                    DM us on Instagram
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isDemo && (
            <p className="mt-5 text-center text-[11px] text-amber-300/70">
              Showing sample dates. Add your Google Calendar details to
              <code className="mx-1">.env</code>to see real bookings.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
