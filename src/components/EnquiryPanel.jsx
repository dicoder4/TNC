import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  INSTAGRAM_CONTACT_URL,
  INSTAGRAM_PROFILE_URL,
  isPhone,
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

function InstagramIcon() {
  return (
    <svg
      aria-hidden
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
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
  const [triedInstagram, setTriedInstagram] = useState(false);

  const selection = { eventDates, sessions, consult };
  const ready = hasAnyDate(selection) || details.early;
  const message = useMemo(
    () => buildMessage({ details, eventDates, sessions, consult, bookedUntilLabel }),
    [details, eventDates, sessions, consult, bookedUntilLabel],
  );

  const set = (field) => (value) => onDetailsChange({ ...details, [field]: value });
  const toggle = (field, value) =>
    set(field)(
      details[field].includes(value)
        ? details[field].filter((x) => x !== value)
        : [...details[field], value],
    );

  // Email/log each distinct enquiry once, whichever button the customer uses.
  const lastNotified = useRef(null);
  function notify(channel) {
    if (lastNotified.current === message) return;
    lastNotified.current = message;
    notifyTeam(
      enquiryPayload(
        { details, eventDates, sessions, consult, message, bookedUntilLabel },
        channel,
      ),
    );
  }

  function sendInstagram() {
    // Runs on the link's click, before it navigates, so the copy is allowed.
    // A real link (not window.open) lets phones open the Instagram app's DM.
    const copied = copyText(message);
    notify("Instagram");
    // We can't see whether the DM tab worked, so always offer the profile as a backup.
    setTriedInstagram(true);
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

        <div className="mt-5 flex flex-col gap-4">
          <div>
            <div className="mb-2 text-xs text-tnc-teal/60">
              Occasion <span className="text-tnc-teal/40">(optional)</span>
            </div>
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
            <div className="mb-2 text-xs text-tnc-teal/60">
              Looking for <span className="text-tnc-teal/40">(optional)</span>
            </div>
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
            placeholder="Anything else? Songs, number of people, venue… (optional)"
            value={details.notes}
            onChange={(e) => set("notes")(e.target.value)}
            aria-label="Notes"
          />
        </div>
      </Step>

      {/* 3 · send */}
      <Step n={3} title="Message us">
        <div className={`grid gap-2.5 ${whatsappUrl ? "sm:grid-cols-2" : ""}`}>
          <a
            href={ready ? INSTAGRAM_CONTACT_URL : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!ready}
            onClick={ready ? sendInstagram : undefined}
            className={`flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-tnc-pink to-tnc-burgundy px-5 py-3 text-sm font-semibold tracking-wide text-tnc-ivory shadow-[0_8px_24px_rgba(173,36,81,0.25)] transition-transform hover:-translate-y-0.5 ${
              ready ? "" : "pointer-events-none opacity-40 shadow-none"
            }`}
          >
            <InstagramIcon />
            Message on Instagram
          </a>
          {whatsappUrl && (
            <a
              href={ready ? whatsappUrl(message) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!ready}
              onClick={ready ? () => notify("WhatsApp") : undefined}
              className={`flex items-center justify-center gap-2 rounded-full bg-tnc-teal px-5 py-3 text-sm font-semibold tracking-wide text-tnc-ivory shadow-[0_8px_24px_rgba(14,57,58,0.25)] transition-transform hover:-translate-y-0.5 ${
                ready ? "" : "pointer-events-none opacity-40 shadow-none"
              }`}
            >
              <WhatsAppIcon />
              Chat on WhatsApp
            </a>
          )}
        </div>
        {!ready && <p className="mt-2 text-center text-xs text-tnc-teal/50">Pick a date first.</p>}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
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

        <div
          className="mt-3 min-h-[1.25rem] text-center text-xs leading-relaxed"
          aria-live="polite"
        >
          {status === "copied" && (
            <span className="text-emerald-800">
              {isPhone && triedInstagram
                ? "Copied! On our profile, tap Message, then paste and send."
                : "Copied! Just paste it in the chat and hit send."}
            </span>
          )}
          {status === "failed" && (
            <span className="text-tnc-burgundy">
              Couldn&apos;t copy automatically. Select the preview above and copy it.
            </span>
          )}
          {status === null && ready && (
            <span className="text-tnc-teal/50">
              WhatsApp fills in your message. For Instagram, we copy it so you can paste it.
            </span>
          )}
          {triedInstagram && !isPhone && (
            <span className="mt-1.5 block text-tnc-teal/60">
              DM didn&apos;t open?{" "}
              <a
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-tnc-pink underline decoration-tnc-pink/30 underline-offset-4 hover:decoration-tnc-pink"
              >
                Open our Instagram profile
              </a>{" "}
              and tap Message.
            </span>
          )}
        </div>
      </Step>
    </div>
  );
}
