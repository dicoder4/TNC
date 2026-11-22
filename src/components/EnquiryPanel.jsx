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

function Label({ children }) {
  return (
    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-tnc-pink">
      {children}
    </div>
  );
}

function SelectionRow({ dot, label, value, onRemove, children }) {
  return (
    <div className="rounded-xl border border-tnc-beige bg-white/50 px-3.5 py-3">
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-tnc-tan">
            {label}
          </div>
          <div className="mt-0.5 text-sm text-tnc-teal">{value}</div>
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

  return (
    <div id="enquiry-panel" className="flex scroll-mt-24 flex-col gap-6 rounded-3xl border border-tnc-beige bg-tnc-ivory/85 p-5 shadow-[0_4px_30px_rgba(83,44,32,0.06)] backdrop-blur-sm sm:p-7">
      <div>
        <h3 className="font-display text-xl italic text-tnc-teal sm:text-2xl">Your enquiry</h3>
        <p className="mt-1 text-xs text-tnc-teal/60">
          Pick any mix of dates on the calendar, add a few details, and send it to us.
        </p>
      </div>

      {/* selected dates */}
      <div className="flex flex-col gap-2.5">
        {!ready && (
          <div className="rounded-xl border border-dashed border-tnc-tan/50 px-4 py-6 text-center text-sm text-tnc-teal/55">
            No dates picked yet. Choose a date type, then tap the calendar.
            <button
              type="button"
              onClick={() => onDetailsChange({ ...details, early: true })}
              className="mt-2 block w-full text-xs font-medium text-tnc-burgundy underline decoration-tnc-burgundy/30 underline-offset-4 hover:decoration-tnc-burgundy"
            >
              Celebrating before {bookingStartLabel}? Say hello anyway
            </button>
          </div>
        )}
        {details.early && (
          <SelectionRow
            dot="bg-tnc-burgundy"
            label={`Event before ${bookingStartLabel}`}
            value="We'd love to help you find the right choreographer for your day."
            onRemove={() => onDetailsChange({ ...details, early: false, earlyDate: "" })}
          >
            <input
              className={`${inputCls} mt-3`}
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
            label="Event date"
            value={formatKey(key)}
            onRemove={() => onRemoveEventDate(key)}
          />
        ))}
        {sessions.start && (
          <SelectionRow
            dot="bg-tnc-pink"
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
            dot="bg-tnc-teal"
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
          className="text-xs font-medium tracking-wide text-tnc-pink transition-colors hover:text-tnc-burgundy"
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
              className="mt-3 overflow-hidden whitespace-pre-wrap rounded-xl border border-tnc-beige bg-white/70 p-4 font-sans text-xs leading-relaxed text-tnc-teal/85 select-all"
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
          className="rounded-full bg-gradient-to-r from-tnc-pink to-tnc-burgundy px-6 py-3 text-sm font-semibold tracking-wide text-tnc-ivory shadow-[0_8px_30px_rgba(173,36,81,0.25)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {ready ? "Copy message & open Instagram DM" : "Pick a date to continue"}
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={!ready}
            onClick={copyOnly}
            className="flex-1 rounded-full border border-tnc-teal/25 px-4 py-2.5 text-xs font-semibold tracking-wide text-tnc-teal transition-colors hover:bg-tnc-teal/5 disabled:opacity-40"
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
              className={`flex-1 rounded-full border border-emerald-700/30 px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-emerald-800 transition-colors hover:bg-emerald-700/10 ${
                ready ? "" : "pointer-events-none opacity-40"
              }`}
            >
              Send on WhatsApp
            </a>
          )}
        </div>

        <div className="min-h-[2.5rem] text-center text-xs leading-relaxed" aria-live="polite">
          {status === "copied" && (
            <span className="text-emerald-800">
              Message copied. In the Instagram chat, long-press the message box, tap{" "}
              <strong>Paste</strong> and send.
            </span>
          )}
          {status === "failed" && (
            <span className="text-tnc-burgundy">
              Couldn&apos;t copy automatically. Select the message above and copy it.
            </span>
          )}
          {status === null && ready && (
            <span className="text-tnc-teal/55">
              Instagram doesn&apos;t let websites fill in DMs, so we copy your message
              for you. Just paste it in the chat.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
