import React, { useState } from 'react';
import { MapPin, Plus, Check, ShoppingCart, ArrowRight, X, Tag, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  cartQty?: number;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onViewCart?: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  cartQty = 0,
  onClose,
  onAddToCart,
  onViewCart
}) => {
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const savings = product.mrp - product.price;
  const brand = product.brand || product.name.split(' ')[0] || 'Verified Retail';

  const handleAdd = () => {
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-[440px] bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden"></div>

        {/* Top Header & Close */}
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Barcode Verified</span>
            </span>
            {cartQty > 0 && (
              <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                {cartQty} in Cart
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Details (Requirement 7) */}
        <div className="flex items-start gap-4">
          {/* Product Image */}
          <div className="relative flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
            />
            <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              {product.category}
            </span>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            {/* Brand */}
            <div className="flex items-center gap-1.5 mb-1">
              <Tag className="w-3 h-3 text-amber-600" />
              <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">
                {brand}
              </span>
            </div>

            {/* Product Name */}
            <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h3>

            {/* Aisle & Rack / Shelf Information */}
            <div className="mt-1.5 inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200">
              <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              <span>{product.aisle}</span>
              <span>·</span>
              <span className="truncate">{product.shelf}</span>
            </div>

            {/* Price & MRP */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg font-black text-slate-950">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-xs text-slate-400 line-through">₹{product.mrp}</span>
              )}
              {savings > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  Save ₹{savings}
                </span>
              )}
            </div>

            <p className="text-[10px] text-slate-400 mt-1 mono">
              UPC / EAN: <span className="font-semibold text-slate-600">{product.barcode}</span>
            </p>
          </div>
        </div>

        {/* Action Controls (Requirement 8: Provide an “Add to Cart” button) */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleAdd}
            className={`font-extrabold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          {onViewCart ? (
            <button
              type="button"
              onClick={onViewCart}
              className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Go to Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
