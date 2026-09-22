export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  mrp: number;
  image: string;
  aisle: string;
  shelf: string;
  stock: number;
}

export interface CartItem extends Product {
  qty: number;
}

export interface TransactionDetails {
  transactionId: string;
  utrNumber: string;
  paymentMethod: 'UPI_APP' | 'UPI_QR' | 'UPI_ID' | 'NET_BANKING';
  providerName: string;
  payerVpaOrAccount: string;
  status: 'SUCCESS' | 'SETTLED';
  authCode: string;
  npciRef: string;
  timestamp: string;
  invoiceNumber: string;
  gstin: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  savings: number;
  totalPaid: number;
}

export interface ExitPass {
  passCode: string;
  createdAt: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  storeName: string;
  validUntil: number; // timestamp
  transaction?: TransactionDetails;
}

export interface ItemRequest {
  id: string;
  itemName: string;
  category: string;
  customerPhone: string;
  notes?: string;
  timestamp: string;
  status: 'PENDING' | 'AVAILABLE';
  notifiedAt?: string;
}

export interface ToastInfo {
  msg: string;
  type?: 'success' | 'warning' | 'error';
  id: number;
}

export type CustomerTab = 'scan' | 'search' | 'cart' | 'pass' | 'request';
export type StaffTab = 'inventory' | 'requests';
export type AppRole = 'customer' | 'staff';
