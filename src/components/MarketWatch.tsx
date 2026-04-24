import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatPrice, formatVolume } from '../lib/utils';
import { TickData } from '../types';

interface MarketWatchProps {
  ticks: Record<string, TickData>;
}

export const MarketWatch: React.FC<MarketWatchProps> = ({ ticks }) => {
  return (
    <div className="panel-geo overflow-hidden flex flex-col h-full bg-brand-panel">
      <div className="px-5 py-4 border-b border-brand-border flex justify-between items-center bg-brand-bg/40">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Market Watch</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Institutional Data Stream</p>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold px-2 py-0.5 bg-brand-accent/10 text-brand-accent border border-brand-accent/20 uppercase tracking-widest">
          <div className="w-1 h-1 rounded-full bg-brand-accent shadow-[0_0_8px_#3b82f6]" />
          RT-Sync
        </div>
      </div>
      
      <div className="overflow-auto flex-1">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-brand-bg z-10">
            <tr>
              <th className="table-header-geo">Symbol</th>
              <th className="table-header-geo text-right">Bid</th>
              <th className="table-header-geo text-right">Ask</th>
              <th className="table-header-geo text-right">Spread</th>
              <th className="table-header-geo text-right">Vol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            <AnimatePresence initial={false}>
              {Object.values(ticks).map((tick) => (
                <motion.tr
                  key={tick.symbol}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="table-cell-geo font-bold text-white tracking-widest">
                    {tick.symbol}
                  </td>
                  <td className="table-cell-geo text-right">
                    <PriceValue value={tick.bid} />
                  </td>
                  <td className="table-cell-geo text-right">
                    <PriceValue value={tick.ask} />
                  </td>
                  <td className="table-cell-geo text-right text-gray-500">
                    {formatPrice(tick.ask - tick.bid, 5)}
                  </td>
                  <td className="table-cell-geo text-right text-gray-400">
                    {formatVolume(tick.volume)}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {Object.keys(ticks).length === 0 && (
              <tr>
                <td colSpan={5} className="py-24 text-center text-gray-600 text-[10px] uppercase font-bold tracking-[0.2em]">
                  Awaiting Initial Handshake...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PriceValue: React.FC<{ value: number }> = ({ value }) => {
  const [prevValue, setPrevValue] = React.useState(value);
  const [direction, setDirection] = React.useState<'up' | 'down' | null>(null);

  React.useEffect(() => {
    if (value > prevValue) setDirection('up');
    else if (value < prevValue) setDirection('down');
    
    setPrevValue(value);
    
    const timeout = setTimeout(() => setDirection(null), 1000);
    return () => clearTimeout(timeout);
  }, [value, prevValue]);

  return (
    <span className={cn(
      "transition-colors duration-500 inline-flex items-center gap-1",
      direction === 'up' && "text-brand-success",
      direction === 'down' && "text-brand-danger"
    )}>
      {formatPrice(value)}
      {direction === 'up' && <TrendingUp size={12} />}
      {direction === 'down' && <TrendingDown size={12} />}
    </span>
  );
};
