import { Product, ItemRequest } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    barcode: "8901030383792",
    name: "Amul Taaza Homogenised Toned Milk (1L)",
    brand: "Amul",
    category: "Dairy & Eggs",
    price: 74,
    mrp: 78,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80",
    aisle: "Aisle 1",
    shelf: "Rack A · Shelf 2 (Cold Chiller)",
    stock: 35
  },
  {
    id: "prod-2",
    barcode: "8901491101838",
    name: "Maggi 2-Minute Masala Noodles (Pack of 4)",
    brand: "Nestlé Maggi",
    category: "Instant Food",
    price: 56,
    mrp: 60,
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80",
    aisle: "Aisle 3",
    shelf: "Rack C · Shelf 4 (Snacks Row)",
    stock: 48
  },
  {
    id: "prod-3",
    barcode: "8901725181222",
    name: "Tata Tea Gold Royal Assam Leaf (500g)",
    brand: "Tata Tea",
    category: "Beverages",
    price: 295,
    mrp: 340,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80",
    aisle: "Aisle 2",
    shelf: "Rack B · Shelf 1 (Hot Brews)",
    stock: 22
  },
  {
    id: "prod-4",
    barcode: "8901063012720",
    name: "Britannia Good Day Butter Cookies (200g)",
    brand: "Britannia",
    category: "Bakery & Biscuits",
    price: 45,
    mrp: 50,
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80",
    aisle: "Aisle 3",
    shelf: "Rack A · Shelf 3 (Sweet Bakes)",
    stock: 60
  },
  {
    id: "prod-5",
    barcode: "8906007280018",
    name: "Fortune Sunlite Refined Sunflower Oil (1L)",
    brand: "Fortune",
    category: "Cooking Essentials",
    price: 135,
    mrp: 155,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80",
    aisle: "Aisle 4",
    shelf: "Rack D · Shelf 1 (Oils & Grains)",
    stock: 18
  },
  {
    id: "prod-6",
    barcode: "8901207000130",
    name: "Dettol Original Liquid Handwash (900ml Refill)",
    brand: "Dettol",
    category: "Personal Care",
    price: 179,
    mrp: 209,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    aisle: "Aisle 5",
    shelf: "Rack B · Shelf 2 (Hygiene Bay)",
    stock: 25
  },
  {
    id: "prod-7",
    barcode: "8901058852928",
    name: "Cadbury Dairy Milk Silk Chocolate (150g)",
    brand: "Cadbury",
    category: "Bakery & Biscuits",
    price: 165,
    mrp: 180,
    image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&auto=format&fit=crop&q=80",
    aisle: "Aisle 3",
    shelf: "Rack B · Shelf 2 (Confectionery)",
    stock: 40
  },
  {
    id: "prod-8",
    barcode: "8901725134112",
    name: "Himalayan Pink Rock Salt (1kg Pouch)",
    brand: "Tata Catch",
    category: "Cooking Essentials",
    price: 85,
    mrp: 99,
    image: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&auto=format&fit=crop&q=80",
    aisle: "Aisle 4",
    shelf: "Rack A · Shelf 1 (Spices & Salts)",
    stock: 30
  }
];

export const INITIAL_REQUESTS: ItemRequest[] = [
  {
    id: "req-101",
    itemName: "Epigamia Greek Yogurt Strawberry (120g)",
    customerPhone: "+91 98765 43210",
    category: "Dairy & Eggs",
    timestamp: "10 mins ago",
    status: "PENDING"
  },
  {
    id: "req-102",
    itemName: "Avocado Hass Imported (Pack of 2)",
    customerPhone: "+91 98200 12345",
    category: "Fresh Produce",
    timestamp: "25 mins ago",
    status: "PENDING"
  }
];

export const CATEGORIES = [
  'All',
  'Dairy & Eggs',
  'Instant Food',
  'Beverages',
  'Bakery & Biscuits',
  'Cooking Essentials',
  'Personal Care'
];

/**
 * Synthesizes a high-frequency retail POS scanner beep via Web Audio API
 */
export function playScannerBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, ctx.currentTime); // 2.4kHz crystal beep
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Audio might be blocked by browser policy until user gesture
  }
}
