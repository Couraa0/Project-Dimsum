import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, MenuItem, OrderType, PaymentMethod, OrderCustomer } from '@/types';

interface CartStore {
    items: CartItem[];
    orderType: OrderType;
    paymentMethod: PaymentMethod;
    tableNumber: string;
    customer: OrderCustomer;
    addItem: (item: MenuItem) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    updateNote: (itemId: string, note: string) => void;
    clearCart: () => void;
    setOrderType: (type: OrderType) => void;
    setPaymentMethod: (method: PaymentMethod) => void;
    setTableNumber: (number: string) => void;
    setCustomer: (customer: Partial<OrderCustomer>) => void;
    getTotal: () => number;
    getCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            orderType: 'dine-in',
            paymentMethod: 'cash',
            tableNumber: '',
            customer: { name: '', phone: '', address: '', notes: '' },

            addItem: (menuItem) => set((state) => {
                const existing = state.items.find(i => i.menuItem._id === menuItem._id);
                if (existing) {
                    return { items: state.items.map(i => i.menuItem._id === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i) };
                }
                return { items: [...state.items, { menuItem, quantity: 1, notes: '' }] };
            }),

            removeItem: (itemId) => set((state) => ({ items: state.items.filter(i => i.menuItem._id !== itemId) })),

            updateQuantity: (itemId, quantity) => set((state) => {
                if (quantity <= 0) return { items: state.items.filter(i => i.menuItem._id !== itemId) };
                return { items: state.items.map(i => i.menuItem._id === itemId ? { ...i, quantity } : i) };
            }),

            updateNote: (itemId, notes) => set((state) => ({
                items: state.items.map(i => i.menuItem._id === itemId ? { ...i, notes } : i)
            })),

            clearCart: () => set({ items: [], tableNumber: '' }),

            setOrderType: (type) => set({ orderType: type }),
            setPaymentMethod: (method) => set({ paymentMethod: method }),
            setTableNumber: (number) => set({ tableNumber: number }),
            setCustomer: (customer) => set((state) => ({ customer: { ...state.customer, ...customer } })),

            getTotal: () => get().items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),
            getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
        }),
        { name: 'dimsum-ratu-cart' }
    )
);
