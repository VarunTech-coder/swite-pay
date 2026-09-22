import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { X, Printer, Download, Copy, Check, Tag, Sparkles, MapPin } from 'lucide-react';
import { Product } from '../types';
import { isValidEan13 } from '../utils/ean13';

interface PrintableBarcodeModalProps {
  product: Product | {
    name: string;
    barcode: string;
    price: number;
    mrp?: number;
    category?: string;
    aisle?: string;
    shelf?: string;
  } | null;
  onClose: () => void;
  onBarcodeScanned?: (barcode: string) => void;
}

export const PrintableBarcodeModal: React.FC<PrintableBarcodeModalProps> = ({
  product,
  onClose,
  onBarcodeScanned
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [labelFormat, setLabelFormat] = useState<'retail' | 'compact' | 'shelf'>('retail');
  const [copied, setCopied] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  // Render barcode whenever product or format changes
  useEffect(() => {
    if (!product || !product.barcode || !svgRef.current) return;

    try {
      setBarcodeError(null);
      const cleanBarcode = product.barcode.trim();

      const isEan = isValidEan13(cleanBarcode);

      JsBarcode(svgRef.current, cleanBarcode, {
        format: isEan ? 'EAN13' : 'CODE128',
        lineColor: '#0f172a',
        width: labelFormat === 'compact' ? 1.8 : 2.1,
        height: labelFormat === 'compact' ? 45 : 65,
        displayValue: true,
        font: 'monospace',
        fontSize: labelFormat === 'compact' ? 12 : 14,
        textMargin: 4,
        margin: 10,
        background: '#ffffff'
      });
    } catch (err: any) {
      console.warn('JsBarcode render warning:', err);
      // Fallback attempt with generic auto format
      try {
        if (svgRef.current) {
          JsBarcode(svgRef.current, product.barcode.trim(), {
            format: 'auto',
            lineColor: '#000000',
            width: 2,
            height: 55,
            displayValue: true
          });
          setBarcodeError(null);
        }
      } catch (fallbackErr: any) {
        setBarcodeError('Could not format barcode with standard CODE128. Displaying numeric code.');
      }
    }
  }, [product, labelFormat]);

  if (!product) return null;

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(product.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    // Print window specifically focused on sticker
    window.print();
  };

  const handleDownloadPNG = () => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width + 40;
      canvas.height = image.height + 40;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 20, 20);
        const png = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = png;
        downloadLink.download = `barcode-${product.barcode}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  const mrp = product.mrp ?? product.price;
  const savings = Math.max(0, mrp - product.price);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in print:bg-white print:p-0 print:static">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-w-none">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Printable Barcode Label</h3>
              <p className="text-[11px] text-slate-500">Retail Ready Label Generator (JsBarcode)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Pills */}
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 print:hidden">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Sticker Format:
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setLabelFormat('retail')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                labelFormat === 'retail'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Retail Sticker
            </button>
            <button
              type="button"
              onClick={() => setLabelFormat('shelf')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                labelFormat === 'shelf'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Shelf Tag
            </button>
            <button
              type="button"
              onClick={() => setLabelFormat('compact')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                labelFormat === 'compact'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Barcode Only
            </button>
          </div>
        </div>

        {/* PRINTABLE LABEL PREVIEW CANVAS / STICKER */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-100/60 print:bg-white print:p-0">
          <div
            ref={printAreaRef}
            id="printable-barcode-area"
            className={`bg-white rounded-2xl border-2 border-dashed border-slate-300 p-4 shadow-sm w-full max-w-xs transition flex flex-col items-center text-center print:border-none print:shadow-none print:max-w-none print:w-auto ${
              labelFormat === 'shelf' ? 'border-amber-400 bg-amber-50/20' : ''
            }`}
          >
            {/* Store Header on sticker */}
            {labelFormat !== 'compact' && (
              <div className="w-full pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-emerald-700 tracking-wider uppercase block">
                    SWIFTSCAN RETAIL
                  </span>
                  <span className="text-[8px] text-slate-400 font-medium">Store #402 · Indiranagar</span>
                </div>
                {product.category && (
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                    {product.category}
                  </span>
                )}
              </div>
            )}

            {/* Product Title */}
            {labelFormat !== 'compact' && (
              <h4 className="text-xs font-black text-slate-900 line-clamp-2 px-1 mb-1">
                {product.name}
              </h4>
            )}

            {/* Aisle & Shelf Location Tag */}
            {labelFormat !== 'compact' && product.aisle && (
              <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1 mb-1 font-medium">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>{product.aisle}</span>
                {product.shelf && (
                  <>
                    <span>·</span>
                    <span>{product.shelf}</span>
                  </>
                )}
              </p>
            )}

            {/* JSBARCODE RENDERED SVG */}
            <div className="my-1 bg-white p-2 rounded-xl flex flex-col items-center justify-center w-full overflow-hidden">
              <svg ref={svgRef} className="max-w-full h-auto"></svg>
              {barcodeError && (
                <p className="text-[10px] text-rose-600 font-bold mt-1">{barcodeError}</p>
              )}
            </div>

            {/* Price & Savings Pill on Sticker */}
            {labelFormat !== 'compact' && (
              <div className="w-full pt-2 mt-1 border-t border-slate-100 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[8px] text-slate-400 uppercase font-bold block">STORE OFFER</span>
                  <span className="text-sm font-black text-slate-950">₹{product.price}</span>
                </div>

                {savings > 0 && (
                  <div className="text-right">
                    <span className="text-[8px] text-slate-400 line-through block">MRP ₹{mrp}</span>
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      SAVE ₹{savings}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Verification Watermark */}
            <div className="w-full mt-2 pt-1 border-t border-dashed border-slate-200 flex items-center justify-between text-[8px] text-slate-400">
              <span>SELF-CHECKOUT CERTIFIED</span>
              <span className="mono">ID: {product.barcode.slice(-6)}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-2 print:hidden">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print Sticker Label</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPNG}
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save PNG Image</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyBarcode}
              className="flex-1 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 font-semibold text-xs py-2 px-3 rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied: {product.barcode}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code: {product.barcode}</span>
                </>
              )}
            </button>

            {onBarcodeScanned && (
              <button
                type="button"
                onClick={() => {
                  onBarcodeScanned(product.barcode);
                  onClose();
                }}
                className="bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 font-bold text-xs py-2 px-3 rounded-xl border border-emerald-300 transition flex items-center gap-1"
                title="Test scan this barcode now"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Test Scan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
