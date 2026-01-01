
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'DIRTY';
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI_QR';
export type TableSection = 'Main Hall' | 'Bar' | 'Terrace';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  preparationTime: number; 
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId?: string;
  type: OrderType;
  items: CartItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod?: PaymentMethod;
  createdAt: Date;
  customerName?: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  floor: number;
  section: TableSection;
}

export interface Reservation {
  id: string;
  customerName: string;
  partySize: number;
  tableId: string;
  time: string;
  status: 'PENDING' | 'ARRIVED' | 'CANCELLED';
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
  category: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
  shiftStart: Date;
  performanceScore: number;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  revenue: number;
  active: boolean;
}

export enum AppRoute {
  DASHBOARD = 'DASHBOARD',
  POS = 'POS',
  KDS = 'KDS',
  TABLES = 'TABLES',
  MENU = 'MENU',
  INVENTORY = 'INVENTORY',
  REPORTS = 'REPORTS',
  EMPLOYMENT = 'EMPLOYMENT',
  BRANCHES = 'BRANCHES',
  SETTINGS = 'SETTINGS',
  PROFILE = 'PROFILE'
}
