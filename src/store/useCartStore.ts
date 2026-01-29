import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    category?: string;
    weightTola?: number;
    weightMasha?: number;
    weightRati?: number;
}

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    description?: string;
    category?: string;
    weightTola?: number;
    weightMasha?: number;
    weightRati?: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product: Product) => {
                const items = get().items;
                const existing = items.find((item: CartItem) => item.id === product.id);
                if (existing) {
                    set({
                        items: items.map((item: CartItem) =>
                            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                        ),
                    });
                } else {
                    set({ items: [...items, { ...product, quantity: 1 }] });
                }
            },
            removeItem: (id: number) => {
                set({ items: get().items.filter((item: CartItem) => item.id !== id) });
            },
            updateQuantity: (id: number, quantity: number) => {
                if (quantity < 1) return;
                set({
                    items: get().items.map((item: CartItem) =>
                        item.id === id ? { ...item, quantity } : item
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            total: () => {
                return get().items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
