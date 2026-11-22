import { motion } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1];

const buttonContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.6,
    },
  },
};

const buttonItem = {
  hidden: { opacity: 0, scale: 0.6, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", bounce: 0.4, duration: 0.7 },
  },
};

const gradientText = {
  backgroundImage:
    "linear-gradient(100deg, #ffd3ea 0%, #ff8fc7 30%, #f6c453 60%, #ffd3ea 100%)",
  backgroundSize: "200% auto",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08060a] px-6 py-28 text-center font-sans">
      {/* ambient gradient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 15%, rgba(236,72,153,0.32), transparent 45%), radial-gradient(circle at 85% 20%, rgba(246,196,83,0.22), transparent 45%), radial-gradient(circle at 50% 100%, rgba(236,72,153,0.18), transparent 55%)",
        }}
      />

      {/* drifting ambient orbs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[10%] top-[20%] h-72 w-72 rounded-full bg-pink-500/20 blur-[110px]"
        animate={{ y: [0, 24, 0], x: [0, 12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[12%] top-[32%] h-80 w-80 rounded-full bg-amber-400/15 blur-[120px]"
        animate={{ y: [0, -20, 0], x: [0, -14, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* fine grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-pink-300/25 bg-white/[0.04] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.25em] text-pink-200/80 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-pink-400 to-amber-300" />
          Worldwide · Wedding Choreography
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, scale: 0.82, y: 16, filter: "blur(10px)" }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            opacity: { type: "spring", bounce: 0.4, duration: 1 },
            scale: { type: "spring", bounce: 0.4, duration: 1 },
            y: { type: "spring", bounce: 0.4, duration: 1 },
            filter: { duration: 0.8, ease: easeOut },
            backgroundPosition: {
              duration: 7,
              repeat: Infinity,
              ease: "linear",
              delay: 1,
            },
          }}
          style={gradientText}
          className="font-display text-4xl italic leading-[1.15] tracking-tight sm:text-5xl md:text-[3.75rem]"
        >
          Bengaluru&apos;s go-to for wedding choreo that actually slaps.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.4, duration: 0.8, ease: easeOut }}
          className="mt-7 max-w-xl text-base font-light leading-relaxed tracking-wide text-gray-300/85 sm:text-lg"
        >
          Sangeets, baraats, first dances, guest performances — we make sure
          your big day trends on the group chat before it even trends on
          Instagram.
        </motion.p>

        <motion.div
          variants={buttonContainer}
          initial="hidden"
          animate="show"
          className="mt-11 flex flex-col gap-4 sm:flex-row"
        >
          <motion.button
            variants={buttonItem}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() =>
              document
                .getElementById("availability")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-pink-500 to-amber-400 px-8 py-3.5 text-sm font-semibold tracking-wide text-black shadow-[0_8px_30px_rgba(236,72,153,0.35)]"
          >
            <span className="relative z-10">Book Your Choreo</span>
            <motion.span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-white/30"
              style={{ skewX: -20 }}
              initial={false}
              whileHover={{ translateX: "150%" }}
              transition={{ duration: 0.6, ease: easeOut }}
            />
          </motion.button>

          <motion.button
            variants={buttonItem}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() =>
              document
                .getElementById("moves")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="group flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-semibold tracking-wide text-pink-50 backdrop-blur-md transition-colors hover:bg-white/10"
          >
            See The Moves
            <motion.span
              aria-hidden
              className="inline-block"
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>

        <motion.a
          href="https://www.instagram.com/the_naach_company/"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="mt-16 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-pink-200/80 transition-colors hover:text-pink-100"
        >
          <svg
            aria-hidden
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4.2" />
            <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
          </svg>
          @the_naach_company
          <span className="text-gray-500">· 450 followers</span>
        </motion.a>
      </div>

      <motion.div
        aria-hidden
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-pink-200/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 1.4, duration: 0.6 },
          y: { delay: 1.4, duration: 1.8, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        ↓
      </motion.div>
    </section>
  );
}
