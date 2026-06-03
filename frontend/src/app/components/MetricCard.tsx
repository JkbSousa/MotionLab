import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  delay?: number;
}

export function MetricCard({ icon: Icon, label, value, unit, delay = 0 }: MetricCardProps) {
  const isInfinity = value === 'Infinity';
  const displayValue = isInfinity ? '∞' : value;
  const displayUnit = isInfinity ? '' : unit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`bg-[#1e293b] rounded-xl p-6 border relative overflow-hidden group transition-all duration-300 ${
        isInfinity ? 'border-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-[#334155] hover:border-[#3b82f6]'
      }`}
      style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
            <Icon className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <span className="text-sm text-gray-400 uppercase tracking-wider">{label}</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`font-semibold text-white ${isInfinity ? 'text-5xl text-[#60a5fa]' : 'text-3xl'}`}
            style={isInfinity ? { textShadow: '0 0 20px rgba(96,165,250,0.6)' } : {}}>
            {displayValue}
          </span>
          {displayUnit && <span className="text-sm text-gray-500">{displayUnit}</span>}
          {isInfinity && <span className="text-xs text-[#3b82f6] uppercase tracking-widest ml-1">escape</span>}
        </div>
      </div>
    </motion.div>
  );
}