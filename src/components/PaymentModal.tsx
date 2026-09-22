import React, { useState } from 'react';
import {
  X,
  QrCode,
  Smartphone,
  Building2,
  AtSign,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Lock,
  Sparkles
} from 'lucide-react';
import { TransactionDetails } from '../types';

interface PaymentModalProps {
  totalAmount: number;
  totalSavings: number;
  itemCount: number;
  onClose: () => void;
  onPaymentSuccess: (transaction: TransactionDetails) => void;
}

type PaymentTab = 'upi_app' | 'upi_qr' | 'upi_id' | 'net_banking';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  totalAmount,
  totalSavings,
  itemCount,
  onClose,
  onPaymentSuccess
}) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>('upi_app');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPay' | 'PhonePe' | 'Paytm' | 'BHIM' | 'CRED'>('GPay');
  const [upiIdInput, setUpiIdInput] = useState('nanpuli143@okaxis');
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');

  const upiApps = [
    { id: 'GPay', name: 'Google Pay', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { id: 'PhonePe', name: 'PhonePe', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { id: 'Paytm', name: 'Paytm UPI', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
    { id: 'BHIM', name: 'BHIM UPI', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { id: 'CRED', name: 'CRED UPI', color: 'text-slate-900 bg-slate-100 border-slate-300' }
  ];

  const popularBanks = [
    { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC0001' },
    { id: 'SBI', name: 'State Bank of India', code: 'SBIN0001' },
    { id: 'ICICI', name: 'ICICI Bank', code: 'ICIC0001' },
    { id: 'Axis', name: 'Axis Bank', code: 'UTIB0001' },
    { id: 'Kotak', name: 'Kotak Mahindra Bank', code: 'KKBK0001' },
    { id: 'PNB', name: 'Punjab National Bank', code: 'PUNB0001' }
  ];

  const handleStartPayment = () => {
    setIsProcessing(true);
    setProcessStep('Connecting to NPCI UPI Gateway...');

    setTimeout(() => {
      setProcessStep('Authorizing INR ' + totalAmount + ' transaction...');
    }, 800);

    setTimeout(() => {
      setProcessStep('Payment approved! Generating verified bill & exit pass...');
    }, 1600);

    setTimeout(() => {
      // Calculate GST breakdown (5% total GST = 2.5% CGST + 2.5% SGST)
      const subtotal = Math.round((totalAmount / 1.05) * 100) / 100;
      const totalGst = Math.round((totalAmount - subtotal) * 100) / 100;
      const cgst = Math.round((totalGst / 2) * 100) / 100;
      const sgst = Math.round((totalGst / 2) * 100) / 100;

      let providerName = '';
      let payerVpaOrAccount = '';

      if (activeTab === 'upi_app') {
        providerName = `${selectedUpiApp} UPI`;
        payerVpaOrAccount = `${selectedUpiApp.toLowerCase()}.user@okaxis`;
      } else if (activeTab === 'upi_qr') {
        providerName = 'Dynamic UPI QR (BHIM/NPCI)';
        payerVpaOrAccount = 'customer@upi (QR Scanned)';
      } else if (activeTab === 'upi_id') {
        providerName = 'UPI VPA Direct';
        payerVpaOrAccount = upiIdInput.trim() || 'user@upi';
      } else {
        providerName = `${selectedBank} Net Banking`;
        payerVpaOrAccount = `A/C **${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const fakeTransaction: TransactionDetails = {
        transactionId: `TXN_UPI_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        utrNumber: `UTR90${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        paymentMethod:
          activeTab === 'upi_app'
            ? 'UPI_APP'
            : activeTab === 'upi_qr'
            ? 'UPI_QR'
            : activeTab === 'upi_id'
            ? 'UPI_ID'
            : 'NET_BANKING',
        providerName,
        payerVpaOrAccount,
        status: 'SUCCESS',
        authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
        npciRef: `NPCI-${Math.floor(10000000 + Math.random() * 90000000)}`,
        timestamp: new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'medium'
        }),
        invoiceNumber: `INV-2026-09-${Math.floor(100000 + Math.random() * 900000)}`,
        gstin: '29AABCU9603R1ZM',
        subtotal,
        cgst,
        sgst,
        savings: totalSavings,
        totalPaid: totalAmount
      };

      setIsProcessing(false);
      onPaymentSuccess(fakeTransaction);
    }, 2300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Secure UPI & Banking Checkout</span>
                <span className="text-[9px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                  256-BIT SSL
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">NPCI Certified Self-Checkout Payment</p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Order Amount Bar */}
        <div className="bg-emerald-50/80 border-b border-emerald-200/80 px-4 py-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">
              Cart Total ({itemCount} items)
            </span>
            <span className="text-lg font-black text-emerald-950">₹{totalAmount}</span>
          </div>
          {totalSavings > 0 && (
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Total Saved</span>
              <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                You Save ₹{totalSavings}
              </span>
            </div>
          )}
        </div>

        {/* PROCESSING OVERLAY */}
        {isProcessing ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin flex items-center justify-center"></div>
              <ShieldCheck className="w-7 h-7 text-emerald-600 absolute inset-0 m-auto" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">Processing Payment</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">{processStep}</p>
            </div>
            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-mono">
              ₹{totalAmount} · Merchant: SwiftScan Store #402
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('upi_app')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-bold transition ${
                  activeTab === 'upi_app'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 mb-0.5 text-emerald-600" />
                <span>UPI Apps</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('upi_qr')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-bold transition ${
                  activeTab === 'upi_qr'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 mb-0.5 text-blue-600" />
                <span>Scan QR</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('upi_id')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-bold transition ${
                  activeTab === 'upi_id'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AtSign className="w-3.5 h-3.5 mb-0.5 text-purple-600" />
                <span>UPI ID</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('net_banking')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-bold transition ${
                  activeTab === 'net_banking'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 mb-0.5 text-amber-600" />
                <span>Banking</span>
              </button>
            </div>

            {/* TAB 1: UPI APPS (GPay, PhonePe, Paytm, BHIM, CRED) */}
            {activeTab === 'upi_app' && (
              <div className="space-y-2.5 animate-fade-in">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select your UPI application:
                </span>

                <div className="space-y-2">
                  {upiApps.map((app) => {
                    const isSelected = selectedUpiApp === app.id;
                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedUpiApp(app.id as any)}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-400'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${app.color}`}
                          >
                            {app.id.slice(0, 2)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{app.name}</span>
                            <span className="text-[10px] text-slate-500">Fast 1-click authorization</span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: DYNAMIC UPI QR SCAN */}
            {activeTab === 'upi_qr' && (
              <div className="flex flex-col items-center text-center p-2 animate-fade-in">
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-900 shadow-md flex flex-col items-center">
                  <div className="text-[10px] font-black text-slate-800 tracking-wider uppercase mb-1.5 flex items-center gap-1">
                    <span>BHIM</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-emerald-700 font-extrabold">UPI 2.0 QR</span>
                  </div>

                  {/* Render High-Contrast Realistic UPI QR Pattern */}
                  <div className="w-44 h-44 bg-white p-2 rounded-2xl border border-slate-200 flex items-center justify-center relative shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950">
                      {/* Realistic QR Corners */}
                      <rect x="5" y="5" width="26" height="26" fill="currentColor" rx="4" />
                      <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                      <rect x="13" y="13" width="10" height="10" fill="currentColor" rx="2" />

                      <rect x="69" y="5" width="26" height="26" fill="currentColor" rx="4" />
                      <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                      <rect x="77" y="13" width="10" height="10" fill="currentColor" rx="2" />

                      <rect x="5" y="69" width="26" height="26" fill="currentColor" rx="4" />
                      <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                      <rect x="13" y="77" width="10" height="10" fill="currentColor" rx="2" />

                      {/* Data Pattern Dots */}
                      <rect x="36" y="8" width="5" height="5" fill="currentColor" />
                      <rect x="46" y="14" width="5" height="5" fill="currentColor" />
                      <rect x="56" y="8" width="5" height="5" fill="currentColor" />
                      <rect x="36" y="24" width="5" height="5" fill="currentColor" />
                      <rect x="48" y="26" width="6" height="6" fill="currentColor" />
                      <rect x="58" y="24" width="5" height="5" fill="currentColor" />

                      <rect x="8" y="36" width="6" height="6" fill="currentColor" />
                      <rect x="18" y="44" width="5" height="5" fill="currentColor" />
                      <rect x="26" y="38" width="6" height="6" fill="currentColor" />
                      <rect x="14" y="54" width="6" height="6" fill="currentColor" />
                      <rect x="24" y="52" width="6" height="6" fill="currentColor" />

                      <rect x="70" y="38" width="6" height="6" fill="currentColor" />
                      <rect x="82" y="44" width="5" height="5" fill="currentColor" />
                      <rect x="74" y="54" width="6" height="6" fill="currentColor" />
                      <rect x="86" y="52" width="6" height="6" fill="currentColor" />

                      <rect x="38" y="40" width="8" height="8" fill="currentColor" rx="1" />
                      <rect x="52" y="42" width="8" height="8" fill="currentColor" rx="1" />
                      <rect x="44" y="54" width="10" height="10" fill="currentColor" rx="2" />

                      <rect x="36" y="72" width="6" height="6" fill="currentColor" />
                      <rect x="48" y="74" width="6" height="6" fill="currentColor" />
                      <rect x="58" y="70" width="6" height="6" fill="currentColor" />
                      <rect x="38" y="84" width="6" height="6" fill="currentColor" />
                      <rect x="50" y="86" width="6" height="6" fill="currentColor" />
                      <rect x="62" y="82" width="6" height="6" fill="currentColor" />

                      <rect x="74" y="72" width="8" height="8" fill="currentColor" />
                      <rect x="86" y="80" width="8" height="8" fill="currentColor" />
                    </svg>

                    {/* Central Rupee Badge */}
                    <div className="absolute w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white">
                      ₹
                    </div>
                  </div>

                  <span className="mono text-sm font-black text-slate-900 mt-2">
                    Pay INR {totalAmount}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    swiftscan.retail@icici
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-2">
                  Open Google Pay, PhonePe, Paytm or BHIM on your smartphone to scan and pay.
                </p>
              </div>
            )}

            {/* TAB 3: ENTER UPI ID / VPA */}
            {activeTab === 'upi_id' && (
              <div className="space-y-3 p-1 animate-fade-in">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Enter your UPI ID / Virtual Payment Address
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. yourname@okhdfcbank / 9876543210@paytm"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    We will send a payment collect prompt of ₹{totalAmount} to your UPI app.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['@okaxis', '@okhdfcbank', '@paytm', '@ybl', '@ibl'].map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => {
                        const base = upiIdInput.split('@')[0] || 'user';
                        setUpiIdInput(`${base}${handle}`);
                      }}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg transition font-mono"
                    >
                      {handle}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: NET BANKING */}
            {activeTab === 'net_banking' && (
              <div className="space-y-2.5 animate-fade-in">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select your Bank for Net Banking:
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {popularBanks.map((bank) => {
                    const isSelected = selectedBank === bank.name;
                    return (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.name)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 text-slate-900 font-bold ring-1 ring-emerald-400'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-xs truncate block font-bold">{bank.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{bank.code}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Security Badge Note */}
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[10px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Simulated Sandbox Gateway · Bank UTR, GST tax invoice & 5-minute exit gate pass will be
                issued immediately upon authorization.
              </span>
            </div>
          </div>
        )}

        {/* Modal Action CTA */}
        {!isProcessing && (
          <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
            >
              Back to Cart
            </button>
            <button
              type="button"
              onClick={handleStartPayment}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
            >
              <span>
                Authorize & Pay ₹{totalAmount}
                {activeTab === 'upi_app' && ` via ${selectedUpiApp}`}
                {activeTab === 'net_banking' && ` via ${selectedBank.split(' ')[0]}`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
