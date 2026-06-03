import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface EscapeVelocityEasterEggProps {
  onComplete: () => void;
}

export function EscapeVelocityEasterEgg({ onComplete }: EscapeVelocityEasterEggProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [phase, setPhase] = useState<'launch' | 'space' | 'done'>('launch');
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const W = canvas.width;
    const H = canvas.height;

    // Stars
    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.5 + 0.1,
    }));

    // Clouds
    const clouds = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * W,
      y: H * 0.3 + i * 40,
      w: 120 + Math.random() * 160,
      h: 40 + Math.random() * 30,
      speed: 0.3 + Math.random() * 0.3,
      alpha: 0.6 + Math.random() * 0.3,
    }));

    // Rocket state
    let rocketY = H - 120;
    let rocketVY = 0;
    let rocketAccel = 0.1;
    let time = 0;
    let cameraOffsetY = 0;
    let atmosphereAlpha = 1;

    // Particles (exhaust)
    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[] = [];

    const spawnParticles = (rx: number, ry: number) => {
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: rx + (Math.random() - 0.5) * 12,
          y: ry + 40,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 2 + Math.random() * 3,
          life: 1,
          maxLife: 0.6 + Math.random() * 0.4,
          size: 4 + Math.random() * 6,
        });
      }
    };

    const drawSky = (alpha: number) => {
      // Day sky → space gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      const r1 = Math.round(15 + (10 - 15) * (1 - alpha));
      const g1 = Math.round(23 + (15 - 23) * (1 - alpha));
      const b1 = Math.round(42 + (30 - 42) * (1 - alpha));
      const r2 = Math.round(56 + (5 - 56) * (1 - alpha));
      const g2 = Math.round(130 + (5 - 130) * (1 - alpha));
      const b2 = Math.round(246 + (20 - 246) * (1 - alpha));
      skyGrad.addColorStop(0, `rgb(${r1},${g1},${b1})`);
      skyGrad.addColorStop(1, `rgb(${r2},${g2},${b2})`);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);
    };

    const drawStars = (alpha: number) => {
      stars.forEach(s => {
        ctx.save();
        ctx.globalAlpha = s.alpha * (1 - alpha);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x, (s.y + cameraOffsetY * 0.05) % H, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const drawGround = () => {
      const groundY = H - 80 + cameraOffsetY * 0.02;
      if (groundY > H) return;

      // Earth curve
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - cameraOffsetY / 400);
      const grad = ctx.createLinearGradient(0, groundY, 0, H);
      grad.addColorStop(0, '#166534');
      grad.addColorStop(0.3, '#15803d');
      grad.addColorStop(1, '#14532d');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(W / 2, groundY + 60, W * 0.6, 80, 0, 0, Math.PI * 2);
      ctx.fill();

      // Launch pad
      ctx.fillStyle = '#475569';
      ctx.fillRect(W / 2 - 30, groundY - 10, 60, 15);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(W / 2 - 6, groundY - 30, 12, 25);
      ctx.restore();
    };

    const drawClouds = (skyAlpha: number) => {
      clouds.forEach(c => {
        ctx.save();
        const cloudY = c.y - cameraOffsetY * 0.3;
        if (cloudY < -c.h || cloudY > H + c.h) { ctx.restore(); return; }
        ctx.globalAlpha = c.alpha * skyAlpha;
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.ellipse(c.x, cloudY, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(c.x - c.w * 0.2, cloudY + 8, c.w * 0.3, c.h * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(c.x + c.w * 0.2, cloudY + 5, c.w * 0.35, c.h * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const drawEarthFromSpace = (alpha: number) => {
      if (alpha > 0.3) return;
      const earthAlpha = (0.3 - alpha) / 0.3;
      ctx.save();
      ctx.globalAlpha = earthAlpha;
      const earthGrad = ctx.createRadialGradient(W / 2, H + 200, 50, W / 2, H + 200, 350);
      earthGrad.addColorStop(0, '#1d4ed8');
      earthGrad.addColorStop(0.4, '#2563eb');
      earthGrad.addColorStop(0.7, '#166534');
      earthGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(W / 2, H + 200, 350, 0, Math.PI * 2);
      ctx.fill();

      // Atmosphere glow
      const atmGrad = ctx.createRadialGradient(W / 2, H + 200, 340, W / 2, H + 200, 390);
      atmGrad.addColorStop(0, 'rgba(96,165,250,0)');
      atmGrad.addColorStop(0.5, 'rgba(96,165,250,0.15)');
      atmGrad.addColorStop(1, 'rgba(96,165,250,0)');
      ctx.fillStyle = atmGrad;
      ctx.beginPath();
      ctx.arc(W / 2, H + 200, 390, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawRocket = (rx: number, ry: number) => {
      ctx.save();
      ctx.translate(rx, ry);

      // Body
      const bodyGrad = ctx.createLinearGradient(-14, -50, 14, -50);
      bodyGrad.addColorStop(0, '#cbd5e1');
      bodyGrad.addColorStop(0.5, '#f8fafc');
      bodyGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(-14, -50, 28, 60, 4);
      ctx.fill();

      // Nose cone
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-14, -50);
      ctx.lineTo(0, -80);
      ctx.lineTo(14, -50);
      ctx.closePath();
      ctx.fill();

      // Window
      ctx.fillStyle = '#93c5fd';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#3b82f6';
      ctx.beginPath();
      ctx.arc(0, -30, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Fins
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-14, 0); ctx.lineTo(-28, 20); ctx.lineTo(-14, 10); ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(14, 0); ctx.lineTo(28, 20); ctx.lineTo(14, 10); ctx.closePath();
      ctx.fill();

      // NASA-style stripe
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-14, -15, 28, 8);

      ctx.restore();
    };

    const drawExhaust = (rx: number, ry: number, intensity: number) => {
      // Main flame
      const flameGrad = ctx.createRadialGradient(rx, ry + 15, 0, rx, ry + 15, 30 * intensity);
      flameGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
      flameGrad.addColorStop(0.2, 'rgba(255,200,50,0.8)');
      flameGrad.addColorStop(0.6, 'rgba(255,100,20,0.5)');
      flameGrad.addColorStop(1, 'rgba(255,50,0,0)');
      ctx.save();
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.ellipse(rx, ry + 20 + 10 * intensity, 10 * intensity, 30 * intensity, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawParticles = () => {
      particles.forEach((p, i) => {
        const a = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = a * 0.7;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, '#fbbf24');
        grad.addColorStop(1, 'rgba(251,191,36,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) particles.splice(i, 1);
      });
    };

    let done = false;

    const loop = () => {
      if (done) return;
      time += 0.016;

      ctx.clearRect(0, 0, W, H);

      // Rocket physics
      rocketVY -= rocketAccel;
      rocketAccel = Math.min(rocketAccel + 0.002, 0.8); // accelerates over time
      rocketY += rocketVY;
      cameraOffsetY = Math.max(0, -(rocketY - H * 0.45));

      // Atmosphere transition
      atmosphereAlpha = Math.max(0, 1 - cameraOffsetY / (H * 3));

      const rocketScreenY = rocketY + cameraOffsetY;
      const rocketX = W / 2;

      // Draw scene
      drawSky(atmosphereAlpha);
      drawStars(atmosphereAlpha);
      drawEarthFromSpace(atmosphereAlpha);
      drawGround();
      drawClouds(atmosphereAlpha);
      drawParticles();
      spawnParticles(rocketX, rocketScreenY);
      drawExhaust(rocketX, rocketScreenY, Math.min(1 + time * 0.3, 2.5));
      drawRocket(rocketX, rocketScreenY);

      // Starfield motion in space
      if (atmosphereAlpha < 0.5) {
        stars.forEach(s => {
          s.y += s.speed * (1 - atmosphereAlpha) * 3;
          if (s.y > H) s.y = 0;
        });
      }

      // Phase transition
      if (atmosphereAlpha < 0.05 && phase === 'launch') {
        setPhase('space');
        setShowText(true);
        setTimeout(() => {
          done = true;
          setPhase('done');
          onComplete();
        }, 3000);
      }

      if (!done) animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      done = true;
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50"
    >
      <canvas ref={canvasRef} className="w-full h-full" />

      <AnimatePresence>
        {showText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.p
              initial={{ letterSpacing: '0.1em' }}
              animate={{ letterSpacing: '0.4em' }}
              transition={{ duration: 2 }}
              className="text-blue-300 text-sm uppercase tracking-widest mb-3 font-mono"
            >
              velocidade de escape atingida
            </motion.p>
            <motion.h1
              className="text-white font-bold text-center"
              style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', textShadow: '0 0 40px rgba(96,165,250,0.8)' }}
            >
              11.200 m/s
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-slate-400 mt-4 text-lg font-mono"
            >
              Terra → Espaço ∞
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}