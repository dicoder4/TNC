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
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-colors focus:border-pink-300/50";

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
        active
          ? "border-pink-300/60 bg-pink-500/20 text-pink-50"
          : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/25"
      }`}
    >
      {children}
    </button>
  );
}

function Label({ children }) {
  return (
    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-200/70">
      {children}
    </div>
  );
}

function SelectionRow({ dot, label, value, onRemove, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3">
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
            {label}
          </div>
          <div className="mt-0.5 text-sm text-white">{value}</div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
        >
          ×
        </button>
      </div>
      {children}
    </div>
  );
}

export default function EnquiryPanel({
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

  const selection = { eventDates, sessions, consult };
  const ready = hasAnyDate(selection);
  const message = useMemo(
    () => buildMessage({ details, eventDates, sessions, consult }),
    [details, eventDates, sessions, consult]
  );

  const set = (field) => (value) => onDetailsChange({ ...details, [field]: value });
  const toggle = (field, value) =>
    set(field)(
      details[field].includes(value)
        ? details[field].filter((x) => x !== value)
        : [...details[field], value]
    );

  // Email/log each distinct enquiry once, whichever button the customer uses.
  const lastNotified = useRef(null);
  function notify(channel) {
    if (lastNotified.current === message) return;
    lastNotified.current = message;
    notifyTeam(enquiryPayload({ details, eventDates, sessions, consult, message }, channel));
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

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:p-7">
      <div>
        <h3 className="font-display text-xl italic text-white sm:text-2xl">Your enquiry</h3>
        <p className="mt-1 text-xs text-gray-500">
          Pick any mix of dates on the calendar, add a few details, and send it to us.
        </p>
      </div>

      {/* selected dates */}
      <div className="flex flex-col gap-2.5">
        {!ready && (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-gray-500">
            No dates picked yet. Choose a date type, then tap the calendar.
          </div>
        )}
        {eventDates.map((key) => (
          <SelectionRow
            key={key}
            dot="bg-amber-400"
            label="Event date"
            value={formatKey(key)}
            onRemove={() => onRemoveEventDate(key)}
          />
        ))}
        {sessions.start && (
          <SelectionRow
            dot="bg-pink-500"
            label="Choreo sessions"
            value={
              sessions.end
                ? `${formatKey(sessions.start)} → ${formatKey(sessions.end)} · ${daysInclusive(sessions.start, sessions.end)} days`
                : `From ${formatKey(sessions.start)}. Tap an end date.`
            }
            onRemove={onClearSessions}
          />
        )}
        {consult.date && (
          <SelectionRow
            dot="bg-violet-400"
            label="Consultation call"
            value={formatKey(consult.date)}
            onRemove={onClearConsult}
          >
            <div className="mt-3 flex flex-wrap gap-1.5 pl-5">
              {TIME_PREFS.map((t) => (
                <Chip key={t} active={consult.time === t} onClick={() => onConsultTimeChange(t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </SelectionRow>
        )}
      </div>

      {/* details */}
      <div className="flex flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={inputCls}
            placeholder="Your name"
            value={details.name}
            onChange={(e) => set("name")(e.target.value)}
            aria-label="Your name"
          />
          <input
            className={inputCls}
            placeholder="Phone or email, so we can reply"
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

        <div>
          <Label>Occasions · pick all that apply</Label>
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
          <Label>Looking for · pick all that apply</Label>
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
          className={`${inputCls} min-h-[84px] resize-y`}
          placeholder="Anything else? Songs, number of people, venue…"
          value={details.notes}
          onChange={(e) => set("notes")(e.target.value)}
          aria-label="Notes"
        />
      </div>

      {/* preview */}
      <div>
        <button
          type="button"
          onClick={() => setShowPreview((s) => !s)}
          className="text-xs font-medium tracking-wide text-pink-200/80 transition-colors hover:text-pink-100"
        >
          {showPreview ? "Hide message preview" : "Preview message"}
        </button>
        <AnimatePresence initial={false}>
          {showPreview && (
            <motion.pre
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="mt-3 overflow-hidden whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 font-sans text-xs leading-relaxed text-gray-300 select-all"
            >
              {message}
            </motion.pre>
          )}
        </AnimatePresence>
      </div>

      {/* actions */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled={!ready}
          onClick={sendInstagram}
          className="rounded-full bg-gradient-to-r from-pink-500 to-amber-400 px-6 py-3 text-sm font-semibold tracking-wide text-black shadow-[0_8px_30px_rgba(236,72,153,0.3)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {ready ? "Copy message & open Instagram DM" : "Pick a date to continue"}
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={!ready}
            onClick={copyOnly}
            className="flex-1 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold tracking-wide text-pink-50 transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            Copy message
          </button>
          {whatsappUrl && (
            <a
              href={ready ? whatsappUrl(message) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!ready}
              onClick={() => notify("WhatsApp")}
              className={`flex-1 rounded-full border border-emerald-400/30 px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-emerald-200 transition-colors hover:bg-emerald-400/10 ${
                ready ? "" : "pointer-events-none opacity-40"
              }`}
            >
              Send on WhatsApp
            </a>
          )}
        </div>

        <div className="min-h-[2.5rem] text-center text-xs leading-relaxed" aria-live="polite">
          {status === "copied" && (
            <span className="text-emerald-300">
              Message copied. In the Instagram chat, long-press the message box, tap{" "}
              <strong>Paste</strong> and send.
            </span>
          )}
          {status === "failed" && (
            <span className="text-amber-300">
              Couldn&apos;t copy automatically. Select the message above and copy it.
            </span>
          )}
          {status === null && ready && (
            <span className="text-gray-500">
              Instagram doesn&apos;t let websites fill in DMs, so we copy your message
              for you. Just paste it in the chat.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
