import { create } from 'zustand';

export type SortOption = 'newest' | 'price_asc' | 'price_desc';
export type MetalCategory = 'Gold' | 'Silver';

interface SearchState {
    q: string;
    sort: SortOption;
    minPrice: string;
    maxPrice: string;
    metalCategory: MetalCategory;
    occasion: string;
    setQ: (q: string) => void;
    setSort: (sort: SortOption) => void;
    setMinPrice: (minPrice: string) => void;
    setMaxPrice: (maxPrice: string) => void;
    setMetalCategory: (category: MetalCategory) => void;
    setOccasion: (occasion: string) => void;
    resetFilters: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
    q: '',
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
    metalCategory: 'Gold',
    occasion: 'All',
    setQ: (q) => set({ q }),
    setSort: (sort) => set({ sort }),
    setMinPrice: (minPrice) => set({ minPrice }),
    setMaxPrice: (maxPrice) => set({ maxPrice }),
    setMetalCategory: (metalCategory) => set({ metalCategory }),
    setOccasion: (occasion) => set({ occasion }),
    resetFilters: () => set({
        q: '',
        sort: 'newest',
        minPrice: '',
        maxPrice: '',
        metalCategory: 'Gold',
        occasion: 'All',
    }),
}));
