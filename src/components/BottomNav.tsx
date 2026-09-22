import React from 'react';
import { Camera, Search, ShoppingCart, Ticket, PenSquare } from 'lucide-react';
import { CustomerTab } from '../types';

interface BottomNavProps {
  currentTab: CustomerTab;
  onSelectTab: (tab: CustomerTab) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  cartCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex justify-around items-center z-30 sm:rounded-b-[28px] shadow-lg">
      <button
        onClick={() => onSelectTab('scan')}
        className={`flex flex-col items-center text-[10px] font-bold transition py-1 px-2 rounded-xl active:scale-95 ${
          currentTab === 'scan' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <span className="text-lg">📷</span>
        <span>Scan Barcode</span>
      </button>

      <button
        onClick={() => onSelectTab('search')}
        className={`flex flex-col items-center text-[10px] font-bold transition py-1 px-2 rounded-xl active:scale-95 ${
          currentTab === 'search' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <span className="text-lg">🔎</span>
        <span>Store Catalog</span>
      </button>

      <button
        onClick={() => onSelectTab('cart')}
        className={`flex flex-col items-center text-[10px] font-bold transition relative py-1 px-2 rounded-xl active:scale-95 ${
          currentTab === 'cart' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <span className="text-lg">🛒</span>
        <span>Cart ({cartCount})</span>
        {cartCount > 0 && (
          <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">
            {cartCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('pass')}
        className={`flex flex-col items-center text-[10px] font-bold transition py-1 px-2 rounded-xl active:scale-95 ${
          currentTab === 'pass' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <span className="text-lg">🎟️</span>
        <span>Exit Pass</span>
      </button>

      <button
        onClick={() => onSelectTab('request')}
        className={`flex flex-col items-center text-[10px] font-bold transition py-1 px-2 rounded-xl active:scale-95 ${
          currentTab === 'request' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <span className="text-lg">✍️</span>
        <span>Request Item</span>
      </button>
    </nav>
  );
};
