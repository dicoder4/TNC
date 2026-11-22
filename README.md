# TNC

Website for The Naach Company. Vite + React + Tailwind + framer-motion.

```
npm install
npm run dev
```

## Availability calendar (Google Calendar)

The "Find your date" section reads booked days from one Google Calendar.
Visitors only see which days are booked — never event titles, clients or notes.

### One-time setup

1. **Share the calendar as free/busy only.** Google Calendar → the calendar's
   *Settings and sharing* → *Access permissions for events* → tick
   *Make available to public* and choose **See only free/busy (hide details)**.
   This is what keeps event details private, so don't pick "See all event details".
2. **Copy the Calendar ID.** Same settings page → *Integrate calendar* →
   *Calendar ID*.
3. **Create an API key.** In [Google Cloud Console](https://console.cloud.google.com/):
   create a project → *APIs & Services* → enable **Google Calendar API** →
   *Credentials* → *Create credentials* → *API key*. Then edit the key:
   - *Application restrictions*: **Websites**, add your domain
     (e.g. `https://yourdomain.com/*`) and `http://127.0.0.1:5173/*` for local dev.
   - *API restrictions*: restrict to **Google Calendar API**.
4. Copy `.env.example` to `.env` and fill in the key, calendar ID and the
   calendar's timezone. Set the same variables in your hosting provider.

Without these, `npm run dev` shows sample dates and a production build hides
the section.

### Marking a date as booked

Add an event on that date. **All-day events default to "Free" in Google
Calendar** — set *Show as* → **Busy**, otherwise the date stays open on the site.
Timed events are Busy by default. Any busy event on a day marks the whole day booked.
