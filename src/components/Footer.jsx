import { motion } from "framer-motion";
import { INSTAGRAM_PROFILE_URL } from "../lib/enquiry";

const CONTACTS = [
  { name: "Vidhi", display: "+91 70228 36728", tel: "+917022836728" },
  { name: "Piyush", display: "+91 97437 52210", tel: "+919743752210" },
];

function PhoneIcon() {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative border-t border-tnc-gold/30 bg-tnc-teal px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <img
          src="/tnc-logo.jpg"
          alt="The Naach Company logo"
          className="h-28 w-28 rounded-full object-cover shadow-[0_0_40px_rgba(207,159,66,0.25)] ring-1 ring-tnc-gold/50"
        />

        <div className="font-display text-xl italic text-tnc-ivory">The Naach Company</div>

        <p className="text-xs uppercase tracking-[0.2em] text-tnc-gold-soft">
          Worldwide · Weddings · Sangeets · Special Events
        </p>

        {/* contact us */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 flex w-full max-w-md flex-col items-center gap-4 border-t border-tnc-gold/20 pt-8"
        >
          <h2 className="font-display text-lg italic text-tnc-ivory">Contact us</h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
            {CONTACTS.map((c) => (
              <a
                key={c.tel}
                href={`tel:${c.tel}`}
                className="group flex items-center justify-center gap-2.5 text-sm text-tnc-beige transition-colors hover:text-tnc-gold"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-tnc-gold/30 text-tnc-gold-soft transition-colors group-hover:border-tnc-gold">
                  <PhoneIcon />
                </span>
                <span>
                  <span className="text-tnc-ivory">{c.name}</span>{" "}
                  <span className="tabular-nums">{c.display}</span>
                </span>
              </a>
            ))}
          </div>

          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="The Naach Company on Instagram"
            className="group flex items-center gap-2 text-xs text-tnc-beige/80 transition-colors hover:text-tnc-gold"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-tnc-gold/30 text-tnc-gold-soft transition-colors group-hover:border-tnc-gold">
              <InstagramIcon />
            </span>
            @the_naach_company · 450+ followers
          </a>
        </motion.div>

        <p className="mt-4 text-[11px] text-tnc-beige/50">
          © {new Date().getFullYear()} The Naach Company
        </p>
      </div>
    </footer>
  );
}
