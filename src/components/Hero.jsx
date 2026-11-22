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
    "linear-gradient(100deg, #0E393A 0%, #81153B 30%, #AD2451 55%, #0E393A 100%)",
  backgroundSize: "200% auto",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

// Fades the artwork's square edges into the page background.
const softEdges = {
  WebkitMaskImage: "radial-gradient(closest-side, #000 94%, transparent 100%)",
  maskImage: "radial-gradient(closest-side, #000 94%, transparent 100%)",
};

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#FDF5E2] px-6 pb-16 pt-28 font-sans lg:py-28">
      {/* warm ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 25% 45%, rgba(207,159,66,0.16), transparent 45%), radial-gradient(circle at 90% 85%, rgba(173,36,81,0.08), transparent 40%)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        {/* artwork */}
        <motion.img
          src="/hero-art.jpg"
          alt="The Naach Company — founders Vidhi and Piyush with illustrated wedding dancers"
          initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: easeOut }}
          style={softEdges}
          className="mx-auto aspect-square w-full max-w-[min(92vw,560px)] object-contain"
        />

        {/* copy */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.span
            initial={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.3, ease: easeOut }}
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-tnc-gold/50 bg-white/50 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.25em] text-tnc-burgundy"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-tnc-pink to-tnc-gold" />
            Worldwide · Wedding Choreography
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              opacity: { duration: 0.8, delay: 0.4, ease: easeOut },
              y: { duration: 0.8, delay: 0.4, ease: easeOut },
              filter: { duration: 0.8, delay: 0.4, ease: easeOut },
              backgroundPosition: {
                duration: 7,
                repeat: Infinity,
                ease: "linear",
                delay: 1.2,
              },
            }}
            style={gradientText}
            className="font-display text-4xl italic leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.4rem]"
          >
            Bengaluru&apos;s go-to for wedding choreo that actually slaps.
          </motion.h1>

          <motion.div
            variants={buttonContainer}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-col gap-4 sm:flex-row"
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
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-tnc-pink to-tnc-burgundy px-8 py-3.5 text-sm font-semibold tracking-wide text-tnc-ivory shadow-[0_8px_30px_rgba(173,36,81,0.3)]"
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
              className="group flex items-center justify-center gap-2 rounded-full border border-tnc-teal/25 bg-white/50 px-8 py-3.5 text-sm font-semibold tracking-wide text-tnc-teal transition-colors hover:bg-white/80"
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
            className="mt-10 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-tnc-pink transition-colors hover:text-tnc-burgundy"
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
            <span className="text-tnc-teal/50">· 450 followers</span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
