import React, { useState, useEffect, useMemo } from 'react';
import {
  Product,
  CartItem,
  ExitPass,
  ItemRequest,
  ToastInfo,
  CustomerTab,
  StaffTab,
  AppRole,
  TransactionDetails
} from './types';
import { INITIAL_PRODUCTS, INITIAL_REQUESTS, CATEGORIES, playScannerBeep } from './data/initialData';
import { Header } from './components/Header';
import { ScannerView } from './components/ScannerView';
import { CatalogView } from './components/CatalogView';
import { CartView } from './components/CartView';
import { ExitPassView } from './components/ExitPassView';
import { RequestItemView } from './components/RequestItemView';
import { StaffPortal } from './components/StaffPortal';
import { ProductModal } from './components/ProductModal';
import { BottomNav } from './components/BottomNav';
import { StaffLoginModal } from './components/StaffLoginModal';
import { PaymentModal } from './components/PaymentModal';
import { NotFoundBarcodeModal } from './components/NotFoundBarcodeModal';

export default function App() {
  // App Role & Active Views
  const [appRole, setAppRole] = useState<AppRole>('customer');
  const [custTab, setCustTab] = useState<CustomerTab>('scan');
  const [staffTab, setStaffTab] = useState<StaffTab>('inventory');

  // Staff Authentication
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(false);
  const [showStaffLoginModal, setShowStaffLoginModal] = useState<boolean>(false);

  // Store Inventory & Customer Missing Item Requests
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('swiftscan_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('swiftscan_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return CATEGORIES;
      }
    }
    return CATEGORIES;
  });

  const [requests, setRequests] = useState<ItemRequest[]>(() => {
    const saved = localStorage.getItem('swiftscan_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_REQUESTS;
      }
    }
    return INITIAL_REQUESTS;
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('swiftscan_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('swiftscan_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('swiftscan_requests', JSON.stringify(requests));
  }, [requests]);

  // Cart State (Max 20 Items Constraint)
  const [cart, setCart] = useState<CartItem[]>([]);

  // Payment Gateway Modal State (UPI & Net Banking)
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  // Exit Pass & Countdown Timer
  const [exitPass, setExitPass] = useState<ExitPass | null>(null);
  const [exitSeconds, setExitSeconds] = useState<number>(300);

  // Scanned Modal
  const [scannedProductModal, setScannedProductModal] = useState<Product | null>(null);

  // Barcode Not Found Modal State (Requirement 9)
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);

  // Manual input focus trigger in ScannerView
  const [manualFocusTrigger, setManualFocusTrigger] = useState<number>(0);

  // Barcode prefill for Staff Portal
  const [prefilledBarcodeForStaff, setPrefilledBarcodeForStaff] = useState<string>('');

  // Toast Notification
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Item request prefill
  const [requestPrefill, setRequestPrefill] = useState<string>('');

  const triggerToast = (msg: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.msg === msg ? null : prev));
    }, 3400);
  };

  // Category management (User Request: "in staff category i want to add i like one")
  const handleAddCategory = (newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      triggerToast(`Category "${trimmed}" already exists.`, 'warning');
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    triggerToast(`Added new category "${trimmed}"!`);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (catToDelete === 'All') return;
    const updated = categories.filter((c) => c !== catToDelete);
    setCategories(updated);
    triggerToast(`Removed category "${catToDelete}".`);
  };

  // 5-Minute Pure Timer Logic for Exit Pass
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (exitPass && exitSeconds > 0) {
      interval = setInterval(() => {
        setExitSeconds((prev) => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [exitPass, exitSeconds]);

  // Cart Computations
  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.qty, 0),
    [cart]
  );
  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.qty, 0),
    [cart]
  );
  const cartSavings = useMemo(
    () => cart.reduce((acc, item) => acc + (item.mrp - item.price) * item.qty, 0),
    [cart]
  );

  // Toggle role with staff authentication
  const handleToggleRole = () => {
    if (appRole === 'customer') {
      if (isStaffAuthenticated) {
        setAppRole('staff');
        triggerToast('Switched to Staff Portal');
      } else {
        setShowStaffLoginModal(true);
      }
    } else {
      setAppRole('customer');
      triggerToast('Switched to Customer Mode');
    }
  };

  const handleStaffLoginSuccess = () => {
    setIsStaffAuthenticated(true);
    setShowStaffLoginModal(false);
    setAppRole('staff');
    triggerToast('Staff authentication verified! Welcome to Staff Portal.');
  };

  const handleStaffLogout = () => {
    setIsStaffAuthenticated(false);
    setAppRole('customer');
    triggerToast('Locked and logged out of Staff Portal.');
  };

  // Add to Cart with Max 20 Items Limit
  const handleAddToCart = (product: Product, qtyToAdd: number = 1): boolean => {
    if (cartCount + qtyToAdd > 20) {
      triggerToast('Cart limit reached! Max 20 items allowed for quick exit checks.', 'warning');
      return false;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === product.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qtyToAdd } : i
        );
      } else {
        return [...prevCart, { ...product, qty: qtyToAdd }];
      }
    });

    playScannerBeep();
    triggerToast(`Added ${product.name.slice(0, 22)}... to cart!`);
    return true;
  };

  // Update Cart Quantity
  const handleUpdateCartQty = (productId: string, delta: number) => {
    if (delta > 0 && cartCount >= 20) {
      triggerToast('Maximum 20 items per checkout for security pass!', 'warning');
      return;
    }

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  // Scan Action (from Camera, Photo Capture, or Manual Lookup)
  const handleBarcodeScan = (barcodeToScan: string) => {
    playScannerBeep();
    const cleanCode = barcodeToScan.trim();
    if (!cleanCode) return;

    // Requirement 6: Search existing product catalog using barcode
    const found = products.find(
      (p) =>
        p.barcode === cleanCode ||
        p.barcode.endsWith(cleanCode) ||
        cleanCode.endsWith(p.barcode) ||
        p.barcode.replace(/\D/g, '') === cleanCode.replace(/\D/g, '')
    );

    if (found) {
      // Requirement 7 & 8: Display Product Details with Add to Cart button
      setScannedProductModal(found);
      setNotFoundBarcode(null);
      triggerToast(`✓ Barcode Match: ${found.name} (₹${found.price})`);
    } else {
      // Requirement 9: Show "Barcode detected, but product not found." modal
      setNotFoundBarcode(cleanCode);
      setScannedProductModal(null);
    }
  };

  // UPI & Banking Checkout Trigger
  const handleStartCheckout = () => {
    if (cart.length === 0) {
      triggerToast('Your cart is empty! Scan an item first.', 'warning');
      return;
    }
    setShowPaymentModal(true);
  };

  // Payment Success Handler
  const handlePaymentSuccess = (transaction: TransactionDetails) => {
    const passData: ExitPass = {
      passCode: `SWIFT-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(
        65 + Math.floor(Math.random() * 26)
      )}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      totalAmount: cartTotal,
      itemCount: cartCount,
      storeName: 'SwiftScan Metro Flagship · Store #402',
      validUntil: Date.now() + 300 * 1000,
      transaction
    };

    setExitPass(passData);
    setExitSeconds(300);
    setCart([]);
    setShowPaymentModal(false);
    setCustTab('pass');
    playScannerBeep();
    triggerToast('✓ Payment approved via UPI! Tax bill & 5-min exit pass generated.');
  };

  // Reset pass
  const handleResetPass = () => {
    setExitPass(null);
    setCustTab('scan');
  };

  // Customer Request Submission
  const handleSubmitRequest = (requestData: Omit<ItemRequest, 'id' | 'timestamp' | 'status'>) => {
    const newReq: ItemRequest = {
      id: `req-${Date.now()}`,
      ...requestData,
      timestamp: 'Just now',
      status: 'PENDING'
    };

    setRequests([newReq, ...requests]);
    triggerToast('Request logged! We will SMS notify you when restocked.');
    setCustTab('search');
  };

  const handleRequestMissingItem = (itemName: string) => {
    setRequestPrefill(itemName);
    setCustTab('request');
  };

  // Staff Operations
  const handleAddProduct = (newProdData: Omit<Product, 'id'>) => {
    const newP: Product = {
      id: `prod-${Date.now()}`,
      ...newProdData
    };
    setProducts([newP, ...products]);
    triggerToast(`Added "${newP.name.slice(0, 20)}" to Store Catalog!`);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    triggerToast('Product removed from catalog.');
  };

  const handleRestockNotify = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return { ...r, status: 'AVAILABLE', notifiedAt: 'Now' };
        }
        return r;
      })
    );
    triggerToast('SMS sent to customer: Item is now Restocked at Shelf!');
  };

  return (
    <div className="bg-slate-900 flex justify-center items-start min-h-screen p-0 sm:py-6 sm:px-4">
      <div
        id="app-container"
        className="w-full max-w-[430px] min-h-screen bg-slate-50 relative flex flex-col shadow-2xl sm:rounded-[36px] overflow-hidden border-0 sm:border-8 sm:border-slate-800"
      >
        {/* TOP GLOBAL BAR & ROLE SWITCHER */}
        <Header
          appRole={appRole}
          onToggleRole={handleToggleRole}
          staffTab={staffTab}
          onSelectStaffTab={setStaffTab}
          requests={requests}
          onStaffLogout={handleStaffLogout}
        />

        {/* PURE CSS TOAST NOTIFICATION */}
        {toast && (
          <div className="fixed top-14 left-0 right-0 z-50 px-4 pointer-events-none">
            <div
              className={`pure-css-toast mx-auto max-w-sm rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2.5 text-xs font-semibold border ${
                toast.type === 'error'
                  ? 'bg-rose-900/95 text-rose-100 border-rose-700'
                  : toast.type === 'warning'
                  ? 'bg-amber-900/95 text-amber-100 border-amber-700'
                  : 'bg-emerald-900/95 text-emerald-100 border-emerald-700'
              }`}
            >
              <span>
                {toast.type === 'error' ? '⚠️' : toast.type === 'warning' ? '⚡' : '✅'}
              </span>
              <span className="flex-1">{toast.msg}</span>
            </div>
          </div>
        )}

        {/* CUSTOMER VIEWS */}
        {appRole === 'customer' && (
          <main className="flex-1 flex flex-col pb-20 overflow-y-auto">
            {custTab === 'scan' && (
              <ScannerView
                cartCount={cartCount}
                products={products}
                categories={categories}
                onScanBarcode={handleBarcodeScan}
                onShowProductInfo={setScannedProductModal}
                onAddToCart={handleAddToCart}
                isModalOpen={Boolean(scannedProductModal || notFoundBarcode || showPaymentModal || showStaffLoginModal)}
                manualFocusTrigger={manualFocusTrigger}
              />
            )}

            {custTab === 'search' && (
              <CatalogView
                products={products}
                categories={categories}
                onAddToCart={handleAddToCart}
                onShowProductInfo={setScannedProductModal}
                onRequestMissingItem={handleRequestMissingItem}
              />
            )}

            {custTab === 'cart' && (
              <CartView
                cart={cart}
                cartCount={cartCount}
                cartTotal={cartTotal}
                cartSavings={cartSavings}
                onUpdateCartQty={handleUpdateCartQty}
                onCheckout={handleStartCheckout}
                onNavigateToScan={() => setCustTab('scan')}
              />
            )}

            {custTab === 'pass' && (
              <ExitPassView
                exitPass={exitPass}
                exitSeconds={exitSeconds}
                onResetPass={handleResetPass}
              />
            )}

            {custTab === 'request' && (
              <RequestItemView
                requests={requests}
                initialItemName={requestPrefill}
                onSubmitRequest={handleSubmitRequest}
              />
            )}

            {/* CUSTOMER BOTTOM NAVIGATION BAR */}
            <BottomNav
              currentTab={custTab}
              onSelectTab={setCustTab}
              cartCount={cartCount}
            />
          </main>
        )}

        {/* STAFF PORTAL */}
        {appRole === 'staff' && (
          <main className="flex-1 flex flex-col overflow-y-auto pb-6">
            <StaffPortal
              staffTab={staffTab}
              products={products}
              categories={categories}
              requests={requests}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onRestockNotify={handleRestockNotify}
              onTestScanBarcode={(code) => {
                setAppRole('customer');
                setCustTab('scan');
                handleBarcodeScan(code);
              }}
              prefilledBarcode={prefilledBarcodeForStaff}
            />
          </main>
        )}

        {/* PRODUCT SCAN OVERLAY MODAL (Requirement 7 & 8) */}
        <ProductModal
          product={scannedProductModal}
          cartQty={cart.find((c) => c.id === scannedProductModal?.id)?.qty || 0}
          onClose={() => setScannedProductModal(null)}
          onAddToCart={(product) => {
            handleAddToCart(product, 1);
          }}
          onViewCart={() => {
            setScannedProductModal(null);
            setCustTab('cart');
          }}
        />

        {/* NOT FOUND BARCODE MODAL (Requirement 9) */}
        {notFoundBarcode && (
          <NotFoundBarcodeModal
            barcode={notFoundBarcode}
            onClose={() => setNotFoundBarcode(null)}
            onEnterManual={() => {
              setNotFoundBarcode(null);
              setCustTab('scan');
              setManualFocusTrigger(Date.now());
            }}
            onAddNewProduct={(barcode) => {
              setNotFoundBarcode(null);
              setPrefilledBarcodeForStaff(barcode);
              setAppRole('staff');
              setStaffTab('inventory');
              triggerToast(`Staff Portal: Enter details for barcode ${barcode}`);
            }}
          />
        )}

        {/* UPI & NET BANKING PAYMENT MODAL */}
        {showPaymentModal && (
          <PaymentModal
            totalAmount={cartTotal}
            totalSavings={cartSavings}
            itemCount={cartCount}
            onClose={() => setShowPaymentModal(false)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {/* STAFF AUTHENTICATION MODAL */}
        <StaffLoginModal
          isOpen={showStaffLoginModal}
          onClose={() => setShowStaffLoginModal(false)}
          onSuccess={handleStaffLoginSuccess}
        />
      </div>
    </div>
  );
}

