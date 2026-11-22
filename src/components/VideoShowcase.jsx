import { motion } from "framer-motion";
import VideoCard from "./VideoCard";

const videos = [
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
    <section id="moves" className="relative bg-[#08060a] px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(236,72,153,0.15), transparent 50%)",
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
          <span className="mb-4 inline-block text-[11px] font-medium uppercase tracking-[0.25em] text-pink-200/70">
            The Moves
          </span>
          <h2 className="font-display text-3xl italic leading-tight text-white sm:text-4xl">
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
            className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-pink-200/80 transition-colors hover:text-pink-100"
          >
            More on Instagram
            <span aria-hidden>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
