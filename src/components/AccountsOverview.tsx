import React from 'react';
import { cn, formatMoney } from '../lib/utils';
import { ClientData } from '../types';
import { Users, ShieldCheck, Activity } from 'lucide-react';

interface AccountsOverviewProps {
  clients: Record<number, ClientData>;
}

export const AccountsOverview: React.FC<AccountsOverviewProps> = ({ clients }) => {
  const accountList = Object.values(clients);

  return (
    <div className="panel-geo overflow-hidden flex flex-col h-full bg-brand-panel">
      <div className="px-5 py-4 border-b border-brand-border flex justify-between items-center bg-brand-bg/40">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Active Accounts</h2>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-brand-border">Total: {accountList.length}</span>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-brand-bg z-10">
            <tr>
              <th className="table-header-geo">Login</th>
              <th className="table-header-geo text-center">Status</th>
              <th className="table-header-geo text-right">Balance</th>
              <th className="table-header-geo text-right">Equity</th>
              <th className="table-header-geo text-right">Margin Lvl</th>
              <th className="table-header-geo text-right">Floating P/L</th>
              <th className="table-header-geo text-center">Pos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {accountList.map((client) => (
              <tr key={client.login} className="group hover:bg-white/[0.02] transition-colors">
                <td className="table-cell-geo font-bold text-brand-accent">
                  {client.login}
                </td>
                <td className="table-cell-geo text-center">
                  <span className={cn(
                    "status-tag",
                    client.status.toLowerCase() === 'active' 
                      ? "text-brand-success border-brand-success/30 bg-brand-success/5" 
                      : "text-gray-500 border-gray-500/30 bg-gray-500/5"
                  )}>
                    {client.status}
                  </span>
                </td>
                <td className="table-cell-geo text-right text-gray-300">
                  {formatMoney(client.balance)}
                </td>
                <td className="table-cell-geo text-right font-bold text-white">
                  {formatMoney(client.equity)}
                </td>
                <td className="table-cell-geo text-right">
                  <MarginIndicator margin={client.margin} equity={client.equity} />
                </td>
                <td className={cn(
                  "table-cell-geo text-right font-bold",
                  client.open_profit > 0 ? "text-brand-success" : client.open_profit < 0 ? "text-brand-danger" : "text-gray-500"
                )}>
                  {formatMoney(client.open_profit)}
                </td>
                <td className="table-cell-geo text-center text-gray-500">
                  {client.open_positions}
                </td>
              </tr>
            ))}
            {accountList.length === 0 && (
              <tr>
                <td colSpan={7} className="py-24 text-center text-gray-600 text-[10px] uppercase font-bold tracking-[0.2em]">
                  No node exposure detected.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MarginIndicator: React.FC<{ margin: number; equity: number }> = ({ margin, equity }) => {
  if (margin === 0) return <span className="text-gray-600">—</span>;
  const level = (equity / margin) * 100;
  
  return (
    <div className="flex flex-col items-end gap-1">
      <span className={cn(
        "font-mono text-[10px] font-bold",
        level < 100 ? "text-brand-danger" : level < 200 ? "text-brand-warning" : "text-brand-success"
      )}>
        {level.toFixed(1)}%
      </span>
      <div className="w-12 h-0.5 bg-brand-border overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-1000",
            level < 100 ? "bg-brand-danger" : level < 200 ? "bg-brand-warning" : "bg-brand-success"
          )}
          style={{ width: `${Math.min(level / 10, 100)}%` }}
        />
      </div>
    </div>
  );
};
