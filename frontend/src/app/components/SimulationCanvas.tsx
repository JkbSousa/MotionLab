import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface SimulationCanvasProps {
  velocity: number;
  angle: number;
  gravity: number;
  isSimulating: boolean;
  onComplete: () => void;
}

const K = 0.01; // mesmo coeficiente de arrasto da API Java

export function SimulationCanvas({ velocity, angle, gravity, isSimulating, onComplete }: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!isSimulating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const angleRad = (angle * Math.PI) / 180;
    let vx = velocity * Math.cos(angleRad);
    let vy = velocity * Math.sin(angleRad);

    const startX = 50;
    const startY = canvas.height - 50;
    const scale = 2;

    const trajectory: { x: number; y: number }[] = [];
    let x = 0, y = 0;

    const animate = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Eixos
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, startY); ctx.lineTo(canvas.width, startY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(startX, 0); ctx.lineTo(startX, canvas.height); ctx.stroke();

      const canvasX = startX + x * scale;
      const canvasY = startY - y * scale;

      if (y >= 0 && canvasX < canvas.width) {
        trajectory.push({ x: canvasX, y: canvasY });

        // Trajetória
        if (trajectory.length > 1) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#3b82f6';
          ctx.beginPath();
          ctx.moveTo(trajectory[0].x, trajectory[0].y);
          for (let i = 1; i < trajectory.length; i++) {
            ctx.lineTo(trajectory[i].x, trajectory[i].y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Projétil
        ctx.fillStyle = '#60a5fa';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#60a5fa';
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Atualiza posição com resistência do ar
        const dt = 0.016;
        const speed = Math.sqrt(vx * vx + vy * vy);
        const ax = -K * speed * vx;
        const ay = -gravity - K * speed * vy;
        vx += ax * dt;
        vy += ay * dt;
        x += vx * dt;
        y += vy * dt;

        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [velocity, angle, gravity, isSimulating, onComplete]);

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