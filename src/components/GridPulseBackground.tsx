import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type PlotStatus = 'AVAILABLE' | 'MINTED' | 'RESERVED';

interface Tile {
  id: number;
  status: PlotStatus;
  pulsing: boolean;
  delay: number;
}

// Visual language per status: the accent dot/label color, the hover ring,
// and the glow color used behind the continuous pulse.
const STATUS_STYLES: Record<
  PlotStatus,
  { dot: string; text: string; ring: string; glow: string }
> = {
  AVAILABLE: { dot: 'bg-cyan-400', text: 'text-cyan-300', ring: 'ring-cyan-400/50', glow: 'rgba(34,211,238,0.45)' },
  MINTED: { dot: 'bg-amber-400', text: 'text-amber-300', ring: 'ring-amber-400/50', glow: 'rgba(251,191,36,0.4)' },
  RESERVED: { dot: 'bg-violet-400', text: 'text-violet-300', ring: 'ring-violet-400/50', glow: 'rgba(167,139,250,0.4)' },
};

// Weighted so most of the map still reads as open territory.
function rollStatus(): PlotStatus {
  const r = Math.random();
  if (r < 0.08) return 'RESERVED';
  if (r < 0.22) return 'MINTED';
  return 'AVAILABLE';
}

const CELL_SIZE = 68; // px — target tile size used to size the grid to the container

export default function GridPulseBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ cols: 0, rows: 0 });
  const [hovered, setHovered] = useState<number | null>(null);

  // Size the grid to whatever it's placed inside, recomputing on resize.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const cols = Math.max(4, Math.ceil(el.clientWidth / CELL_SIZE));
      const rows = Math.max(3, Math.ceil(el.clientHeight / CELL_SIZE));
      setDims((prev) => (prev.cols === cols && prev.rows === rows ? prev : { cols, rows }));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Roll each tile's status once per grid size, not on every render.
  const tiles = useMemo<Tile[]>(() => {
    const total = dims.cols * dims.rows;
    return Array.from({ length: total }, (_, i) => ({
      id: i,
      status: rollStatus(),
      pulsing: Math.random() < 0.06, // a scattered ~6% of tiles glow continuously
      delay: Math.random() * 2.5,
    }));
  }, [dims.cols, dims.rows]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${dims.cols || 1}, 1fr)`,
          gridTemplateRows: `repeat(${dims.rows || 1}, 1fr)`,
        }}
      >
        {tiles.map((tile) => {
          const style = STATUS_STYLES[tile.status];
          const isHovered = hovered === tile.id;
          return (
            <div
              key={tile.id}
              onMouseEnter={() => setHovered(tile.id)}
              onMouseLeave={() => setHovered((h) => (h === tile.id ? null : h))}
              className="relative flex items-center justify-center border border-white/[0.04]"
            >
              {/* Continuous pulse for a scattered subset — reads as "the grid is alive" */}
              {tile.pulsing && !isHovered && (
                <motion.span
                  className={`absolute h-2 w-2 rounded-full ${style.dot}`}
                  animate={{ opacity: [0.25, 0.9, 0.25], scale: [1, 1.7, 1] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: tile.delay }}
                  style={{ boxShadow: `0 0 10px 2px ${style.glow}` }}
                />
              )}

              {/* Hover reveal: tile highlight + its plot status */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className={`absolute inset-0 flex items-center justify-center bg-white/[0.03] ring-1 ${style.ring}`}
                >
                  <span className={`text-[0.55rem] font-semibold tracking-wider ${style.text}`}>
                    {tile.status}
                  </span>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
