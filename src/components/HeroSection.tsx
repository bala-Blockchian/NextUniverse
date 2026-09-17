import { useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { MapPin, Compass, ArrowRight } from 'lucide-react';
import GridPulseBackground from './GridPulseBackground.tsx';

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const HEADLINE = 'Where Real-World Coordinates Meet On-Chain Reality.';

// Words in this set get the cyan → blue gradient treatment. Everything else
// renders in plain white so the gradient reads as emphasis, not decoration.
const GRADIENT_WORDS = new Set(['On-Chain', 'Reality.']);

interface ParcelPin {
  id: string;
  label: string;
  coords: string;
  status: 'MINTED' | 'AVAILABLE';
  // Position expressed as CSS inset percentages so pins scale with viewport.
  position: { top?: string; bottom?: string; left?: string; right?: string };
  dropDelay: number;
}

// Deliberately spread across different parts of the world — the map isn't
// tied to any single city, it's a global coordinate grid.
const PINS: ParcelPin[] = [
  {
    id: 'p1',
    label: 'PARCEL #8042',
    coords: '40.7128° N, 74.0060° W',
    status: 'MINTED',
    position: { top: '14%', left: '6%' },
    dropDelay: 0.9,
  },
  {
    id: 'p2',
    label: 'PARCEL #3311',
    coords: '51.5072° N, 0.1276° W',
    status: 'AVAILABLE',
    position: { top: '10%', right: '8%' },
    dropDelay: 1.05,
  },
  {
    id: 'p3',
    label: 'PARCEL #5567',
    coords: '35.6762° N, 139.6503° E',
    status: 'MINTED',
    position: { bottom: '16%', right: '10%' },
    dropDelay: 1.2,
  },
  {
    id: 'p4',
    label: 'PARCEL #9120',
    coords: '1.3521° N, 103.8198° E',
    status: 'AVAILABLE',
    position: { bottom: '20%', left: '9%' },
    dropDelay: 1.35,
  },
];

// ---------------------------------------------------------------------------
// Motion variants
// ---------------------------------------------------------------------------

// Parent container: staggers each direct child's reveal by 0.15s so the
// badge, heading, subtitle, and buttons cascade in rather than popping in at once.
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

// Standard "rise and fade" used for the badge, subtitle, and button row.
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// Word-level reveal for the headline. A tighter stagger than the container
// so the whole sentence assembles quickly, word by word.
const wordContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Pins drop in from above, arriving just as the text sequence finishes.
const pinVariants: Variants = {
  hidden: { opacity: 0, y: -50 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut', delay },
  }),
};

// Radar ripple: an expanding, fading ring that loops forever behind each pin.
const rippleVariants: Variants = {
  animate: {
    scale: [1, 2.5],
    opacity: [0.6, 0],
    transition: { duration: 2.2, repeat: Infinity, ease: 'easeOut' },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HeroSection() {
  const words = useMemo(() => HEADLINE.split(' '), []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-950 flex flex-col justify-center border-b border-white/10">
      {/* Ambient, interactive coordinate-grid background */}
      <div className="absolute inset-0">
        <GridPulseBackground />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_38%,rgba(2,6,23,0.15),rgba(2,6,23,0.95)_72%)] pointer-events-none" />

      {/* Holographic parcel pins — hidden on small screens to avoid clutter */}
      {/* <div className="hidden md:block">
        {PINS.map((pin) => (
          <ParcelMarker key={pin.id} pin={pin} />
        ))}
      </div> */}

      {/* Text + CTA sequence */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-3xl px-6 text-center pt-24"
      >
        {/* Hero tag: glassmorphism pill badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-white/5 px-4 py-1.5 text-sm text-cyan-300 backdrop-blur-md"
        >
          <Compass className="h-3.5 w-3.5" aria-hidden="true" />
          Coordinates Locked • Mintable Plots
        </motion.div>

        {/* Headline: word-by-word stagger reveal, gradient on the closing phrase */}
        <motion.h1
          variants={wordContainerVariants}
          className="mt-7 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              variants={wordVariants}
              className={
                GRADIENT_WORDS.has(word)
                  ? 'mr-3 inline-block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent'
                  : 'mr-3 inline-block'
              }
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mx-auto mt-6 max-w-xl text-base text-slate-400 sm:text-lg"
        >
          Every plot on the grid is a real segment of the map, minted once and owned
          by one wallet, forever.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button className="group relative inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-7 py-3.5 font-semibold text-slate-950 shadow-[0_0_0_0_rgba(34,211,238,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_35px_-8px_rgba(34,211,238,0.65)]">
            Explore Map
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-7 py-3.5 font-semibold text-white transition-colors duration-200 hover:border-cyan-400/60 hover:bg-cyan-400/5">
            Mint Plots
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Holographic marker card
// ---------------------------------------------------------------------------

// function ParcelMarker({ pin }: { pin: ParcelPin }) {
//   return (
//     <motion.div
//       custom={pin.dropDelay}
//       variants={pinVariants}
//       initial="hidden"
//       animate="visible"
//       whileHover={{ scale: 1.05 }}
//       className="absolute z-10 hidden lg:block"
//       style={pin.position}
//     >
//       <div className="group relative">
//         {/* Radar ripple, sits behind the card and loops indefinitely */}
//         <motion.span
//           variants={rippleVariants}
//           animate="animate"
//           className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/60"
//           aria-hidden="true"
//         />

//         <div className="relative flex items-center gap-2.5 rounded-xl border border-cyan-400/25 bg-slate-900/60 px-4 py-3 backdrop-blur-lg transition-all duration-200 group-hover:border-cyan-300/70 group-hover:shadow-[0_0_24px_-4px_rgba(34,211,238,0.55)]">
//           <MapPin className="h-4 w-4 flex-shrink-0 text-cyan-300" aria-hidden="true" />
//           <div className="leading-tight">
//             <p className="text-xs font-semibold tracking-wide text-cyan-200">
//               {pin.label} <span className="text-slate-500">•</span> {pin.coords}
//             </p>
//             <p
//               className={`mt-0.5 text-[0.68rem] font-medium tracking-wider ${
//                 pin.status === 'MINTED' ? 'text-amber-400' : 'text-emerald-400'
//               }`}
//             >
//               STATUS: {pin.status}
//             </p>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }
