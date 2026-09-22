import React, { useState } from 'react';
import {
  Ticket,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  QrCode,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ExitPass } from '../types';

interface ExitPassViewProps {
  exitPass: ExitPass | null;
  exitSeconds: number;
  onResetPass: () => void;
}

export const ExitPassView: React.FC<ExitPassViewProps> = ({
  exitPass,
  exitSeconds,
  onResetPass
}) => {
  const [activeTab, setActiveTab] = useState<'pass' | 'bill'>('pass');
  const [copiedUtr, setCopiedUtr] = useState(false);

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!exitPass) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl mb-3 text-slate-400">
          <Ticket className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="font-bold text-slate-700 text-sm">No Active Exit Pass or Bill</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
          Scan barcodes into cart and complete UPI payment to view your bill and gate timer.
        </p>
      </div>
    );
  }

  const tx = exitPass.transaction;
  const circleOffset = ((300 - exitSeconds) / 300) * 283;

  const handleCopyUtr = () => {
    if (!tx?.utrNumber) return;
    navigator.clipboard.writeText(tx.utrNumber);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const handlePrintBill = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col p-4 items-center animate-fade-in print:p-0">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Toggle between Exit Pass & Full Tax Bill */}
        <div className="w-full flex items-center justify-center gap-2 mb-3 print:hidden">
          <div className="bg-slate-200/80 p-1 rounded-2xl flex w-full">
            <button
              type="button"
              onClick={() => setActiveTab('pass')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'pass'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ticket className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gate Exit Pass & Timer</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bill')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'bill'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-amber-600" />
              <span>Tax Invoice & Transaction</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: GATE EXIT PASS WITH PROMINENT COUNTDOWN TIMER */}
        {activeTab === 'pass' && (
          <div className="w-full bg-white rounded-3xl border-2 border-emerald-500 shadow-2xl overflow-hidden relative print:border-none print:shadow-none">
            {/* Top Security Banner */}
            <div className="bg-emerald-600 text-white p-3.5 text-center relative">
              <div className="verified-pulse inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700 text-[11px] font-black uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Digital Exit Pass</span>
              </div>
              <h3 className="text-xs font-semibold opacity-90">{exitPass.storeName}</h3>
            </div>

            {/* Countdown Timer Circle */}
            <div className="p-4 flex flex-col items-center bg-gradient-to-b from-slate-50 to-white">
              {/* Security Alert Badge */}
              <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-[10px] font-bold mb-1">
                <Clock className="w-3 h-3 text-emerald-700" />
                <span>Active Exit Gate Validity Timer</span>
              </div>

              <div className="relative w-36 h-36 flex items-center justify-center my-1">
                {/* SVG Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="text-slate-200 stroke-current"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    style={{ strokeDashoffset: circleOffset }}
                    className={`timer-ring-circle stroke-current transition-all duration-1000 ${
                      exitSeconds < 60 ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Countdown Text */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="mono text-2xl font-black text-slate-900 tracking-tight">
                    {formatTime(exitSeconds)}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                    {exitSeconds > 0 ? 'Remaining to Exit' : 'Pass Expired'}
                  </span>
                </div>
              </div>

              {exitSeconds === 0 && (
                <div className="mb-2 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Pass has expired. Please contact front security desk.</span>
                </div>
              )}

              {/* Exit Barcode Display */}
              <div className="w-full bg-slate-900 rounded-2xl p-3 text-white text-center mt-1 shadow-inner">
                <div className="h-10 w-full barcode-watermark rounded flex items-center justify-around px-4 opacity-90">
                  {[...Array(24)].map((_, i) => (
                    <div
                      key={i}
                      className={`bg-white h-8 ${
                        i % 4 === 0
                          ? 'w-1.5'
                          : i % 3 === 0
                          ? 'w-0.5'
                          : i % 2 === 0
                          ? 'w-1'
                          : 'w-0.5'
                      }`}
                    ></div>
                  ))}
                </div>
                <p className="mono font-bold text-sm tracking-widest text-emerald-400 mt-2">
                  {exitPass.passCode}
                </p>
                <p className="text-[10px] text-slate-400">
                  Scan this pass code at the digital store turnstile or show to security
                </p>
              </div>

              {/* FAKE TRANSACTION SNIPPET */}
              {tx && (
                <div className="w-full mt-2.5 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{tx.providerName}</span>
                    </span>
                    <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded">
                      {tx.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mono">
                    <span>UTR: {tx.utrNumber}</span>
                    <span>Paid: ₹{tx.totalPaid}</span>
                  </div>
                </div>
              )}

              {/* Verified Items Summary */}
              <div className="w-full mt-2 bg-slate-50 rounded-xl p-3 border border-slate-200 text-left">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-1.5">
                  <span>Items Manifest</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                    {exitPass.itemCount} Items Paid (₹{exitPass.totalAmount})
                  </span>
                </div>
                <div className="max-h-24 overflow-y-auto text-[11px] text-slate-600 space-y-1 pr-1">
                  {exitPass.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-100 py-0.5">
                      <span className="truncate pr-2">
                        {it.qty}x {it.name}
                      </span>
                      <span className="font-semibold text-slate-800 flex-shrink-0">
                        ₹{it.price * it.qty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Switch to Detailed Bill Button */}
              <button
                type="button"
                onClick={() => setActiveTab('bill')}
                className="w-full mt-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5 text-amber-700" />
                <span>View Full Tax Bill & Transaction Receipt</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: FULL TAX INVOICE & FAKE TRANSACTION DETAILS */}
        {activeTab === 'bill' && (
          <div
            id="printable-barcode-area"
            className="w-full bg-white rounded-3xl border border-slate-300 shadow-xl overflow-hidden p-5 text-slate-900 animate-fade-in print:border-none print:shadow-none print:p-0"
          >
            {/* Bill Header */}
            <div className="border-b-2 border-dashed border-slate-300 pb-3 text-center">
              <span className="text-[10px] font-black tracking-widest text-emerald-700 uppercase block">
                SWIFTSCAN RETAIL PRIVATE LIMITED
              </span>
              <h2 className="text-sm font-black text-slate-900">TAX INVOICE / CASH MEMO</h2>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Flagship Store #402 · 100 Feet Rd, Indiranagar, Bengaluru 560038
              </p>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[9px] text-slate-600 mono">
                <span>GSTIN: {tx?.gstin || '29AABCU9603R1ZM'}</span>
                <span>FSSAI: 11220334000849</span>
              </div>
            </div>

            {/* Bill Meta */}
            <div className="py-2.5 border-b border-slate-200 text-[10px] grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block font-semibold">INVOICE NO:</span>
                <span className="font-mono font-bold text-slate-900">
                  {tx?.invoiceNumber || 'INV-2026-09-849102'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-semibold">DATE & TIME:</span>
                <span className="font-mono font-bold text-slate-900">
                  {tx?.timestamp || exitPass.createdAt}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">CHECKOUT LANE:</span>
                <span className="font-bold text-emerald-800">Self-Checkout #02 (Mobile)</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-semibold">EXIT PASS CODE:</span>
                <span className="font-mono font-bold text-slate-900">{exitPass.passCode}</span>
              </div>
            </div>

            {/* FAKE TRANSACTION SECTION (Detailed Banking Information) */}
            <div className="my-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Electronic Payment Details</span>
                </span>
                <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300">
                  {tx?.status || 'SETTLED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] mono">
                <div>
                  <span className="text-slate-400 block">Payment Method:</span>
                  <span className="font-bold text-slate-900">{tx?.providerName || 'UPI App'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Payer VPA / Account:</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {tx?.payerVpaOrAccount || 'customer@okaxis'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">NPCI Txn ID:</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {tx?.transactionId || 'TXN_UPI_9482019482'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bank UTR:</span>
                    <button
                      type="button"
                      onClick={handleCopyUtr}
                      className="text-[8px] text-emerald-700 font-bold flex items-center gap-0.5 print:hidden"
                    >
                      {copiedUtr ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                      <span>{copiedUtr ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <span className="font-bold text-emerald-800 block">
                    {tx?.utrNumber || 'UTR9028471928'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Auth Code:</span>
                  <span className="font-bold text-slate-800">{tx?.authCode || 'AUTH-849102'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Gateway Ref:</span>
                  <span className="font-bold text-slate-800">{tx?.npciRef || 'NPCI-481920'}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="my-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 pb-1">
                <span className="flex-1">Item Description</span>
                <span className="w-8 text-center">Qty</span>
                <span className="w-14 text-right">Rate</span>
                <span className="w-14 text-right">Total</span>
              </div>
              <div className="divide-y divide-slate-100 text-[11px] py-1">
                {exitPass.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1 items-center">
                    <div className="flex-1 pr-2 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{it.name}</p>
                      <span className="text-[9px] text-slate-400 mono">HSN 1905 · {it.barcode}</span>
                    </div>
                    <span className="w-8 text-center text-slate-700 font-semibold">{it.qty}</span>
                    <span className="w-14 text-right text-slate-600 font-mono">₹{it.price}</span>
                    <span className="w-14 text-right font-black text-slate-900 font-mono">
                      ₹{it.price * it.qty}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals & Tax Calculation Breakdown */}
            <div className="border-t-2 border-slate-200 pt-2 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal</span>
                <span className="font-mono font-medium">₹{tx?.subtotal || exitPass.totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST @ 2.5%</span>
                <span className="font-mono">₹{tx?.cgst ?? 0}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST @ 2.5%</span>
                <span className="font-mono">₹{tx?.sgst ?? 0}</span>
              </div>
              {tx && tx.savings > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Total Discount / Savings</span>
                  <span className="font-mono">- ₹{tx.savings}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-300">
                <span>TOTAL AMOUNT PAID</span>
                <span className="font-mono text-base text-emerald-800">₹{exitPass.totalAmount}</span>
              </div>
            </div>

            {/* Bill Footer with Gate Scanner Note */}
            <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-center text-[9px] text-slate-400">
              <p>Thank you for shopping at SwiftScan Retail! Save paper, save trees.</p>
              <p className="font-mono mt-0.5">Customer Care: 1800-419-SWIFT · support@swiftscan.in</p>
            </div>

            {/* Print & Back Controls */}
            <div className="mt-4 grid grid-cols-2 gap-2 print:hidden">
              <button
                type="button"
                onClick={handlePrintBill}
                className="w-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print Tax Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pass')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-200" />
                <span>Show Gate Timer</span>
              </button>
            </div>
          </div>
        )}

        {/* Start Next Shopping Trip CTA */}
        <button
          onClick={onResetPass}
          className="mt-4 text-xs text-slate-500 hover:text-slate-800 font-semibold py-1.5 px-3 rounded-lg hover:bg-slate-200 transition print:hidden"
        >
          Start Next Shopping Trip
        </button>
      </div>
    </div>
  );
};
