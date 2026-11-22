import { motion } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1];

const updates = [
  {
    tag: "Going Global",
    title: "A new place, a new chapter",
    description:
      "The Naach Company is going global, choreographing weddings and events wherever you are. Same passion, bigger impact.",
  },
  {
    tag: "New Team",
    title: "The team is growing",
    description:
      "We've hired and built a new team, and we're still expanding.",
  },
];

export default function Updates() {
  return (
    <section id="updates" className="relative bg-[#0b0810] px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 50%, rgba(236,72,153,0.1), transparent 45%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="mb-3 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em] text-pink-200/70"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gradient-to-r from-pink-400 to-amber-300" />
          Latest Updates
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="mb-10 font-display text-2xl italic text-white sm:text-3xl"
        >
          What&apos;s new at TNC
        </motion.h2>

        <div className="flex flex-col gap-4">
          {updates.map((update, i) => (
            <motion.div
              key={update.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: easeOut }}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left backdrop-blur-sm sm:flex-row sm:items-center sm:gap-6"
            >
              <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-pink-300/25 bg-pink-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-pink-200">
                {update.tag}
              </span>
              <div>
                <h3 className="font-display text-lg italic text-white">
                  {update.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-400">
                  {update.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
