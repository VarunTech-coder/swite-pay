import React, { useState } from 'react';
import { Package, Send, CheckCircle2, Clock } from 'lucide-react';
import { ItemRequest } from '../types';

interface RequestItemViewProps {
  requests: ItemRequest[];
  initialItemName?: string;
  onSubmitRequest: (request: Omit<ItemRequest, 'id' | 'timestamp' | 'status'>) => void;
}

export const RequestItemView: React.FC<RequestItemViewProps> = ({
  requests,
  initialItemName = '',
  onSubmitRequest
}) => {
  const [itemName, setItemName] = useState(initialItemName);
  const [category, setCategory] = useState('Dairy & Eggs');
  const [customerPhone, setCustomerPhone] = useState('+91 ');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !customerPhone.trim()) return;

    onSubmitRequest({
      itemName: itemName.trim(),
      category,
      customerPhone: customerPhone.trim(),
      notes: notes.trim()
    });

    setItemName('');
    setNotes('');
  };

  return (
    <div className="flex-1 flex flex-col p-4 animate-fade-in">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-xs">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-amber-950">Item Unavailable on Shelf?</h2>
          <p className="text-[11px] text-amber-700">
            Tell store staff what you need. We will notify you when restocked!
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
      >
        <div>
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Item Name & Brand *
          </label>
          <input
            type="text"
            placeholder="e.g. Epigamia Blueberry Greek Yogurt"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option>Dairy & Eggs</option>
              <option>Instant Food</option>
              <option>Beverages</option>
              <option>Fresh Produce</option>
              <option>Bakery & Biscuits</option>
              <option>Cooking Essentials</option>
              <option>Personal Care</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Phone Number (for SMS) *
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-medium mono"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Specific Size or Details (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Need the 400g tub or low-sugar option..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Submit Missing Item Request</span>
        </button>
      </form>

      {/* Previous Requests List */}
      <div className="mt-4">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
          Your Active Requests
        </h3>
        <div className="space-y-2">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center shadow-xs"
            >
              <div>
                <p className="font-bold text-slate-900">{r.itemName}</p>
                <p className="text-[10px] text-slate-400">
                  {r.category} · {r.timestamp}
                </p>
                {r.notes && (
                  <p className="text-[10px] text-slate-500 italic mt-0.5">"{r.notes}"</p>
                )}
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                  r.status === 'AVAILABLE'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {r.status === 'AVAILABLE' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Restocked ✓</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Pending Staff</span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
