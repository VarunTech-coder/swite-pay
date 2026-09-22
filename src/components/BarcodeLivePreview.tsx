import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Printer, Sparkles, AlertCircle } from 'lucide-react';
import { isValidEan13 } from '../utils/ean13';

interface BarcodeLivePreviewProps {
  barcode: string;
  name?: string;
  price?: number;
  onOpenPrintModal?: () => void;
}

export const BarcodeLivePreview: React.FC<BarcodeLivePreviewProps> = ({
  barcode,
  name,
  price,
  onOpenPrintModal
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!barcode || !svgRef.current) return;

    const clean = barcode.trim();
    if (!clean) return;

    try {
      setError(null);

      // Requirement 10 & 11: If 13 digits with valid check digit, render true EAN13
      if (isValidEan13(clean)) {
        JsBarcode(svgRef.current, clean, {
          format: 'EAN13',
          lineColor: '#0f172a',
          width: 2,
          height: 52,
          displayValue: true,
          font: 'monospace',
          fontSize: 13,
          margin: 10,
          background: '#ffffff'
        });
      } else {
        // Fallback to Code 128 for alphanumeric or non-EAN barcodes
        JsBarcode(svgRef.current, clean, {
          format: 'CODE128',
          lineColor: '#0f172a',
          width: 1.8,
          height: 48,
          displayValue: true,
          font: 'monospace',
          fontSize: 12,
          margin: 8,
          background: '#ffffff'
        });
      }
    } catch (e: any) {
      try {
        if (svgRef.current) {
          JsBarcode(svgRef.current, clean, {
            format: 'auto',
            width: 1.6,
            height: 44,
            displayValue: true
          });
          setError(null);
        }
      } catch (fallbackError) {
        setError('Unable to render barcode with provided characters.');
      }
    }
  }, [barcode]);

  if (!barcode.trim()) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3 text-center text-slate-400 text-xs">
        <span>Type or click "Gen Code" to preview scannable barcode (JsBarcode)</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-amber-200/80 rounded-xl p-3 shadow-xs flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-1 text-[10px]">
        <span className="font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>JsBarcode Scannable Preview</span>
        </span>
        {onOpenPrintModal && (
          <button
            type="button"
            onClick={onOpenPrintModal}
            className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 transition"
          >
            <Printer className="w-3 h-3" />
            <span>Printable Sticker</span>
          </button>
        )}
      </div>

      <div className="bg-white py-1 px-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center max-w-full overflow-hidden">
        {name && (
          <span className="text-[11px] font-bold text-slate-800 truncate max-w-[220px] mb-0.5">
            {name}
          </span>
        )}
        <svg ref={svgRef} className="max-w-full"></svg>
        {price !== undefined && !isNaN(price) && (
          <span className="text-[10px] font-extrabold text-emerald-800 mt-0.5">
            Store Price: ₹{price}
          </span>
        )}
      </div>

      {error && (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-rose-600 font-medium">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
