import { motion } from "framer-motion";

const links = [
  { label: "Updates", href: "#updates" },
  { label: "The Moves", href: "#moves" },
  { label: "About", href: "#about" },
  { label: "Availability", href: "#availability" },
];

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 z-50 w-full border-b border-tnc-teal/10 bg-tnc-ivory/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-3 font-display text-lg italic tracking-tight text-tnc-teal"
        >
          <img
            src="/tnc-logo.jpg"
            alt=""
            className="h-10 w-10 rounded-full object-cover ring-1 ring-tnc-gold/50"
          />
          The Naach Company
        </a>

        <nav className="hidden items-center gap-8 sm:flex">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href.slice(1))}
              className="text-sm font-medium tracking-wide text-tnc-teal/75 transition-colors hover:text-tnc-pink"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <a
          href="https://www.instagram.com/the_naach_company/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-tnc-teal/20 text-tnc-teal transition-colors hover:border-tnc-pink/50 hover:text-tnc-pink"
          aria-label="The Naach Company on Instagram"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4.2" />
            <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
      </div>
    </motion.header>
  );
}
