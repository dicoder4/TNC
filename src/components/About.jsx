import { motion } from "framer-motion";

const founders = [
  { name: "Vidhi Sanghvi", handle: "_vidhi_sanghvi_" },
  { name: "Piyush Wadhwa", handle: "piyush._.wadhwa" },
];

const team = [
  { name: "Nihal", handle: "nihal_jain16" },
  { name: "Maan", handle: "maan_manish33" },
  { name: "Himani", handle: "himani_barlota" },
  { name: "Sara", handle: "sara.chughh" },
];

function PersonLink({ person }) {
  return (
    <a
      href={`https://www.instagram.com/${person.handle}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 text-sm text-tnc-teal transition-colors hover:text-tnc-burgundy"
    >
      <span className="font-medium tracking-wide">{person.name}</span>
      <span className="text-tnc-pink/80 transition-colors group-hover:text-tnc-pink">
        @{person.handle}
      </span>
    </a>
  );
}

const easeOut = [0.16, 1, 0.3, 1];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-tnc-ivory px-6 py-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgba(207,159,66,0.16), transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="mb-4 inline-block text-[11px] font-medium uppercase tracking-[0.25em] text-tnc-pink"
        >
          Who We Are
        </motion.span>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="font-display text-2xl italic leading-snug text-tnc-teal sm:text-3xl"
        >
          Weddings, sangeets &amp; special events — choreographed for couples and
          families around the world, in person or online.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
          className="mt-4 text-sm text-tnc-teal/70"
        >
          Wherever you are, we also run choreography sessions over video call.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
          className="mt-14"
        >
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-tnc-pink">
            Founders
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-10">
            {founders.map((person) => (
              <PersonLink key={person.handle} person={person} />
            ))}
          </div>

          <p className="mb-4 mt-12 text-[11px] font-medium uppercase tracking-[0.25em] text-tnc-pink">
            The Team
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-4">
            {team.map((person) => (
              <PersonLink key={person.handle} person={person} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
