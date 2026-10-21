import { useEffect, useId, useRef } from "react";

// Decorative only: bounded geometry, no WebGL context and no React frame updates.
export default function WaveMesh({ className = "", compact = false }) {
  const canvasRef = useRef(null);
  const patternId = useId().replaceAll(":", "");
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator.connection;
    const lowPower = connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || navigator.deviceMemory <= 4;
    const reduced = () => media.matches || document.documentElement.dataset.motion === "reduce";
    let visible = false, frame = 0, previous = 0, phase = 0, width = 0, height = 0;
    const draw = () => {
      context.clearRect(0, 0, width, height);
      const rows = compact ? 12 : 23, columns = compact ? 36 : 55;
      const point = (row, column) => {
        const x = column / columns;
        const depth = row / rows;
        const wave = Math.sin(x * 12 + phase + depth * 3) * Math.cos(x * 5 - phase * .55) * (height * .13);
        return [x * width, height * .34 + depth * height * .53 + wave * (.3 + depth)];
      };
      context.lineWidth = .75;
      for (let row = 0; row <= rows; row++) {
        context.beginPath();
        const waveColor = getComputedStyle(document.documentElement).getPropertyValue("--wave-rgb").trim() || "129,192,255";
        context.strokeStyle = `rgba(${waveColor},${.09 + row / rows * .23})`;
        for (let column = 0; column <= columns; column++) {
          const [x,y] = point(row,column);
          if (column === 0) context.moveTo(x,y); else context.lineTo(x,y);
        }
        context.stroke();
      }
      const waveColor = getComputedStyle(document.documentElement).getPropertyValue("--wave-rgb").trim() || "129,192,255";
      context.strokeStyle = `rgba(${waveColor},.18)`;
      for (let column = 0; column <= columns; column++) {
        context.beginPath();
        for (let row = 0; row <= rows; row++) {
          const [x,y] = point(row,column);
          if (row === 0) context.moveTo(x,y); else context.lineTo(x,y);
        }
        context.stroke();
      }
    };
    const tick = time => {
      if (!visible || document.hidden || reduced() || lowPower) { frame = 0; return; }
      if (time - previous >= (matchMedia("(max-width:767px)").matches ? 33 : 16)) { phase += .008; draw(); previous = time; }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame); frame = 0;
      draw();
      if (visible && !document.hidden && !reduced() && !lowPower) frame = requestAnimationFrame(tick);
    };
    const resize = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      width = rect.width; height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0); sync();
    });
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    resize.observe(canvas); intersection.observe(canvas);
    document.addEventListener("visibilitychange", sync); media.addEventListener("change", sync);
    window.addEventListener("campus-preferences", sync);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect(); document.removeEventListener("visibilitychange", sync); media.removeEventListener("change", sync); window.removeEventListener("campus-preferences", sync); };
  }, [compact]);
  return <div aria-hidden="true" className={`wave-mesh ${className}`}>
    <svg className="wave-fallback" viewBox="0 0 900 300" preserveAspectRatio="none"><defs><pattern id={patternId} width="28" height="20" patternUnits="userSpaceOnUse" patternTransform="skewY(-7)"><path d="M28 0H0V20" fill="none" stroke="currentColor" strokeWidth=".6"/></pattern></defs><rect width="900" height="300" fill={`url(#${patternId})`}/></svg>
    <canvas ref={canvasRef} />
  </div>;
}
