import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Rocket, ArrowUpCircle, Clock, Target, Gauge } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { SimulationCanvas } from './components/SimulationCanvas';
import { MetricCard } from './components/MetricCard';
import { TrajectoryChart } from './components/TrajectoryChart';

const GRAVITY_OPTIONS = [
  { name: 'Terra', value: 9.81, icon: '🌍', drag: 0.01 },
  { name: 'Lua', value: 1.62, icon: '🌙', drag: 0.0001 },
  { name: 'Marte', value: 3.71, icon: '🔴', drag: 0.005 },
  { name: 'Vênus', value: 8.87, icon: '🟠', drag: 0.02 },
  { name: 'Sol', value: 274, icon: '☀️', drag: 0 },
];

type LayoutMode = 'mobile' | 'compact' | 'desktop';

function getLayout(width: number): LayoutMode {
  if (width < 768) return 'mobile';
  if (width < 1100) return 'compact';
  return 'desktop';
}

export default function App() {
  const [dragCoefficient, setDragCoefficient] = useState(0.01);
  const [velocity, setVelocity] = useState(50);
  const [angle, setAngle] = useState(45);
  const [gravity, setGravity] = useState(9.81);
  const [selectedPlanet, setSelectedPlanet] = useState('Terra');
  const [isSimulating, setIsSimulating] = useState(false);
  const [layout, setLayout] = useState<LayoutMode>(() => getLayout(window.innerWidth));
  const [metrics, setMetrics] = useState({
    maxHeight: 0,
    flightTime: 0,
    range: 0,
    finalVelocity: 0,
  });

  useEffect(() => {
    const check = () => setLayout(getLayout(window.innerWidth));
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const calculateMetrics = async () => {
    try {
      const response = await fetch('https://giving-creation-production-f07c.up.railway.app/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ velocity, angle, gravity, dragCoefficient }),
      });

      if (!response.ok) throw new Error('erro na API');

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error('falha ao chamar a API:', err);
      setIsSimulating(false);
    }
  };

  const handleSimulate = async () => {
    await calculateMetrics();
    setIsSimulating(true);
  };

  const handleSimulationComplete = () => {
    setIsSimulating(false);
  };

  // No modo compact, os planetas ficam em grid 2 colunas pra economizar espaço vertical
  const controls = (compact = false) => (
    <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] h-full" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-[#3b82f6] rounded-full" />
        Controles
      </h2>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Velocidade Inicial</label>
        <div className="flex items-center gap-3 mb-2">
          <input type="number" value={velocity} onChange={(e) => setVelocity(Number(e.target.value))}
            className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:border-[#3b82f6] focus:outline-none transition-colors"
            min="1" max="200" />
          <span className="text-gray-500 text-sm">m/s</span>
        </div>
        <input type="range" value={velocity} onChange={(e) => setVelocity(Number(e.target.value))}
          min="1" max="200" className="w-full h-2 bg-[#334155] rounded-lg appearance-none cursor-pointer slider-thumb" />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Ângulo de Lançamento</label>
        <div className="flex items-center gap-3 mb-2">
          <input type="number" value={angle} onChange={(e) => setAngle(Number(e.target.value))}
            className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:border-[#3b82f6] focus:outline-none transition-colors"
            min="0" max="90" />
          <span className="text-gray-500 text-sm">°</span>
        </div>
        <input type="range" value={angle} onChange={(e) => setAngle(Number(e.target.value))}
          min="0" max="90" className="w-full h-2 bg-[#334155] rounded-lg appearance-none cursor-pointer slider-thumb" />
      </div>

      <div className="mb-5">
        <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Ambiente</label>
        {compact ? (
          // grade 2 colunas + Sol centralizado na última linha
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {GRAVITY_OPTIONS.slice(0, 4).map((option) => (
                <button key={option.name}
                  onClick={() => { setGravity(option.value); setSelectedPlanet(option.name); setDragCoefficient(option.drag); }}
                  className={`p-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${selectedPlanet === option.name
                    ? 'bg-[#3b82f6]/20 border-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                    : 'bg-[#0f172a] border-[#334155] hover:border-[#3b82f6]/50'}`}>
                  <span className="text-xl">{option.icon}</span>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm truncate">{option.name}</div>
                    <div className="text-xs text-gray-500">{option.value} m/s²</div>
                  </div>
                </button>
              ))}
            </div>
            {/* Sol ocupa linha inteira */}
            {GRAVITY_OPTIONS.slice(4).map((option) => (
              <button key={option.name}
                onClick={() => { setGravity(option.value); setSelectedPlanet(option.name); setDragCoefficient(option.drag); }}
                className={`w-full p-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${selectedPlanet === option.name
                  ? 'bg-[#3b82f6]/20 border-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  : 'bg-[#0f172a] border-[#334155] hover:border-[#3b82f6]/50'}`}>
                <span className="text-xl">{option.icon}</span>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium text-sm truncate">{option.name}</div>
                  <div className="text-xs text-gray-500">{option.value} m/s²</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {GRAVITY_OPTIONS.map((option) => (
              <button key={option.name}
                onClick={() => { setGravity(option.value); setSelectedPlanet(option.name); setDragCoefficient(option.drag); }}
                className={`p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 ${selectedPlanet === option.name
                  ? 'bg-[#3b82f6]/20 border-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  : 'bg-[#0f172a] border-[#334155] hover:border-[#3b82f6]/50'}`}>
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{option.name}</div>
                  <div className="text-xs text-gray-500">{option.value} m/s²</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleSimulate} disabled={isSimulating}
        className="w-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2">
        <Rocket className="w-5 h-5" />
        {isSimulating ? 'SIMULANDO...' : 'SIMULAR'}
      </button>
    </div>
  );

  const header = (
    <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-4 shrink-0">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-xl">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">MotionLab</h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest mt-1">Physics Simulation</p>
        </div>
      </div>
    </motion.header>
  );

  // --- MOBILE ---
  if (layout === 'mobile') {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-4 space-y-4">
        {header}
        {controls(false)}
        <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155]" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <div className="w-1 h-5 bg-[#3b82f6] rounded-full" />
            Visualização da Trajetória
          </h2>
          <div className="h-[260px]">
            <SimulationCanvas
              velocity={velocity} angle={angle} gravity={gravity}
              isSimulating={isSimulating} onComplete={handleSimulationComplete}
              dragCoefficient={dragCoefficient}
            />
          </div>
        </div>
        <div className="h-[320px]">
          <TrajectoryChart velocity={velocity} angle={angle} gravity={gravity} dragCoefficient={dragCoefficient} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard icon={ArrowUpCircle} label="Altura Máxima" value={metrics.maxHeight.toString()} unit="m" delay={0} />
          <MetricCard icon={Clock} label="Tempo de Voo" value={metrics.flightTime.toString()} unit="s" delay={0.1} />
          <MetricCard icon={Target} label="Alcance" value={metrics.range.toString()} unit="m" delay={0.2} />
          <MetricCard icon={Gauge} label="Velocidade Final" value={metrics.finalVelocity.toString()} unit="m/s" delay={0.3} />
        </div>
      </div>
    );
  }

  // --- COMPACT (notebooks ~768-1099px) ---
  if (layout === 'compact') {
    return (
      <div className="h-screen overflow-hidden bg-[#0f172a] text-white p-4 flex flex-col">
        {header}
        <div className="flex gap-4 flex-1 min-h-0">

          {/* Sidebar: ocupa altura total, botão fixo no fundo */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="w-64 shrink-0 flex flex-col"
          >
            <div className="bg-[#1e293b] rounded-xl border border-[#334155] flex flex-col flex-1 overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              {/* Parte scrollável */}
              <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#3b82f6] rounded-full" />
                  Controles
                </h2>

                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Velocidade Inicial</label>
                  <div className="flex items-center gap-2 mb-1">
                    <input type="number" value={velocity} onChange={(e) => setVelocity(Number(e.target.value))}
                      className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:border-[#3b82f6] focus:outline-none"
                      min="1" max="200" />
                    <span className="text-gray-500 text-xs">m/s</span>
                  </div>
                  <input type="range" value={velocity} onChange={(e) => setVelocity(Number(e.target.value))}
                    min="1" max="200" className="w-full h-2 bg-[#334155] rounded-lg appearance-none cursor-pointer slider-thumb" />
                </div>

                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Ângulo de Lançamento</label>
                  <div className="flex items-center gap-2 mb-1">
                    <input type="number" value={angle} onChange={(e) => setAngle(Number(e.target.value))}
                      className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:border-[#3b82f6] focus:outline-none"
                      min="0" max="90" />
                    <span className="text-gray-500 text-xs">°</span>
                  </div>
                  <input type="range" value={angle} onChange={(e) => setAngle(Number(e.target.value))}
                    min="0" max="90" className="w-full h-2 bg-[#334155] rounded-lg appearance-none cursor-pointer slider-thumb" />
                </div>

                <div className="mb-2">
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Ambiente</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {GRAVITY_OPTIONS.slice(0, 4).map((option) => (
                      <button key={option.name}
                        onClick={() => { setGravity(option.value); setSelectedPlanet(option.name); setDragCoefficient(option.drag); }}
                        className={`p-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${selectedPlanet === option.name
                          ? 'bg-[#3b82f6]/20 border-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                          : 'bg-[#0f172a] border-[#334155] hover:border-[#3b82f6]/50'}`}>
                        <span className="text-lg">{option.icon}</span>
                        <div className="text-left min-w-0">
                          <div className="font-medium text-xs truncate">{option.name}</div>
                          <div className="text-xs text-gray-500">{option.value} m/s²</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-1.5">
                    {GRAVITY_OPTIONS.slice(4).map((option) => (
                      <button key={option.name}
                        onClick={() => { setGravity(option.value); setSelectedPlanet(option.name); setDragCoefficient(option.drag); }}
                        className={`w-full p-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${selectedPlanet === option.name
                          ? 'bg-[#3b82f6]/20 border-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                          : 'bg-[#0f172a] border-[#334155] hover:border-[#3b82f6]/50'}`}>
                        <span className="text-lg">{option.icon}</span>
                        <div className="text-left min-w-0">
                          <div className="font-medium text-xs">{option.name}</div>
                          <div className="text-xs text-gray-500">{option.value} m/s²</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botão fixo no fundo do sidebar */}
              <div className="p-4 pt-2 shrink-0">
                <button onClick={handleSimulate} disabled={isSimulating}
                  className="w-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                  <Rocket className="w-4 h-4" />
                  {isSimulating ? 'SIMULANDO...' : 'SIMULAR'}
                </button>
              </div>
            </div>
          </motion.aside>

          {/* Conteúdo principal: scroll invisível */}
          <div className="hide-scrollbar flex-1 min-w-0 overflow-y-auto space-y-4 pb-4">
            <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155]" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <div className="w-1 h-5 bg-[#3b82f6] rounded-full" />
                Visualização da Trajetória
              </h2>
              <div className="h-[260px]">
                <SimulationCanvas
                  velocity={velocity} angle={angle} gravity={gravity}
                  isSimulating={isSimulating} onComplete={handleSimulationComplete}
                  dragCoefficient={dragCoefficient}
                />
              </div>
            </div>

            <div className="h-[280px]">
              <TrajectoryChart velocity={velocity} angle={angle} gravity={gravity} dragCoefficient={dragCoefficient} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MetricCard icon={ArrowUpCircle} label="Altura Máxima" value={metrics.maxHeight.toString()} unit="m" delay={0} />
              <MetricCard icon={Clock} label="Tempo de Voo" value={metrics.flightTime.toString()} unit="s" delay={0.1} />
              <MetricCard icon={Target} label="Alcance" value={metrics.range.toString()} unit="m" delay={0.2} />
              <MetricCard icon={Gauge} label="Velocidade Final" value={metrics.finalVelocity.toString()} unit="m/s" delay={0.3} />
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- DESKTOP (>=1100px): layout original com painéis redimensionáveis ---
  return (
    <div className="h-screen overflow-hidden bg-[#0f172a] text-white p-6 flex flex-col">
      {header}
      <div className="flex-1 min-h-0 flex gap-6">
        <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="w-80 shrink-0 overflow-hidden">
          {controls(false)}
        </motion.aside>

        <div className="flex-1 min-w-0 h-full overflow-hidden">
          <PanelGroup direction="vertical" className="h-full">

            <Panel defaultSize={55} minSize={20}>
              <div className="h-full overflow-hidden">
                <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] h-full" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-[#3b82f6] rounded-full" />
                    Visualização da Trajetória
                  </h2>
                  <div className="h-[calc(100%-3rem)]">
                    <SimulationCanvas
                      velocity={velocity} angle={angle} gravity={gravity}
                      isSimulating={isSimulating} onComplete={handleSimulationComplete}
                      dragCoefficient={dragCoefficient}
                    />
                  </div>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle hitAreaMargins={{ coarse: 4, fine: 4 }} className="h-1.5 rounded-full bg-[#334155] hover:bg-[#3b82f6] transition-colors cursor-row-resize my-1" />

            <Panel defaultSize={28} minSize={15}>
              <div className="h-full overflow-hidden">
                <TrajectoryChart velocity={velocity} angle={angle} gravity={gravity} dragCoefficient={dragCoefficient} />
              </div>
            </Panel>

            <PanelResizeHandle hitAreaMargins={{ coarse: 4, fine: 4 }} className="h-1.5 rounded-full bg-[#334155] hover:bg-[#3b82f6] transition-colors cursor-row-resize my-1" />

            <Panel defaultSize={17} minSize={12}>
              <div className="h-full overflow-hidden">
                <div className="grid grid-cols-4 gap-4 h-full">
                  <MetricCard icon={ArrowUpCircle} label="Altura Máxima" value={metrics.maxHeight.toString()} unit="m" delay={0} />
                  <MetricCard icon={Clock} label="Tempo de Voo" value={metrics.flightTime.toString()} unit="s" delay={0.1} />
                  <MetricCard icon={Target} label="Alcance" value={metrics.range.toString()} unit="m" delay={0.2} />
                  <MetricCard icon={Gauge} label="Velocidade Final" value={metrics.finalVelocity.toString()} unit="m/s" delay={0.3} />
                </div>
              </div>
            </Panel>

          </PanelGroup>
        </div>
      </div>
    </div>
  );
}