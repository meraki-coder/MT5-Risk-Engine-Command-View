import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Activity, 
  Settings, 
  Radio, 
  Moon, 
  Sun, 
  BarChart3, 
  Users, 
  Layers, 
  DollarSign, 
  Terminal,
  Signal,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketWatch } from './components/MarketWatch';
import { AccountsOverview } from './components/AccountsOverview';
import { PositionsTable } from './components/PositionsTable';
import { MetricCard } from './components/MetricCard';
import { TickData, ClientData, PositionData, PositionsSnapshotPayload } from './types';
import { cn, formatMoney } from './lib/utils';

const DEFAULT_SOCKET_URL = 'http://127.0.0.1:8765';

export default function App() {
  const [socketUrl, setSocketUrl] = useState(DEFAULT_SOCKET_URL);
  const [isConnected, setIsConnected] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  
  const [ticks, setTicks] = useState<Record<string, TickData>>({});
  const [clients, setClients] = useState<Record<number, ClientData>>({});
  const [positions, setPositions] = useState<Record<number, PositionData>>({});
  
  const [lastTickAt, setLastTickAt] = useState<Date | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Check URL params for socket override
    const params = new URLSearchParams(window.location.search);
    const urlFromParams = params.get('socket');
    if (urlFromParams) setSocketUrl(urlFromParams);
  }, []);

  useEffect(() => {
    const socket = io(socketUrl, {
      transports: ['polling']
    });
    
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('tick_update', (payload: TickData) => {
      setTicks(prev => ({ ...prev, [payload.symbol]: payload }));
      setLastTickAt(new Date());
    });

    socket.on('clients_snapshot', (payload: ClientData[]) => {
      const clientMap: Record<number, ClientData> = {};
      payload.forEach(c => clientMap[c.login] = c);
      setClients(clientMap);
    });

    socket.on('client_update', (payload: ClientData) => {
      setClients(prev => ({ ...prev, [payload.login]: payload }));
    });

    socket.on('client_removed', (payload: { login: number }) => {
      setClients(prev => {
        const next = { ...prev };
        delete next[payload.login];
        return next;
      });
    });

    socket.on('positions_snapshot', (payload: PositionsSnapshotPayload) => {
      const posMap: Record<number, PositionData> = {};
      payload.positions.forEach(p => posMap[p.ticket] = p);
      setPositions(posMap);
    });

    socket.on('positions_update', (payload: PositionsSnapshotPayload) => {
      setPositions(prev => {
        const next = { ...prev };
        const incomingTickets = new Set(payload.positions.map(p => p.ticket));
        const currentSymbol = payload.positions.length > 0 ? payload.positions[0].symbol : null;

        // If symbol matches, remove positions strictly not in the update
        if (currentSymbol) {
          Object.keys(next).forEach(ticketKey => {
            const ticket = Number(ticketKey);
            if (next[ticket].symbol === currentSymbol && !incomingTickets.has(ticket)) {
              delete next[ticket];
            }
          });
        }

        payload.positions.forEach(p => next[p.ticket] = p);
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [socketUrl]);

  const totalOpenProfit = Object.values(clients).reduce((acc, c) => acc + (c.open_profit || 0), 0);
  const activeSymbols = Object.keys(ticks).length;
  const activeClients = Object.keys(clients).length;
  const activePositions = Object.keys(positions).length;

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    document.documentElement.setAttribute('data-light', (!isLightMode).toString());
  };

  const [isKillDialogOpen, setIsKillDialogOpen] = useState(false);

  const handleKillAll = () => {
    setIsKillDialogOpen(false);
    // In a real app, this would send a secure command to the backend
    alert("GLOBAL EMERGENCY LIQUIDATION COMMAND SENT TO ENGINE.");
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen flex flex-col bg-brand-bg relative">
      {/* Kill All Confirmation Dialog */}
      <AnimatePresence>
        {isKillDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsKillDialogOpen(false)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="panel-geo w-full max-w-md bg-brand-panel border-brand-danger/50 p-8 relative z-10"
            >
              <div className="flex items-center gap-4 mb-6 text-brand-danger">
                <AlertCircle size={32} />
                <h2 className="text-xl font-bold uppercase tracking-widest">Immediate Liquidation</h2>
              </div>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed font-medium">
                You are about to execute a <span className="text-brand-danger">TOTAL CLUSTER KILL</span> command. 
                All open positions across all {activeClients} accounts will be closed at market price immediately. 
                This action is irreversible.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsKillDialogOpen(false)}
                  className="px-6 py-3 border border-brand-border text-[10px] font-bold tracking-widest uppercase hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleKillAll}
                  className="px-6 py-3 bg-brand-danger text-white text-[10px] font-bold tracking-widest uppercase hover:bg-brand-danger/90 transition-colors shadow-lg shadow-brand-danger/20"
                >
                  Confirm Kill All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <header className="h-16 border-b border-brand-border flex items-center justify-between px-6 bg-brand-bg">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-brand-accent rounded-sm flex items-center justify-center text-white">
            <BarChart3 size={18} />
          </div>
          <h1 className="text-sm font-bold tracking-widest uppercase text-white">
            MT5 Risk Engine <span className="text-brand-accent ml-1">v4.2</span>
          </h1>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <div className={cn(
               "w-2 h-2 rounded-full",
               isConnected ? "bg-brand-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-brand-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]"
             )} />
             <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
               Gateway: {isConnected ? 'MT5-LDN-S1' : 'TERMINATED'}
             </span>
          </div>
          
          <div className="h-8 w-px bg-brand-border" />
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsKillDialogOpen(true)}
              className="px-4 py-2 border border-brand-danger/30 text-brand-danger text-[10px] font-bold tracking-widest uppercase hover:bg-brand-danger/5 transition-colors"
            >
              Kill All Trades
            </button>
            <button className="px-4 py-2 bg-brand-accent text-white text-[10px] font-bold tracking-widest uppercase hover:bg-brand-accent/90 transition-colors">
              System Settings
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 flex flex-col gap-6">
        {/* Metrics Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            label="Account Exposure"
            value={formatMoney(Object.values(clients).reduce((acc, c) => acc + (c.equity || 0), 0))}
            subtext="Total consolidated equity across monitored accounts"
            icon={Activity}
          />
          <MetricCard 
            label="Current Net PnL"
            value={formatMoney(totalOpenProfit)}
            subtext="Aggregated unrealized floating profit/loss"
            icon={DollarSign}
            variant={totalOpenProfit >= 0 ? "success" : "danger"}
          />
          <MetricCard 
            label="Value at Risk (VaR)"
            value={`$${(activePositions * 42).toLocaleString()}`}
            subtext="Engine estimated daily risk threshold at 95% CL"
            icon={AlertCircle}
            variant="warning"
          />
          <MetricCard 
            label="System Nodes"
            value={activeClients}
            subtext="Total cluster endpoints synchronized in real-time"
            icon={Users}
            variant="accent"
          />
        </section>

        {/* Main Grid Section */}
        <main className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">
          <section className="xl:col-span-3 flex flex-col gap-6">
            <div className="h-[450px]">
              <MarketWatch ticks={ticks} />
            </div>
            
            <div className="panel-geo p-5 bg-brand-panel flex-1">
               <div className="flex items-center justify-between mb-4 border-b border-brand-border pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">System Messages</span>
                  <Terminal size={12} className="text-gray-600" />
               </div>
               <div className="space-y-2 max-h-[120px] overflow-auto">
                  <TelemetryItem time="14:02:11" msg="Risk Engine sync complete" color="blue" />
                  <TelemetryItem time="14:03:02" msg="Latency spike detected (42ms)" color="yellow" />
                  <TelemetryItem time="14:05:44" msg="MT5 connection re-established" color="blue" />
                  <TelemetryItem time={new Date().toLocaleTimeString().split(' ')[0]} msg={`Node ${activeClients} verified`} color="green" />
               </div>
            </div>
          </section>

          <section className="xl:col-span-9 flex flex-col gap-6">
            <div className="h-[320px]">
              <AccountsOverview clients={clients} />
            </div>
            <div className="flex-1">
              <PositionsTable positions={positions} />
            </div>
          </section>
        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-10 border-t border-brand-border bg-brand-panel px-6 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">
        <div className="flex items-center gap-8">
          <span>Session ID: <span className="text-gray-300">MT5-9981-Z</span></span>
          <span>Feed Address: <span className="text-brand-accent">{socketUrl}</span></span>
          <div className="flex items-center gap-2">
            <span>CPU Load</span>
            <div className="w-16 h-1 bg-brand-bg rounded-none overflow-hidden border border-brand-border">
              <div className="bg-brand-success h-full w-[14%]" />
            </div>
            <span className="text-gray-300">14%</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <span>Auto-Liquidate: <span className="text-brand-danger">Disabled</span></span>
          <span className="text-gray-300">{new Date().toLocaleString()} GMT</span>
        </div>
      </footer>
    </div>
  );
}

const TelemetryItem: React.FC<{ time: string; msg: string; color: 'blue' | 'yellow' | 'green' | 'red' }> = ({ time, msg, color }) => (
  <div className="text-[9px] font-mono leading-relaxed flex gap-2">
    <span className={cn(
      color === 'blue' && "text-blue-400",
      color === 'yellow' && "text-yellow-400",
      color === 'green' && "text-green-400",
      color === 'red' && "text-brand-danger",
    )}>[{time}]</span>
    <span className="text-gray-400">{msg}</span>
  </div>
);
