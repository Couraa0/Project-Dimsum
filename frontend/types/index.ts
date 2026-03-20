export interface Category {
    _id: string;
    name: string;
    slug: string;
    icon: string;
    description?: string;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: (Category | string)[];
    image: string;
    isBestSeller: boolean;
    isAvailable: boolean;
    stock: number;
    totalOrdered: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
    notes?: string;
}

export interface OrderItemPayload {
    menuItemId: string;
    name: string;
    quantity: number;
    notes?: string;
}

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentMethod = 'transfer' | 'qris' | 'cash';
export type PaymentStatus = 'unpaid' | 'paid';

export interface OrderCustomer {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
}

export interface OrderItem {
    menuItem: string | MenuItem;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    notes?: string;
}

export interface Order {
    _id: string;
    orderNumber: string;
    type: OrderType;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    tableNumber?: string;
    customer: OrderCustomer;
    estimatedTime: number;
    createdAt: string;
    updatedAt: string;
}

export interface Table {
    _id: string;
    number: string;
    name: string;
    capacity: number;
    qrCode: string;
    isActive: boolean;
    status: 'available' | 'occupied' | 'reserved';
    currentOrderId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Admin {
    _id: string;
    name: string;
    email: string;
    role: 'superadmin' | 'admin' | 'kasir';
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
}

export interface DailyReport {
    date: string;
    totalOrders: number;
    totalRevenue: number;
    byType: Record<string, number>;
    topItems: { _id: string; name: string; totalQty: number; totalRevenue: number }[];
}

export interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'user' | 'admin' | 'kasir';
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
}
