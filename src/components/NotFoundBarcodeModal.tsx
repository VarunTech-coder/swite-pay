import React from 'react';
import { AlertCircle, Plus, Edit3, X, Sparkles } from 'lucide-react';

interface NotFoundBarcodeModalProps {
  barcode: string;
  onClose: () => void;
  onEnterManual: () => void;
  onAddNewProduct: (barcode: string) => void;
}

export const NotFoundBarcodeModal: React.FC<NotFoundBarcodeModalProps> = ({
  barcode,
  onClose,
  onEnterManual,
  onAddNewProduct
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 text-center">
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200 shadow-xs">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>

        <h3 className="text-base font-extrabold text-slate-900 leading-snug">
          Barcode detected, but product not found.
        </h3>

        <p className="text-xs text-slate-500 mt-1.5">
          The barcode was recognized by the optical scanner, but it is not currently registered in the store catalog.
        </p>

        {/* Detected Code Chip */}
        <div className="my-3 py-2 px-3 bg-slate-100 rounded-xl border border-slate-200 inline-block max-w-full">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Detected Barcode Number
          </span>
          <span className="mono font-bold text-slate-900 text-sm tracking-wider">
            {barcode}
          </span>
        </div>

        {/* User Options (Requirement 9) */}
        <div className="space-y-2 mt-2">
          {/* Option 1: Add / Create New Product */}
          <button
            type="button"
            onClick={() => onAddNewProduct(barcode)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs py-3 rounded-xl shadow-md shadow-emerald-600/25 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add / Create New Product with this Barcode</span>
          </button>

          {/* Option 2: Enter Barcode Manually */}
          <button
            type="button"
            onClick={onEnterManual}
            className="w-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs py-2.5 rounded-xl border border-slate-200 transition flex items-center justify-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Enter Barcode Manually</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium py-1 transition"
          >
            Cancel & Return to Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
