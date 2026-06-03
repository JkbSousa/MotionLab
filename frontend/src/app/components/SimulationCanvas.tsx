import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface SimulationCanvasProps {
  velocity: number;
  angle: number;
  gravity: number;
  isSimulating: boolean;
  onComplete: () => void;
  dragCoefficient: number;
}

const MAX_ITERATIONS = 500_000;
const CANVAS_POINTS = 800; // pontos máximos na animação

export function SimulationCanvas({ velocity, angle, gravity, isSimulating, onComplete, dragCoefficient }: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!isSimulating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const angleRad = (angle * Math.PI) / 180;

    // 1. Pré-calcular trajetória completa com dt dinâmico
    // dt baseado na velocidade mas limitado pela gravidade — gravidade alta = passos menores
    const dtByVelocity = velocity / 1000;
    const dtByGravity = 1 / gravity;
    const dt = Math.min(Math.max(0.016, dtByVelocity), dtByGravity);
    let vx0 = velocity * Math.cos(angleRad);
    let vy0 = velocity * Math.sin(angleRad);
    let px = 0, py = 0;
    const fullPath: { x: number; y: number }[] = [];
    let iter = 0;

    while (iter < MAX_ITERATIONS) {
      fullPath.push({ x: px, y: py });
      const speed = Math.sqrt(vx0 * vx0 + vy0 * vy0);
      vx0 += (-dragCoefficient * speed * vx0) * dt;
      vy0 += (-gravity - dragCoefficient * speed * vy0) * dt;
      px += vx0 * dt;
      py += vy0 * dt;
      iter++;
      if (py < 0) break;
    }

    if (fullPath.length === 0) { onComplete(); return; }

    // 2. Subsamplear para animação fluida
    const step = Math.max(1, Math.floor(fullPath.length / CANVAS_POINTS));
    const path = fullPath.filter((_, i) => i % step === 0 || i === fullPath.length - 1);

    // 3. Calcular escala baseada no range real
    const maxX = Math.max(...path.map(p => p.x));
    const maxY = Math.max(...path.map(p => p.y), 1);

    const W = canvas.width;
    const H = canvas.height;
    const padX = 60, padY = 40;

    const scaleX = (W - padX * 2) / (maxX || 1);
    const scaleY = (H - padY * 2) / maxY;

    const toCanvas = (x: number, y: number) => ({
      cx: padX + x * scaleX,
      cy: H - padY - y * scaleY,
    });

    let frame = 0;

    const animate = () => {
      // Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      }
      for (let i = 0; i < H; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
      }

      // Eixos
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, H - padY); ctx.lineTo(W, H - padY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padX, 0); ctx.lineTo(padX, H); ctx.stroke();

      // Trajetória percorrida
      if (frame > 0) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#3b82f6';
        ctx.beginPath();
        const start = toCanvas(path[0].x, path[0].y);
        ctx.moveTo(start.cx, start.cy);
        for (let i = 1; i <= frame && i < path.length; i++) {
          const p = toCanvas(path[i].x, path[i].y);
          ctx.lineTo(p.cx, p.cy);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Projétil
      const cur = toCanvas(path[Math.min(frame, path.length - 1)].x, path[Math.min(frame, path.length - 1)].y);
      ctx.fillStyle = '#60a5fa';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#60a5fa';
      ctx.beginPath();
      ctx.arc(cur.cx, cur.cy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      frame++;
      if (frame < path.length) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [velocity, angle, gravity, isSimulating, onComplete, dragCoefficient]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative w-full h-full rounded-xl overflow-hidden"
      style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.1)' }}
    >
      <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
    </motion.div>
  );
}