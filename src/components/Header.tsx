import React from 'react';
import { Zap, Lock, LogOut } from 'lucide-react';
import { AppRole, StaffTab, ItemRequest } from '../types';

interface HeaderProps {
  appRole: AppRole;
  onToggleRole: () => void;
  staffTab: StaffTab;
  onSelectStaffTab: (tab: StaffTab) => void;
  requests: ItemRequest[];
  onStaffLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appRole,
  onToggleRole,
  staffTab,
  onSelectStaffTab,
  requests,
  onStaffLogout
}) => {
  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <header className="bg-slate-900 text-white px-4 py-3 sticky top-0 z-40 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/30">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight leading-none flex items-center gap-1.5">
              SwiftScan
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                LIVE
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Indiranagar Store #402
            </p>
          </div>
        </div>

        {/* Role Toggle & Staff Lock */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleRole}
            id="role-switch-button"
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                appRole === 'customer' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            ></span>
            <span>{appRole === 'customer' ? 'Customer Mode' : 'Staff Portal'}</span>
            <span className="text-[10px] text-slate-400 bg-slate-900 px-1 py-0.5 rounded font-mono">
              Switch
            </span>
          </button>

          {appRole === 'staff' && onStaffLogout && (
            <button
              onClick={onStaffLogout}
              title="Lock and Log Out"
              className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-xs transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sub Mode Pill Selector for Staff */}
      {appRole === 'staff' && (
        <div className="grid grid-cols-2 gap-1 mt-2.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => onSelectStaffTab('inventory')}
            className={`text-xs py-1.5 font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              staffTab === 'inventory'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>📦</span>
            <span>Inventory Entry</span>
          </button>
          <button
            onClick={() => onSelectStaffTab('requests')}
            className={`text-xs py-1.5 font-bold rounded-lg transition relative flex items-center justify-center gap-1.5 ${
              staffTab === 'requests'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🔔</span>
            <span>Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>
      )}
    </header>
  );
};
