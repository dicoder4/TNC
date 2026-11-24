import { motion } from "framer-motion";
import VideoCard from "./VideoCard";

const videos = [
  "beautiful-moments.mp4",
  "face-off-sangeet.mp4",
  "Video-32645.mp4",
  "Video-35093.mp4",
  "Video-38419.mp4",
  "Video-43093.mp4",
  "Video-72498.mp4",
  "Video-75219.mp4",
  "Video-75257.mp4",
  "Video-89831.mp4",
  "Video-92807.mp4",
  "Video-94639.mp4",
].map((file) => `/videos/${file}`);

export default function VideoShowcase() {
  return (
    <section id="moves" className="relative bg-tnc-teal px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(207,159,66,0.16), transparent 50%), radial-gradient(circle at 90% 90%, rgba(173,36,81,0.18), transparent 45%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <span className="mb-4 inline-block text-[11px] font-medium uppercase tracking-[0.25em] text-tnc-gold">
            The Moves
          </span>
          <h2 className="font-display text-3xl italic leading-tight text-tnc-ivory sm:text-4xl">
            See what we bring to the floor
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {videos.map((src, i) => (
            <VideoCard key={src} src={src} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-12 text-center"
        >
          <a
            href="https://www.instagram.com/the_naach_company/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-tnc-gold-soft transition-colors hover:text-tnc-ivory"
          >
            More on Instagram
            <span aria-hidden>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
