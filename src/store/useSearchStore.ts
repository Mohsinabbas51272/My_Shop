import { create } from 'zustand';

export type SortOption = 'newest' | 'price_asc' | 'price_desc';
export type MetalCategory = 'Gold' | 'Silver';

interface SearchState {
    q: string;
    sort: SortOption;
    minPrice: string;
    maxPrice: string;
    metalCategory: MetalCategory;
    setQ: (q: string) => void;
    setSort: (sort: SortOption) => void;
    setMinPrice: (minPrice: string) => void;
    setMaxPrice: (maxPrice: string) => void;
    setMetalCategory: (category: MetalCategory) => void;
    resetFilters: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
    q: '',
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
    metalCategory: 'Gold',
    setQ: (q) => set({ q }),
    setSort: (sort) => set({ sort }),
    setMinPrice: (minPrice) => set({ minPrice }),
    setMaxPrice: (maxPrice) => set({ maxPrice }),
    setMetalCategory: (metalCategory) => set({ metalCategory }),
    resetFilters: () => set({
        q: '',
        sort: 'newest',
        minPrice: '',
        maxPrice: '',
        metalCategory: 'Gold',
    }),
}));
