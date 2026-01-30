import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface WishlistState {
    items: Product[];
    toggleItem: (product: Product) => void;
    clearWishlist: () => void;
    isInWishlist: (id: number) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            toggleItem: (product: Product) => {
                const items = get().items;
                const exists = items.find((item) => item.id === product.id);
                if (exists) {
                    set({ items: items.filter((item) => item.id !== product.id) });
                } else {
                    set({ items: [...items, product] });
                }
            },
            clearWishlist: () => set({ items: [] }),
            isInWishlist: (id: number) => {
                return get().items.some((item) => item.id === id);
            },
        }),
        {
            name: 'wishlist-storage',
        }
    )
);
