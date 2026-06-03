import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrajectoryChartProps {
  velocity: number;
  angle: number;
  gravity: number;
  dragCoefficient: number;
}

const MAX_POINTS = 500;
const MAX_ITERATIONS = 500_000;

function simulateTrajectory(velocity: number, angle: number, gravity: number, dragCoefficient: number) {
  const angleRad = (angle * Math.PI) / 180;
  let vx = velocity * Math.cos(angleRad);
  let vy = velocity * Math.sin(angleRad);

  // dt dinâmico: velocidades altas usam passos maiores
  const dt = Math.max(0.016, velocity / 1000);

  let x = 0, y = 0;
  const allPoints: { x: number; y: number }[] = [];
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    allPoints.push({ x, y });

    const speed = Math.sqrt(vx * vx + vy * vy);
    const ax = -dragCoefficient * speed * vx;
    const ay = -gravity - dragCoefficient * speed * vy;

    vx += ax * dt;
    vy += ay * dt;
    x += vx * dt;
    y += vy * dt;

    iterations++;
    if (y < 0) break;
  }

  // Subsamplear para no máximo MAX_POINTS
  if (allPoints.length <= MAX_POINTS) return allPoints.map(p => ({
    x: Number(p.x.toFixed(1)),
    y: Number(p.y.toFixed(1)),
  }));

  const step = Math.ceil(allPoints.length / MAX_POINTS);
  return allPoints
    .filter((_, i) => i % step === 0 || i === allPoints.length - 1)
    .map(p => ({ x: Number(p.x.toFixed(1)), y: Number(p.y.toFixed(1)) }));
}

export function TrajectoryChart({ velocity, angle, gravity, dragCoefficient }: TrajectoryChartProps) {
  const points = simulateTrajectory(velocity, angle, gravity, dragCoefficient);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] h-full flex flex-col"
      style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 shrink-0">
        <div className="w-1 h-6 bg-[#3b82f6] rounded-full" />
        Gráfico da Trajetória
      </h3>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ left: 10, right: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="x"
              stroke="#64748b"
              label={{ value: 'Distância (m)', position: 'insideBottom', offset: -10, fill: '#64748b' }}
            />
            <YAxis
              stroke="#64748b"
              width={70}
              label={{ value: 'Altura (m)', angle: -90, position: 'insideBottomLeft', dx: 20, fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              filter="url(#glow)"
            />
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}