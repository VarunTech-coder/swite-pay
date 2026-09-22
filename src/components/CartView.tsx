import React from 'react';
import { ShoppingCart, ArrowRight, Minus, Plus } from 'lucide-react';
import { CartItem } from '../types';

interface CartViewProps {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartSavings: number;
  onUpdateCartQty: (productId: string, delta: number) => void;
  onCheckout: () => void;
  onNavigateToScan: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  cartCount,
  cartTotal,
  cartSavings,
  onUpdateCartQty,
  onCheckout,
  onNavigateToScan
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 animate-fade-in">
      {/* Cart Header with Strict 20 Items Indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Your Self-Scan Cart</h2>
          <p className="text-xs text-slate-500">Verify items before digital UPI checkout</p>
        </div>
        <div className="text-right">
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-full border ${
              cartCount >= 20
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
          >
            {cartCount} / 20 Max
          </span>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl mb-3 text-slate-400">
            <ShoppingCart className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">Cart is empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
            Scan barcodes or browse the store catalog to add items.
          </p>
          <button
            onClick={onNavigateToScan}
            className="mt-4 bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-emerald-700 transition active:scale-95"
          >
            Start Scanning
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          {/* Cart Items List */}
          <div className="overflow-y-auto space-y-2.5 max-h-[340px] pr-1">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-2"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.aisle}</p>
                  <p className="text-xs font-black text-slate-900 mt-1">₹{item.price * item.qty}</p>
                </div>

                {/* Counter */}
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-2 py-1 border border-slate-200">
                  <button
                    onClick={() => onUpdateCartQty(item.id, -1)}
                    className="text-xs font-black text-slate-600 w-5 h-5 flex items-center justify-center active:scale-75 hover:text-rose-600"
                    title="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-extrabold text-slate-900 w-4 text-center">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => onUpdateCartQty(item.id, 1)}
                    className="text-xs font-black text-emerald-700 w-5 h-5 flex items-center justify-center active:scale-75 hover:text-emerald-800"
                    title="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bill Summary & Pay */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-lg mt-4">
            <div className="space-y-1.5 text-xs text-slate-600 pb-3 border-b border-slate-100">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="font-bold text-slate-900">{cartCount} items</span>
              </div>
              <div className="flex justify-between">
                <span>Total Savings</span>
                <span className="font-bold text-emerald-600">- ₹{cartSavings}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1">
                <span>To Pay (INR)</span>
                <span className="text-base text-emerald-700">₹{cartTotal}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={onCheckout}
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
            >
              <span>Pay ₹{cartTotal} & Generate Exit Pass</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              ⚡ Instant UPI Checkout · 5-minute verified digital exit pass issued
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
