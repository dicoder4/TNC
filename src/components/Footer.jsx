import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#08060a] px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <motion.a
          href="https://www.instagram.com/the_naach_company/"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-full bg-gradient-to-r from-pink-500 to-amber-400 px-7 py-3 text-sm font-semibold tracking-wide text-black"
        >
          DM us on Instagram to book
        </motion.a>

        <img
          src="/tnc-logo.jpg"
          alt="The Naach Company logo"
          className="h-28 w-28 rounded-full object-cover shadow-[0_0_40px_rgba(246,196,83,0.15)] ring-1 ring-amber-200/30"
        />

        <div className="font-display text-xl italic text-white">
          The Naach Company
        </div>

        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          Worldwide · Weddings · Sangeets · Special Events
        </p>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <a
            href="https://www.instagram.com/the_naach_company/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-pink-200"
          >
            @the_naach_company
          </a>
          <span>· 450 followers</span>
        </div>

        <p className="mt-4 text-[11px] text-gray-600">
          © {new Date().getFullYear()} The Naach Company
        </p>
      </div>
    </footer>
  );
}
