import React, { useState } from 'react';
import { Lock, ShieldAlert, Sparkles, X } from 'lucide-react';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (staffId.trim() === '123456' && password.trim() === '654321') {
      setError('');
      onSuccess();
    } else {
      setError('Invalid Staff ID or Password. (Hint: ID 123456 / Pass 654321)');
    }
  };

  const handleQuickFill = () => {
    setStaffId('123456');
    setPassword('654321');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center text-xl mx-auto mb-3">
          <Lock className="w-6 h-6 text-amber-600" />
        </div>

        <div className="text-center mb-4">
          <h3 className="text-base font-extrabold text-slate-900">
            Staff Portal Authentication
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Enter authorized staff credentials to manage inventory and restock requests.
          </p>
        </div>

        {/* Demo Quick Fill Helper */}
        <div className="mb-3 p-2 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-[11px] text-amber-900">
          <span className="font-mono">Demo: 123456 / 654321</span>
          <button
            type="button"
            onClick={handleQuickFill}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 active:scale-95 transition"
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>Auto Fill</span>
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Staff ID
            </label>
            <input
              type="text"
              placeholder="Enter Staff ID (e.g. 123456)"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 font-medium mono"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter Password (e.g. 654321)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 font-medium mono"
              required
            />
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl shadow-md transition"
            >
              Verify & Log In
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs py-2.5 rounded-xl transition"
            >
              Cancel / Return to Customer Mode
            </button>
          </div>
        </form>

        <div className="mt-3 pt-3 border-t border-slate-100 text-center">
          <span className="text-[10px] text-slate-400">
            SwiftScan Retail OS · Internal Access Only
          </span>
        </div>
      </div>
    </div>
  );
};
