import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export default function VideoCard({ src, poster, index }) {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { amount: 0.6 });
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isInView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isInView]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02 }}
      className="group relative aspect-[9/16] overflow-hidden rounded-2xl border border-tnc-gold/25 bg-tnc-teal-deep"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-tnc-teal-deep/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-tnc-teal/70 text-tnc-ivory opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
        aria-label={muted ? "Unmute video" : "Mute video"}
      >
        {muted ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
            <line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" strokeWidth="2" />
            <line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" strokeWidth="2" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
            <path
              d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </motion.div>
  );
}
