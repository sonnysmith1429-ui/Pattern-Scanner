import { useEffect, useRef } from 'react';

interface Candle {
  x: number;
  open: number;
  close: number;
  high: number;
  low: number;
  width: number;
}

export default function CandlestickBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let candles: Candle[] = [];
    let offset = 0;
    let last = performance.now();

    function buildCandles() {
      const spacing = 46;
      const count = Math.ceil(width / spacing) + 4;
      candles = [];
      let price = height * 0.55;
      for (let i = 0; i < count; i++) {
        const open = price;
        const change = (Math.random() - 0.5) * height * 0.12;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * height * 0.04;
        const low = Math.min(open, close) - Math.random() * height * 0.04;
        candles.push({ x: i * spacing, open, close, high, low, width: 18 });
        price = close;
        if (price < height * 0.15 || price > height * 0.85) price = height * 0.5;
      }
    }

    function resize() {
      if (!canvas) return;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      ctx!.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      buildCandles();
    }

    function draw(now: number) {
      const dt = now - last;
      last = now;
      offset -= dt * 0.012;
      const spacing = 46;
      if (offset < -spacing) offset += spacing;

      ctx!.clearRect(0, 0, width, height);
      candles.forEach((c) => {
        const x = c.x + offset;
        if (x < -30 || x > width + 30) return;
        const isUp = c.close >= c.open;
        ctx!.strokeStyle = isUp ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.32)';
        ctx!.fillStyle = isUp ? 'rgba(16,185,129,0.28)' : 'rgba(239,68,68,0.25)';
        ctx!.lineWidth = 1.5;

        ctx!.beginPath();
        ctx!.moveTo(x, c.high);
        ctx!.lineTo(x, c.low);
        ctx!.stroke();

        const top = Math.min(c.open, c.close);
        const h = Math.max(2, Math.abs(c.open - c.close));
        ctx!.fillRect(x - c.width / 2, top, c.width, h);
      });

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
