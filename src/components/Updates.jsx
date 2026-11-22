import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1];

const updates = [
  {
    tag: "Sold Out",
    title: "Officially sold out till March 2027",
    description:
      "Thank you for such an overwhelming response. Planning something for later in 2027? Check the calendar below and get in early.",
    media: { type: "video", src: "/videos/sold-out-march-2027.mp4" },
  },
  {
    tag: "Season 2",
    title: "Opening ceremony at the Small Bash Pickleball League",
    description:
      "Season 1 was just the warm-up. Team TNC came back to open Season 2 of the Small Bash Pickleball League at Depot 18.",
    media: {
      type: "image",
      src: "/videos/pickleball-season-2.jpg",
      alt: "Small Bash Pickleball League Season 2 poster: opening ceremony by Team TNC, 15 November 2026, Depot 18",
    },
  },
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

function UpdateMedia({ media }) {
  const videoRef = useRef(null);
  const isInView = useInView(videoRef, { amount: 0.6 });
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isInView) video.play().catch(() => {});
    else video.pause();
  }, [isInView]);

  const frame =
    "relative w-48 shrink-0 self-center overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:w-36";

  if (media.type === "image") {
    return (
      <a href={media.src} target="_blank" rel="noopener noreferrer" className={frame}>
        <img src={media.src} alt={media.alt} loading="lazy" className="h-full w-full object-cover" />
      </a>
    );
  }

  return (
    <div className={`${frame} aspect-[9/16]`}>
      <video
        ref={videoRef}
        src={media.src}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
        aria-label={muted ? "Unmute video" : "Mute video"}
      >
        {muted ? "Sound on" : "Mute"}
      </button>
    </div>
  );
}

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
              {update.media && <UpdateMedia media={update.media} />}
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
