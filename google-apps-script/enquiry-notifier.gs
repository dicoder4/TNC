/**
 * TNC enquiry notifier — Google Apps Script web app.
 *
 * Receives enquiries from the website, logs each one as a row in this Google
 * Sheet, and emails it to TNC. Setup steps are in the project README
 * ("Enquiry emails").
 *
 * Paste this into: Google Sheet → Extensions → Apps Script.
 */

// Where enquiry emails go.
const NOTIFY_EMAIL = "thenaachcompany04@gmail.com";
const SHEET_NAME = "Enquiries";

const COLUMNS = [
  ["receivedAt", "Received"],
  ["name", "Name"],
  ["contact", "Contact"],
  ["occasion", "Occasion"],
  ["location", "Location"],
  ["lookingFor", "Looking for"],
  ["eventDates", "Event date(s)"],
  ["sessions", "Choreo sessions"],
  ["consultation", "Consultation call"],
  ["notes", "Notes"],
  ["channel", "Sent via"],
  ["message", "Full message"],
];

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // Ignore bots (honeypot filled) and empty submissions.
    if (data.website) return ok_();
    const message = clean_(data.message, 5000);
    if (!message) return ok_();

    const row = {};
    COLUMNS.forEach(([key]) => (row[key] = clean_(data[key], key === "message" ? 5000 : 500)));
    row.receivedAt = new Date();

    const sheet = getSheet_();
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      // Store customer text as plain text: stops "+91…" being read as a
      // formula (#ERROR!), blocks formula injection ("=IMPORTXML(…)"), and
      // stops Sheets rewriting dates.
      sheet.appendRow(
        COLUMNS.map(([key]) => (key === "receivedAt" ? row[key] : asText_(row[key])))
      );
    } finally {
      lock.releaseLock();
    }
    // Link straight to the Enquiries tab, not whichever tab opens first.
    const sheetUrl =
      SpreadsheetApp.getActiveSpreadsheet().getUrl() + "#gid=" + sheet.getSheetId();

    const who = row.name || "someone";
    const when = row.eventDates || row.sessions || row.consultation;
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `New TNC enquiry from ${who}${when ? " · " + when : ""}`,
      body:
        message +
        "\n\n— — —\n" +
        `Sent via: ${row.channel || "website"}\n` +
        `Contact: ${row.contact || "not given (check Instagram/WhatsApp)"}\n` +
        `All enquiries: ${sheetUrl}`,
    });
  } catch (err) {
    console.error(err);
  }
  return ok_();
}

// Lets you check the deployment URL in a browser.
function doGet() {
  return ContentService.createTextOutput("TNC enquiry endpoint is running.");
}

// Run this once from the editor to grant permissions and get a test email.
function testNotification() {
  doPost({
    postData: {
      contents: JSON.stringify({
        name: "Test Customer",
        contact: "+91 90000 00000",
        occasion: "Sangeet",
        eventDates: "Sun, 14 Mar 2027",
        channel: "Test",
        message: "Hi TNC! This is a test enquiry from the setup script.",
      }),
    },
  });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS.map(([, header]) => header));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
  }
  return sheet;
}

function clean_(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

// A leading apostrophe makes Sheets keep the value as literal text; the
// apostrophe itself isn't shown in the cell.
function asText_(value) {
  return value ? "'" + value : "";
}

function ok_() {
  return ContentService.createTextOutput("ok");
}
