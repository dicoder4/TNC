import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  INSTAGRAM_DM_URL,
  OCCASIONS,
  PERFORMANCES,
  TIME_PREFS,
  buildMessage,
  copyText,
  daysInclusive,
  enquiryPayload,
  formatKey,
  hasAnyDate,
  notifyTeam,
  whatsappUrl,
} from "../lib/enquiry";

const easeOut = [0.16, 1, 0.3, 1];

const inputCls =
  "w-full rounded-xl border border-tnc-beige bg-white/60 px-3.5 py-2.5 text-sm text-tnc-teal placeholder:text-tnc-tan outline-none transition-colors focus:border-tnc-pink/60 focus:bg-white";

const reveal = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.35, ease: easeOut },
};

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
        active
          ? "border-tnc-pink bg-tnc-pink text-tnc-ivory"
          : "border-tnc-beige bg-white/50 text-tnc-teal/80 hover:border-tnc-tan"
      }`}
    >
      {children}
    </button>
  );
}

function Step({ n, title, children }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-tnc-teal text-[10px] font-semibold text-tnc-ivory">
          {n}
        </span>
        <span className="text-sm font-semibold text-tnc-teal">{title}</span>
      </div>
      {children}
    </div>
  );
}

function SelectionRow({ dot, label, value, onRemove, children }) {
  return (
    <div className="rounded-xl bg-white/60 px-3.5 py-2.5">
      <div className="flex items-center gap-3">
        <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <div className="min-w-0 flex-1 text-sm">
          <span className="text-tnc-teal/55">{label}</span>{" "}
          <span className="font-medium text-tnc-teal">{value}</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-tnc-tan transition-colors hover:bg-tnc-teal/5 hover:text-tnc-teal"
        >
          ×
        </button>
      </div>
      {children}
    </div>
  );
}

export default function EnquiryPanel({
  bookedUntilLabel,
  bookingStartLabel,
  eventDates,
  sessions,
  consult,
  details,
  onDetailsChange,
  onConsultTimeChange,
  onRemoveEventDate,
  onClearSessions,
  onClearConsult,
}) {
  const [status, setStatus] = useState(null); // null | "copied" | "failed"
  const [showPreview, setShowPreview] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const selection = { eventDates, sessions, consult };
  const ready = hasAnyDate(selection) || details.early;
  const message = useMemo(
    () => buildMessage({ details, eventDates, sessions, consult, bookedUntilLabel }),
    [details, eventDates, sessions, consult, bookedUntilLabel]
  );

  const set = (field) => (value) => onDetailsChange({ ...details, [field]: value });
  const toggle = (field, value) =>
    set(field)(
      details[field].includes(value)
        ? details[field].filter((x) => x !== value)
        : [...details[field], value]
    );

  const extrasCount =
    details.occasions.length + details.performances.length + (details.notes.trim() ? 1 : 0);

  // Email/log each distinct enquiry once, whichever button the customer uses.
  const lastNotified = useRef(null);
  function notify(channel) {
    if (lastNotified.current === message) return;
    lastNotified.current = message;
    notifyTeam(
      enquiryPayload({ details, eventDates, sessions, consult, message, bookedUntilLabel }, channel)
    );
  }

  function sendInstagram() {
    // Start the copy and open the DM in the same click so neither is blocked.
    const copied = copyText(message);
    notify("Instagram");
    window.open(INSTAGRAM_DM_URL, "_blank", "noopener,noreferrer");
    copied.then((ok) => {
      setStatus(ok ? "copied" : "failed");
      if (!ok) setShowPreview(true);
    });
  }

  function copyOnly() {
    notify("Copied");
    copyText(message).then((ok) => {
      setStatus(ok ? "copied" : "failed");
      if (!ok) setShowPreview(true);
    });
  }

  const linkCls =
    "font-medium text-tnc-teal/70 underline decoration-tnc-teal/20 underline-offset-4 transition-colors hover:text-tnc-teal hover:decoration-tnc-teal disabled:pointer-events-none disabled:opacity-40";

  return (
    <div
      id="enquiry-panel"
      className="flex scroll-mt-24 flex-col gap-7 rounded-3xl border border-tnc-beige bg-tnc-ivory/85 p-5 shadow-[0_4px_30px_rgba(83,44,32,0.06)] backdrop-blur-sm sm:p-7"
    >
      <h3 className="font-display text-xl italic text-tnc-teal sm:text-2xl">Your enquiry</h3>

      {/* 1 · dates */}
      <Step n={1} title="Your dates">
        <div className="flex flex-col gap-2">
          {!ready && (
            <div className="rounded-xl border border-dashed border-tnc-tan/50 px-4 py-5 text-center text-sm text-tnc-teal/55">
              Tap a date on the calendar to start.
              <button
                type="button"
                onClick={() => onDetailsChange({ ...details, early: true })}
                className="mt-1.5 block w-full text-xs font-medium text-tnc-burgundy underline decoration-tnc-burgundy/30 underline-offset-4 hover:decoration-tnc-burgundy"
              >
                Celebrating before {bookingStartLabel}?
              </button>
            </div>
          )}
          {details.early && (
            <SelectionRow
              dot="bg-tnc-burgundy"
              label="Event before"
              value={bookingStartLabel}
              onRemove={() => onDetailsChange({ ...details, early: false, earlyDate: "" })}
            >
              <p className="mt-2 pl-5 text-xs text-tnc-teal/60">
                We&apos;re booked, but we&apos;ll happily recommend choreographers we trust.
              </p>
              <input
                className={`${inputCls} mt-2`}
                placeholder="Your event date, e.g. 14 Feb 2027"
                value={details.earlyDate}
                onChange={(e) => set("earlyDate")(e.target.value)}
                aria-label="Your event date"
              />
            </SelectionRow>
          )}
          {eventDates.map((key) => (
            <SelectionRow
              key={key}
              dot="bg-tnc-gold"
              label="Event"
              value={formatKey(key)}
              onRemove={() => onRemoveEventDate(key)}
            />
          ))}
          {sessions.start && (
            <SelectionRow
              dot="bg-tnc-pink"
              label="Rehearsals"
              value={
                sessions.end
                  ? `${formatKey(sessions.start)} → ${formatKey(sessions.end)} (${daysInclusive(sessions.start, sessions.end)} days)`
                  : `from ${formatKey(sessions.start)}…`
              }
              onRemove={onClearSessions}
            />
          )}
          {consult.date && (
            <SelectionRow
              dot="bg-tnc-teal"
              label="Intro call"
              value={formatKey(consult.date)}
              onRemove={onClearConsult}
            >
              <div className="mt-2.5 flex flex-wrap gap-1.5 pl-5">
                {TIME_PREFS.map((t) => (
                  <Chip key={t} active={consult.time === t} onClick={() => onConsultTimeChange(t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            </SelectionRow>
          )}
        </div>
      </Step>

      {/* 2 · about you */}
      <Step n={2} title="About you">
        <div className="grid gap-2.5 sm:grid-cols-2">
          <input
            className={inputCls}
            placeholder="Your name"
            value={details.name}
            onChange={(e) => set("name")(e.target.value)}
            aria-label="Your name"
          />
          <input
            className={inputCls}
            placeholder="Phone or email"
            value={details.contact}
            onChange={(e) => set("contact")(e.target.value)}
            aria-label="Phone or email"
          />
          <input
            className={`${inputCls} sm:col-span-2`}
            placeholder="City, or 'Online'"
            value={details.location}
            onChange={(e) => set("location")(e.target.value)}
            aria-label="Location"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowMore((s) => !s)}
          aria-expanded={showMore}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-tnc-pink transition-colors hover:text-tnc-burgundy"
        >
          <span
            aria-hidden
            className={`inline-block transition-transform ${showMore ? "rotate-45" : ""}`}
          >
            +
          </span>
          {showMore ? "Fewer details" : "Add occasion, songs & more"}
          <span className="text-tnc-teal/45">
            {extrasCount > 0 && !showMore ? `(${extrasCount} added)` : "(optional)"}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {showMore && (
            <motion.div {...reveal} className="overflow-hidden">
              <div className="flex flex-col gap-4 pt-4">
                <div>
                  <div className="mb-2 text-xs text-tnc-teal/60">Occasion</div>
                  <div className="flex flex-wrap gap-1.5">
                    {OCCASIONS.map((o) => (
                      <Chip
                        key={o}
                        active={details.occasions.includes(o)}
                        onClick={() => toggle("occasions", o)}
                      >
                        {o}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-xs text-tnc-teal/60">Looking for</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PERFORMANCES.map((p) => (
                      <Chip
                        key={p}
                        active={details.performances.includes(p)}
                        onClick={() => toggle("performances", p)}
                      >
                        {p}
                      </Chip>
                    ))}
                  </div>
                </div>
                <textarea
                  className={`${inputCls} min-h-[80px] resize-y`}
                  placeholder="Songs, number of people, venue…"
                  value={details.notes}
                  onChange={(e) => set("notes")(e.target.value)}
                  aria-label="Notes"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Step>

      {/* 3 · send */}
      <Step n={3} title="Send it to us">
        <button
          type="button"
          disabled={!ready}
          onClick={sendInstagram}
          className="w-full rounded-full bg-gradient-to-r from-tnc-pink to-tnc-burgundy px-6 py-3 text-sm font-semibold tracking-wide text-tnc-ivory shadow-[0_8px_30px_rgba(173,36,81,0.25)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {ready ? "Send on Instagram" : "Pick a date first"}
        </button>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
          {whatsappUrl && (
            <a
              href={ready ? whatsappUrl(message) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!ready}
              onClick={() => notify("WhatsApp")}
              className={`${linkCls} ${ready ? "" : "pointer-events-none opacity-40"}`}
            >
              WhatsApp instead
            </a>
          )}
          <button type="button" disabled={!ready} onClick={copyOnly} className={linkCls}>
            Copy message
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => setShowPreview((s) => !s)}
            className={linkCls}
          >
            {showPreview ? "Hide preview" : "Preview"}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showPreview && (
            <motion.pre
              {...reveal}
              className="mt-3 overflow-hidden whitespace-pre-wrap rounded-xl bg-white/70 p-4 font-sans text-xs leading-relaxed text-tnc-teal/85 select-all"
            >
              {message}
            </motion.pre>
          )}
        </AnimatePresence>

        <div className="mt-3 min-h-[1.25rem] text-center text-xs leading-relaxed" aria-live="polite">
          {status === "copied" && (
            <span className="text-emerald-800">
              Copied! Just paste it in the chat and hit send.
            </span>
          )}
          {status === "failed" && (
            <span className="text-tnc-burgundy">
              Couldn&apos;t copy automatically. Select the preview above and copy it.
            </span>
          )}
          {status === null && ready && (
            <span className="text-tnc-teal/50">
              We&apos;ll copy your message so you can paste it in our DMs.
            </span>
          )}
        </div>
      </Step>
    </div>
  );
}
