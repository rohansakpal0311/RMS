
import { MenuItem, Table, InventoryItem } from './types';

export const INITIAL_MENU: MenuItem[] = [
  { id: '1', name: 'Paneer Butter Masala', description: 'Cottage cheese in rich tomato gravy', price: 320, category: 'Main Course', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400', available: true, preparationTime: 20 },
  { id: '2', name: 'Butter Chicken', description: 'Classic smoky tandoori chicken in makhani gravy', price: 380, category: 'Main Course', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400', available: true, preparationTime: 25 },
  { id: '3', name: 'Dal Makhani', description: 'Slow cooked black lentils with cream', price: 280, category: 'Main Course', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400', available: true, preparationTime: 30 },
  { id: '4', name: 'Garlic Naan', description: 'Clay oven baked flatbread with garlic', price: 60, category: 'Breads', image: 'https://images.unsplash.com/photo-1601050690597-df056fb27791?auto=format&fit=crop&w=400', available: true, preparationTime: 5 },
  { id: '5', name: 'Veg Biryani', description: 'Fragrant basmati rice with mixed vegetables', price: 250, category: 'Rice', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=400', available: true, preparationTime: 20 },
  { id: '6', name: 'Masala Dosa', description: 'Crispy rice crepe with potato filling', price: 180, category: 'South Indian', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400', available: true, preparationTime: 12 },
  { id: '7', name: 'Gulab Jamun', description: 'Deep fried milk solids in sugar syrup', price: 120, category: 'Desserts', image: 'https://images.unsplash.com/photo-1589119908995-c6800ffca830?auto=format&fit=crop&w=400', available: true, preparationTime: 5 },
  { id: '8', name: 'Masala Chai', description: 'Indian spiced milk tea', price: 40, category: 'Drinks', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400', available: true, preparationTime: 3 },
];

export const INITIAL_TABLES: Table[] = [
  { id: 't1', number: 1, capacity: 2, status: 'AVAILABLE', floor: 1, section: 'Main Hall' },
  { id: 't2', number: 2, capacity: 4, status: 'AVAILABLE', floor: 1, section: 'Main Hall' },
  { id: 't3', number: 3, capacity: 4, status: 'OCCUPIED', floor: 1, section: 'Main Hall' },
  { id: 't4', number: 4, capacity: 6, status: 'RESERVED', floor: 1, section: 'Bar' },
  { id: 't5', number: 5, capacity: 2, status: 'AVAILABLE', floor: 1, section: 'Bar' },
  { id: 't6', number: 6, capacity: 8, status: 'AVAILABLE', floor: 1, section: 'Terrace' },
  { id: 't7', number: 7, capacity: 4, status: 'DIRTY', floor: 1, section: 'Terrace' },
  { id: 't8', number: 8, capacity: 2, status: 'AVAILABLE', floor: 1, section: 'Terrace' },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Paneer', quantity: 25, unit: 'kg', minStock: 5, category: 'Dairy' },
  { id: 'i2', name: 'Basmati Rice', quantity: 50, unit: 'kg', minStock: 10, category: 'Grains' },
  { id: 'i3', name: 'Butter', quantity: 15, unit: 'kg', minStock: 3, category: 'Dairy' },
  { id: 'i4', name: 'Chicken', quantity: 20, unit: 'kg', minStock: 5, category: 'Meat' },
];
