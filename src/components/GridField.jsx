import { useEffect, useRef } from 'react';

// A field of map "segments" rendered on canvas: a soft isometric-feeling
// grid where most cells idle as unclaimed territory, a scatter of cells
// pulse cyan/violet (available to mint), and one cell glows gold (owned —
// stands in for the Chennai plot). This is the single background motion
// moment for the page.
export default function GridField({ dense = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let width, height, cols, rows, cell;
    let cells = [];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cell = dense ? 46 : 58;
      cols = Math.ceil(width / cell) + 1;
      rows = Math.ceil(height / cell) + 1;

      cells = [];
      const goldIndex = Math.floor(Math.random() * cols * rows);
      let i = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const isGold = i === goldIndex;
          const isActive = !isGold && Math.random() < 0.045;
          cells.push({
            x: c * cell,
            y: r * cell,
            state: isGold ? 'gold' : isActive ? 'active' : 'idle',
            phase: Math.random() * Math.PI * 2,
            speed: 0.6 + Math.random() * 0.6,
          });
          i++;
        }
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, width, height);

      // base grid lines
      ctx.strokeStyle = 'rgba(120, 135, 180, 0.08)';
      ctx.lineWidth = 1;
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cell, 0);
        ctx.lineTo(c * cell, height);
        ctx.stroke();
      }
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * cell);
        ctx.lineTo(width, r * cell);
        ctx.stroke();
      }

      const time = reduceMotion ? 0 : t / 1000;

      for (const cell_ of cells) {
        if (cell_.state === 'idle') continue;

        const pulse = 0.5 + 0.5 * Math.sin(time * cell_.speed + cell_.phase);
        const pad = 6;
        const size = cell - pad * 2;

        let color, glow;
        if (cell_.state === 'gold') {
          color = `rgba(245, 185, 66, ${0.28 + pulse * 0.25})`;
          glow = 'rgba(245, 185, 66, 0.5)';
        } else {
          const isViolet = (cell_.phase | 0) % 2 === 0;
          color = isViolet
            ? `rgba(123, 92, 255, ${0.12 + pulse * 0.16})`
            : `rgba(0, 230, 195, ${0.12 + pulse * 0.16})`;
          glow = isViolet ? 'rgba(123, 92, 255, 0.35)' : 'rgba(0, 230, 195, 0.35)';
        }

        ctx.fillStyle = color;
        ctx.strokeStyle = glow;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const x = cell_.x + pad, y = cell_.y + pad, r = 3;
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + size, y, x + size, y + size, r);
        ctx.arcTo(x + size, y + size, x, y + size, r);
        ctx.arcTo(x, y + size, x, y, r);
        ctx.arcTo(x, y, x + size, y, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    }

    layout();
    draw(0);

    const onResize = () => layout();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [dense]);

  return <canvas ref={canvasRef} className="grid-field-canvas" aria-hidden="true" />;
}
