import React, { useState } from 'react';
import { cn, formatMoney, formatPrice, formatVolume } from '../lib/utils';
import { PositionData } from '../types';
import { LayoutList, ArrowUpRight, ArrowDownRight, Clock, Search, X } from 'lucide-react';

interface PositionsTableProps {
  positions: Record<number, PositionData>;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({ positions }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const positionList = Object.values(positions);

  const filteredPositions = positionList.filter(pos => {
    if (!filterQuery) return true;
    const query = filterQuery.toLowerCase();
    
    return (
      pos.ticket.toString().includes(query) ||
      pos.login.toString().includes(query) ||
      pos.symbol.toLowerCase().includes(query) ||
      pos.action.toLowerCase().includes(query) ||
      pos.volume.toString().includes(query)
    );
  });

  return (
    <div className="panel-geo overflow-hidden flex flex-col h-full bg-brand-panel">
      <div className="px-5 py-4 border-b border-brand-border flex justify-between items-center bg-brand-bg/40">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Live Executions</h2>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-brand-border">Open: {positionList.length}</span>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-accent transition-colors">
            <Search size={12} />
          </div>
          <input 
            type="text"
            placeholder="FILTER POSITIONS..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="bg-brand-bg border border-brand-border py-1.5 pl-9 pr-8 text-[10px] font-bold uppercase tracking-wider text-white focus:outline-none focus:border-brand-accent transition-colors w-48 md:w-64 placeholder:text-gray-700"
          />
          {filterQuery && (
            <button 
              onClick={() => setFilterQuery('')}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-brand-bg z-10 shadow-sm">
            <tr>
              <th className="table-header-geo">Ticket</th>
              <th className="table-header-geo">Login</th>
              <th className="table-header-geo">Symbol</th>
              <th className="table-header-geo">Type</th>
              <th className="table-header-geo text-right">Volume</th>
              <th className="table-header-geo text-right">Entry</th>
              <th className="table-header-geo text-right">Mark</th>
              <th className="table-header-geo text-right">PnL</th>
              <th className="table-header-geo text-right">SL / TP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {filteredPositions.map((pos) => (
              <tr key={pos.ticket} className="group hover:bg-white/[0.02] transition-colors">
                <td className="table-cell-geo text-gray-500">#{pos.ticket}</td>
                <td className="table-cell-geo text-gray-400">{pos.login}</td>
                <td className="table-cell-geo font-bold text-white tracking-widest">{pos.symbol}</td>
                <td className="table-cell-geo">
                  <span className={cn(
                    "status-tag flex items-center gap-1 w-fit",
                    pos.action.toLowerCase().includes('sell') 
                      ? "text-brand-danger border-brand-danger/30 bg-brand-danger/5" 
                      : "text-brand-success border-brand-success/30 bg-brand-success/5"
                  )}>
                    {pos.action}
                  </span>
                </td>
                <td className="table-cell-geo text-right font-bold">{formatVolume(pos.volume)}</td>
                <td className="table-cell-geo text-right text-gray-500">{formatPrice(pos.price_open)}</td>
                <td className="table-cell-geo text-right text-gray-300">{formatPrice(pos.price_current)}</td>
                <td className={cn(
                  "table-cell-geo text-right font-bold",
                  pos.profit > 0 ? "text-brand-success" : pos.profit < 0 ? "text-brand-danger" : "text-gray-500"
                )}>
                  {formatMoney(pos.profit)}
                </td>
                <td className="table-cell-geo text-right uppercase">
                  <div className="flex flex-col text-[9px] font-bold">
                    <span className="text-brand-danger">SL: {pos.sl > 0 ? formatPrice(pos.sl) : '---'}</span>
                    <span className="text-brand-success">TP: {pos.tp > 0 ? formatPrice(pos.tp) : '---'}</span>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPositions.length === 0 && (
              <tr>
                <td colSpan={9} className="py-24 text-center text-gray-600 text-[10px] uppercase font-bold tracking-[0.2em]">
                  {filterQuery ? "No matching executions found" : "Market Exposure: Neutral"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

