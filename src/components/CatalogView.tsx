import React, { useState, useMemo } from 'react';
import { Search, X, MapPin, Plus, Info } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/initialData';

interface CatalogViewProps {
  products: Product[];
  categories: string[];
  onAddToCart: (product: Product, qty?: number) => boolean;
  onShowProductInfo: (product: Product) => void;
  onRequestMissingItem: (itemName: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  categories,
  onAddToCart,
  onShowProductInfo,
  onRequestMissingItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery) ||
        p.aisle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shelf.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 flex flex-col p-4 animate-fade-in">
      {/* Search Input */}
      <div className="relative mb-3">
        <span className="absolute left-3.5 top-3 text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Search items, categories, or aisle (e.g., Milk, Aisle 3)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 text-xs bg-white border border-slate-200 rounded-2xl shadow-xs focus:outline-none focus:border-emerald-500 font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Horizontal Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product List with In-Store Location Coordinates */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 max-h-[calc(100vh-250px)]">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200 mt-2 shadow-xs">
            <div className="text-3xl mb-2">🛒🔎</div>
            <h3 className="text-sm font-bold text-slate-800">
              Can't find "{searchQuery || selectedCategory}"?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Request it now and store staff will notify you when it's stocked!
            </p>
            <button
              onClick={() => onRequestMissingItem(searchQuery)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition active:scale-95"
            >
              Request This Item
            </button>
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-400 transition"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                  {p.name}
                </h4>

                {/* In-Store Location Badge */}
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-semibold">
                  <MapPin className="w-2.5 h-2.5 text-amber-700 flex-shrink-0" />
                  <span className="font-bold">{p.aisle}</span>
                  <span>·</span>
                  <span className="truncate max-w-[120px]">{p.shelf}</span>
                </div>

                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-sm font-extrabold text-slate-900">₹{p.price}</span>
                  {p.mrp > p.price && (
                    <span className="text-[11px] text-slate-400 line-through">₹{p.mrp}</span>
                  )}
                  <span className="mono text-[10px] text-slate-400">
                    UPC: {p.barcode.slice(-5)}
                  </span>
                </div>
              </div>

              {/* Quick Add Button */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <button
                  onClick={() => onAddToCart(p, 1)}
                  className="bg-emerald-600 active:scale-90 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
                <button
                  onClick={() => onShowProductInfo(p)}
                  className="text-[10px] text-slate-400 hover:text-slate-700 underline flex items-center gap-0.5"
                >
                  <Info className="w-3 h-3" />
                  <span>Info</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
