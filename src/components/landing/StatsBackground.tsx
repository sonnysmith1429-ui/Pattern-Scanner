import { useEffect, useRef } from 'react';

interface Bar {
  x: number;
  height: number;
  width: number;
  positive: boolean;
}

export default function StatsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let bars: Bar[] = [];
    let offset = 0;
    let last = performance.now();
    const spacing = 34;

    function buildBars() {
      const count = Math.ceil(width / spacing) + 4;
      bars = [];
      for (let i = 0; i < count; i++) {
        bars.push({
          x: i * spacing,
          height: height * (0.08 + Math.random() * 0.4),
          width: 14,
          positive: Math.random() > 0.35,
        });
      }
    }

    function resize() {
      if (!canvas) return;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      ctx!.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      buildBars();
    }

    function draw(now: number) {
      const dt = now - last;
      last = now;
      offset -= dt * 0.01;
      if (offset < -spacing) offset += spacing;

      ctx!.clearRect(0, 0, width, height);
      const baseline = height * 0.68;
      bars.forEach((b) => {
        const x = b.x + offset;
        if (x < -30 || x > width + 30) return;
        ctx!.fillStyle = b.positive ? 'rgba(52,211,153,0.22)' : 'rgba(96,165,250,0.2)';
        ctx!.fillRect(x - b.width / 2, baseline - b.height, b.width, b.height);
      });

      ctx!.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(0, baseline);
      ctx!.lineTo(width, baseline);
      ctx!.stroke();

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0f] via-transparent to-[#0b0b0f]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0f] via-transparent to-[#0b0b0f]" />
    </div>
  );
}
