// Builds the enquiry message a customer sends to TNC, and helpers to send it.
//
// Instagram has no way to pre-fill DM text from a link, so the site copies the
// message to the clipboard and opens the DM thread; the customer pastes it.
// WhatsApp does support pre-filled text, so that button is fully automatic.

export const INSTAGRAM_HANDLE = "the_naach_company";
// Instagram's own DM route. (ig.me/m/... just redirects here, and the ig.me
// domain times out on some networks, so link to the destination directly.)
export const INSTAGRAM_DM_URL = `https://www.instagram.com/m/${INSTAGRAM_HANDLE}/`;

const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
/** null when no WhatsApp number is configured. */
export const whatsappUrl = WHATSAPP_NUMBER
  ? (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
  : null;

export const OCCASIONS = [
  "Sangeet",
  "Haldi",
  "Mehendi",
  "Wedding",
  "Reception",
  "Engagement",
  "Cocktail",
  "Other",
];

export const PERFORMANCES = [
  "Couple dance",
  "Bride / groom solo",
  "Family performances",
  "Friends group",
  "Surprise / flash mob",
];

export const TIME_PREFS = ["Any time", "Morning", "Afternoon", "Evening"];

const shortFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "YYYY-MM-DD" -> Date at noon UTC (safe to format with timeZone UTC). */
export function keyToDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function formatKey(key) {
  return shortFormat.format(keyToDate(key));
}

/** Inclusive number of days from key a to key b. */
export function daysInclusive(a, b) {
  return Math.round((keyToDate(b) - keyToDate(a)) / 86400000) + 1;
}

export function hasAnyDate({ eventDates, sessions, consult }) {
  return eventDates.length > 0 || Boolean(sessions.start) || Boolean(consult.date);
}

export function buildMessage({ details, eventDates, sessions, consult }) {
  const lines = ["Hi TNC! I'd love to book choreography with you.", ""];

  const info = [];
  if (details.name.trim()) info.push(`Name: ${details.name.trim()}`);
  if (details.contact.trim()) info.push(`Contact: ${details.contact.trim()}`);
  if (details.occasions.length) {
    info.push(
      `Occasion${details.occasions.length > 1 ? "s" : ""}: ${details.occasions.join(", ")}`
    );
  }
  if (details.location.trim()) info.push(`Location: ${details.location.trim()}`);
  if (details.performances.length) {
    info.push(`Looking for: ${details.performances.join(", ")}`);
  }
  if (info.length) lines.push(...info, "");

  lines.push(...dateLines({ eventDates, sessions, consult }));

  if (details.notes.trim()) lines.push("", `Notes: ${details.notes.trim()}`);
  lines.push("", "(Sent from the TNC website)");
  return lines.join("\n");
}

function dateLines({ eventDates, sessions, consult }) {
  const lines = [];
  if (eventDates.length === 1) {
    lines.push(`Event date: ${formatKey(eventDates[0])}`);
  } else if (eventDates.length > 1) {
    lines.push("Event dates:", ...eventDates.map((k) => `• ${formatKey(k)}`));
  }
  if (sessions.start) {
    lines.push(
      sessions.end
        ? `Choreo sessions: ${formatKey(sessions.start)} to ${formatKey(sessions.end)} (${daysInclusive(sessions.start, sessions.end)} days)`
        : `Choreo sessions: starting ${formatKey(sessions.start)}`
    );
  }
  if (consult.date) {
    const time =
      consult.time && consult.time !== "Any time" ? `, ${consult.time.toLowerCase()}` : "";
    lines.push(`Consultation call: ${formatKey(consult.date)}${time}`);
  }
  return lines;
}

// --- Team notification (Google Apps Script → Sheet row + email) ---

const ENQUIRY_URL = import.meta.env.VITE_ENQUIRY_URL;

/** Flat fields for one Sheet row / email. */
export function enquiryPayload({ details, eventDates, sessions, consult, message }, channel) {
  const consultTime =
    consult.time && consult.time !== "Any time" ? ` (${consult.time.toLowerCase()})` : "";
  let sessionText = "";
  if (sessions.start) {
    sessionText = sessions.end
      ? `${formatKey(sessions.start)} to ${formatKey(sessions.end)}`
      : `from ${formatKey(sessions.start)}`;
  }
  return {
    channel,
    name: details.name.trim(),
    contact: details.contact.trim(),
    occasion: details.occasions.join(", "),
    location: details.location.trim(),
    lookingFor: details.performances.join(", "),
    eventDates: eventDates.map(formatKey).join("; "),
    sessions: sessionText,
    consultation: consult.date ? formatKey(consult.date) + consultTime : "",
    notes: details.notes.trim(),
    message,
    website: "", // honeypot: bots that fill every field get ignored
  };
}

/**
 * Sends the enquiry to TNC's Apps Script so the team gets an email and a Sheet
 * row, even if the customer never sends the DM. Fire-and-forget; silently does
 * nothing when VITE_ENQUIRY_URL isn't set.
 */
export function notifyTeam(payload) {
  if (!ENQUIRY_URL) return;
  // text/plain avoids a CORS preflight, which Apps Script can't answer.
  const body = JSON.stringify(payload);
  try {
    // sendBeacon survives the page being backgrounded when Instagram opens.
    const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
    if (navigator.sendBeacon?.(ENQUIRY_URL, blob)) return;
  } catch {
    // fall through to fetch
  }
  fetch(ENQUIRY_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body,
    keepalive: true,
  }).catch(() => {});
}

/**
 * Copies text to the clipboard. Call it directly inside a click handler
 * (before any await) so browsers treat it as user-initiated.
 */
export function copyText(text) {
  const fallback = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  };
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true, fallback);
  }
  return Promise.resolve(fallback());
}
