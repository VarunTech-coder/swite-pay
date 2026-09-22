import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Bell,
  Check,
  Trash2,
  RefreshCw,
  Tag,
  X,
  Sparkles,
  Printer,
  Upload,
  Image as ImageIcon,
  Camera,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Product, ItemRequest, StaffTab } from '../types';
import { PrintableBarcodeModal } from './PrintableBarcodeModal';
import { BarcodeLivePreview } from './BarcodeLivePreview';
import { generateValidEan13 } from '../utils/ean13';

interface StaffPortalProps {
  staffTab: StaffTab;
  products: Product[];
  categories: string[];
  requests: ItemRequest[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onDeleteProduct: (productId: string) => void;
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  onRestockNotify: (requestId: string) => void;
  onTestScanBarcode?: (barcode: string) => void;
  prefilledBarcode?: string;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({
  staffTab,
  products,
  categories,
  requests,
  onAddProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory,
  onRestockNotify,
  onTestScanBarcode,
  prefilledBarcode
}) => {
  // Inventory Form State
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState(prefilledBarcode || '');
  const [category, setCategory] = useState(categories[1] || 'Dairy & Eggs');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [aisle, setAisle] = useState('Aisle 1');
  const [shelf, setShelf] = useState('Rack A · Shelf 1');
  const [image, setImage] = useState('');
  const [uploadedImageFileName, setUploadedImageFileName] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [stock, setStock] = useState('30');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const unbarcodedFileInputRef = useRef<HTMLInputElement>(null);

  // Custom Category Adder State
  const [customCatInput, setCustomCatInput] = useState('');

  // Printable Barcode Modal State (holds product to print/display)
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<any | null>(null);

  // Loose / Unbarcoded Item Quick Generator Tool
  const [showQuickUnbarcoded, setShowQuickUnbarcoded] = useState(false);
  const [unbarcodedName, setUnbarcodedName] = useState('');
  const [unbarcodedPrice, setUnbarcodedPrice] = useState('');
  const [unbarcodedCat, setUnbarcodedCat] = useState('Fresh Produce & Loose');
  const [unbarcodedAisle, setUnbarcodedAisle] = useState('Aisle 1');
  const [unbarcodedImage, setUnbarcodedImage] = useState('');
  const [unbarcodedImageName, setUnbarcodedImageName] = useState('');

  useEffect(() => {
    if (prefilledBarcode) {
      setBarcode(prefilledBarcode);
    }
  }, [prefilledBarcode]);

  const generateRandomBarcode = () => {
    const code = generateValidEan13();
    setBarcode(code);
    return code;
  };

  // Handle local image file selection from computer, camera, or gallery
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Selected image exceeds 8MB. Please choose a smaller photo.');
      return;
    }

    setUploadedImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUnbarcodedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUnbarcodedImageName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setUnbarcodedImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage('');
    setUploadedImageFileName('');
    setImageUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createInitialsSvg = (title: string) => {
    const letters = (title.trim().slice(0, 2) || 'PR').toUpperCase();
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%230f172a"/><circle cx="100" cy="100" r="70" fill="%231e293b"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="52" font-weight="900" fill="%23f59e0b">${letters}</text></svg>`;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    // Use barcode entered or generate standard 13-digit code
    const effectiveBarcode = barcode.trim() || generateRandomBarcode();

    // Determine product image: uploaded image, manual URL, or crisp SVG package fallback
    const effectiveImage =
      image.trim() ||
      imageUrlInput.trim() ||
      createInitialsSvg(name.trim());

    const newProduct = {
      name: name.trim(),
      barcode: effectiveBarcode,
      category: category.trim(),
      price: parseFloat(price),
      mrp: parseFloat(mrp || price),
      aisle,
      shelf: shelf.trim() || 'Rack A · Shelf 1',
      image: effectiveImage,
      stock: parseInt(stock || '25', 10)
    };

    // Save to store data
    onAddProduct(newProduct);

    // Open printable barcode modal for immediate printing
    setBarcodeModalProduct(newProduct);

    // Reset Form
    setName('');
    setBarcode('');
    setPrice('');
    setMrp('');
    setImage('');
    setUploadedImageFileName('');
    setImageUrlInput('');
    setShelf('Rack A · Shelf 1');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customCatInput.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    setCategory(trimmed);
    setCustomCatInput('');
  };

  // Quick Generator for Unbarcoded items
  const handleGenerateUnbarcodedSticker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unbarcodedName.trim() || !unbarcodedPrice) return;

    const generatedCode = generateValidEan13();
    const parsedPrice = parseFloat(unbarcodedPrice);
    const effectiveImage = unbarcodedImage || createInitialsSvg(unbarcodedName);

    const generatedItem = {
      name: unbarcodedName.trim(),
      barcode: generatedCode,
      category: unbarcodedCat,
      price: parsedPrice,
      mrp: parsedPrice,
      aisle: unbarcodedAisle,
      shelf: 'Bin / Loose Counter',
      image: effectiveImage,
      stock: 50
    };

    onAddProduct(generatedItem);
    setBarcodeModalProduct(generatedItem);

    setUnbarcodedName('');
    setUnbarcodedPrice('');
    setUnbarcodedImage('');
    setUnbarcodedImageName('');
    setShowQuickUnbarcoded(false);
  };

  const selectableCategories = categories.filter((c) => c !== 'All');

  return (
    <div className="flex-1 flex flex-col p-4 animate-fade-in">
      {/* STAFF VIEW 1: INVENTORY DATA ENTRY & BARCODE GENERATOR */}
      {staffTab === 'inventory' && (
        <div className="flex-1 flex flex-col">
          {/* Header Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 mb-3 flex items-center justify-between shadow-xs">
            <div>
              <h2 className="text-xs font-bold text-amber-950">Store Inventory & Barcode Entry</h2>
              <p className="text-[11px] text-amber-800">
                Add barcodes and upload real photos. Barcodes scan directly into customer carts!
              </p>
            </div>
            <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
              <span>🔒</span> STAFF AUTH
            </span>
          </div>

          {/* QUICK TOOL: GENERATE BARCODE STICKER FOR UNBARCODED ITEMS */}
          <div className="bg-slate-900 text-white rounded-2xl p-3 mb-3 shadow-md border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Generate Barcode for Loose / Unbarcoded Items</span>
                    <span className="text-[9px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-400/30">
                      JsBarcode
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Creates scan-ready barcode stickers that add directly to carts at self-checkout.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickUnbarcoded(!showQuickUnbarcoded)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700 transition"
              >
                {showQuickUnbarcoded ? 'Close Tool' : '+ New Sticker'}
              </button>
            </div>

            {showQuickUnbarcoded && (
              <form
                onSubmit={handleGenerateUnbarcodedSticker}
                className="mt-3 pt-3 border-t border-slate-800 space-y-2.5 animate-fade-in"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                      Unbarcoded Item Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Loose Kashmiri Apples (1kg) / Artisan Loaf"
                      value={unbarcodedName}
                      onChange={(e) => setUnbarcodedName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                      Price in ₹ *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 180"
                      value={unbarcodedPrice}
                      onChange={(e) => setUnbarcodedPrice(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400 text-white font-bold"
                      required
                    />
                  </div>
                </div>

                {/* Optional Image Upload for Loose Item */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                    Upload Loose Item Photo (Optional)
                  </label>
                  <input
                    ref={unbarcodedFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUnbarcodedImageChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => unbarcodedFileInputRef.current?.click()}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>{unbarcodedImageName ? 'Change Photo' : 'Select / Take Photo'}</span>
                    </button>
                    {unbarcodedImageName && (
                      <span className="text-[10px] text-amber-300 truncate max-w-[180px]">
                        ✓ {unbarcodedImageName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={unbarcodedCat}
                      onChange={(e) => setUnbarcodedCat(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded-xl text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                      Store Aisle
                    </label>
                    <select
                      value={unbarcodedAisle}
                      onChange={(e) => setUnbarcodedAisle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded-xl text-slate-200"
                    >
                      <option value="Aisle 1">Aisle 1 (Produce & Dairy)</option>
                      <option value="Aisle 2">Aisle 2 (Bakery & Tea)</option>
                      <option value="Aisle 3">Aisle 3 (Snacks)</option>
                      <option value="Aisle 4">Aisle 4 (Loose Staples)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-extrabold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Barcode & Display Printable Sticker</span>
                </button>
              </form>
            )}
          </div>

          {/* CUSTOM CATEGORY MANAGER */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Custom Categories</span>
              </label>
              <span className="text-[10px] text-amber-800">{selectableCategories.length} Categories</span>
            </div>

            <form onSubmit={handleCreateNewCategory} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Organic, Bakery, Health Drinks..."
                value={customCatInput}
                onChange={(e) => setCustomCatInput(e.target.value)}
                className="flex-1 bg-white border border-amber-300 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
              {selectableCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 bg-white border border-amber-200 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded-lg"
                >
                  <span>{cat}</span>
                  {![
                    'Dairy & Eggs',
                    'Instant Food',
                    'Beverages',
                    'Bakery & Biscuits',
                    'Cooking Essentials',
                    'Personal Care'
                  ].includes(cat) && (
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(cat)}
                      className="text-slate-400 hover:text-rose-600 ml-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* MAIN INVENTORY ENTRY FORM */}
          <form
            onSubmit={handleFormSubmit}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
          >
            {/* Title */}
            <div>
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Product Title & Brand *
              </label>
              <input
                type="text"
                placeholder="e.g. Cadbury Dairy Milk Silk Chocolate (150g)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                required
              />
            </div>

            {/* Barcode & Category */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    Barcode / UPC Code *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomBarcode}
                    className="text-[9px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-0.5 bg-amber-100/70 px-1.5 py-0.2 rounded"
                    title="Generate standard retail barcode"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Gen Code</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Enter or scan barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 mono font-semibold"
                />
                <span className="text-[9px] text-slate-400 mt-0.5 block">
                  Scanned codes go straight to cart!
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-2 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                >
                  {selectableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* LIVE BARCODE PREVIEW WITH JSBARCODE */}
            <BarcodeLivePreview
              barcode={barcode}
              name={name}
              price={price ? parseFloat(price) : undefined}
              onOpenPrintModal={() =>
                setBarcodeModalProduct({
                  name: name || 'Product Label',
                  barcode: barcode,
                  price: parseFloat(price || '0'),
                  mrp: parseFloat(mrp || price || '0'),
                  category,
                  aisle,
                  shelf
                })
              }
            />

            {/* Prices */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Store Price in ₹ (Offer) *
                </label>
                <input
                  type="number"
                  placeholder="120"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  MRP in ₹ (Printed on Pack)
                </label>
                <input
                  type="number"
                  placeholder="140"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            {/* REAL IMAGE ENTRY: USER UPLOADS THEIR OWN PHOTO (NO DUMMY PRESETS) */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  <span>Upload Product Image (Your Real Photo)</span>
                </label>
                <span className="text-[9px] text-slate-500 font-medium">Device / Camera Upload</span>
              </div>

              {/* Hidden File Input for Device Files & Camera */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {image ? (
                /* Uploaded Image Preview */
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-emerald-300">
                  <img
                    src={image}
                    alt="Uploaded Product"
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {uploadedImageFileName || 'Custom Uploaded Photo'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      <FileCheck className="w-3 h-3 text-emerald-600" />
                      <span>Ready to save into product data</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                /* Drag & Drop / Click to Upload Box */
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDropImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-amber-400 bg-white rounded-xl p-3.5 text-center cursor-pointer transition group"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-amber-50 group-hover:bg-amber-100 text-amber-700 flex items-center justify-center mb-1.5 transition">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Click to choose photo or take picture
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Supports JPG, PNG, WEBP from your phone or computer
                    </span>
                  </div>
                </div>
              )}

              {/* Or paste web URL */}
              <div className="mt-2 pt-2 border-t border-slate-200">
                <input
                  type="text"
                  placeholder="Or paste an image link (e.g. https://...)"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    if (e.target.value.startsWith('http')) {
                      setImage(e.target.value);
                    }
                  }}
                  className="w-full bg-white border border-slate-200 text-[11px] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500 font-mono text-slate-700"
                />
              </div>
            </div>

            {/* Store Location Coordinates */}
            <div className="grid grid-cols-2 gap-2 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
              <div>
                <label className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                  Store Aisle *
                </label>
                <select
                  value={aisle}
                  onChange={(e) => setAisle(e.target.value)}
                  className="w-full bg-white border border-amber-300 text-xs px-2 py-1.5 rounded-lg focus:outline-none font-semibold"
                >
                  <option value="Aisle 1">Aisle 1 (Dairy & Produce)</option>
                  <option value="Aisle 2">Aisle 2 (Brews & Tea)</option>
                  <option value="Aisle 3">Aisle 3 (Snacks)</option>
                  <option value="Aisle 4">Aisle 4 (Grains & Oils)</option>
                  <option value="Aisle 5">Aisle 5 (Hygiene)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                  Shelf Location *
                </label>
                <input
                  type="text"
                  placeholder="Rack B, Shelf 2"
                  value={shelf}
                  onChange={(e) => setShelf(e.target.value)}
                  className="w-full bg-white border border-amber-300 text-xs px-2 py-1.5 rounded-lg focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Save Product to Catalog (Ready for Scan-to-Cart)</span>
            </button>
          </form>

          {/* Current Inventory Count Table WITH PRINT BARCODE ACTION */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-amber-600" />
                <span>Store Catalog & Barcode Scanner Test ({products.length})</span>
              </span>
              <span className="text-[10px] text-slate-400">Tap ⚡ Scan to test cart</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between shadow-xs hover:border-amber-300 transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-100"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[190px]">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        <span className="font-semibold text-amber-700">{p.category}</span> · ₹{p.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* INSTANT TEST SCAN BUTTON: Scans directly into customer cart! */}
                    {onTestScanBarcode && (
                      <button
                        type="button"
                        onClick={() => onTestScanBarcode(p.barcode)}
                        className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-1 rounded-lg text-[10px] font-bold active:scale-95 transition shadow-2xs"
                        title="Scan this barcode directly into cart"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Scan to Cart</span>
                      </button>
                    )}

                    {/* PRINT BARCODE STICKER BUTTON */}
                    <button
                      type="button"
                      onClick={() => setBarcodeModalProduct(p)}
                      className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded-lg text-[10px] font-bold active:scale-95 transition shadow-2xs"
                      title="Display & Print Barcode Label (JsBarcode)"
                    >
                      <Printer className="w-3 h-3 text-amber-700" />
                      <span>Label</span>
                    </button>

                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      title="Remove product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STAFF VIEW 2: REQUEST MANAGEMENT */}
      {staffTab === 'requests' && (
        <div className="flex-1 flex flex-col">
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl mb-3 flex items-center justify-between shadow-md">
            <div>
              <h2 className="text-xs font-bold">Customer Restock Queue</h2>
              <p className="text-[10px] text-slate-400">
                Click "Restocked" to trigger instant customer SMS notification.
              </p>
            </div>
            <span className="text-xs font-black bg-rose-500 text-white px-2 py-0.5 rounded-full font-mono">
              {requests.filter((r) => r.status === 'PENDING').length} Pending
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 max-h-[calc(100vh-230px)]">
            {requests.map((req) => (
              <div
                key={req.id}
                className={`p-3.5 rounded-2xl border transition ${
                  req.status === 'AVAILABLE'
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {req.category} · {req.timestamp}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-0.5">{req.itemName}</h3>
                    <p className="mono text-[11px] text-slate-600 mt-1">
                      📱 Customer: {req.customerPhone}
                    </p>
                    {req.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">"{req.notes}"</p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      req.status === 'AVAILABLE'
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                {req.status === 'PENDING' ? (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Mark restocked in shelf</span>
                    <button
                      onClick={() => onRestockNotify(req.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Notify Customer Restocked</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Notification Dispatched to customer handset.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISPLAYABLE & PRINTABLE BARCODE MODAL (JsBarcode) */}
      {barcodeModalProduct && (
        <PrintableBarcodeModal
          product={barcodeModalProduct}
          onClose={() => setBarcodeModalProduct(null)}
          onBarcodeScanned={onTestScanBarcode}
        />
      )}
    </div>
  );
};
