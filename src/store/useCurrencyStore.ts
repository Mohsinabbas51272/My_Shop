import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CurrencyState {
    currency: 'PKR' | 'USD';
    exchangeRate: number;
    convertPrice: (priceInPkr: number | string) => string;
    formatPrice: (priceInPkr: number | string) => string;
    fetchExchangeRate: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set, get) => ({
            currency: 'PKR',
            exchangeRate: 280,
            setCurrency: (currency: 'PKR' | 'USD') => set({ currency }),
            convertPrice: (priceInPkr: number | string) => {
                const { currency, exchangeRate } = get();
                const numPrice = typeof priceInPkr === 'string'
                    ? parseFloat(priceInPkr.replace(/,/g, ''))
                    : Number(priceInPkr);

                if (isNaN(numPrice)) return '0';

                if (currency === 'USD') {
                    return (numPrice / exchangeRate).toFixed(2);
                }
                return Math.round(numPrice).toLocaleString();
            },
            formatPrice: (priceInPkr: number | string) => {
                const { currency, convertPrice } = get(); // convertPrice handles logic

                // For formatting, we can reuse convertPrice, but need to be careful not to double format
                // Actually convertPrice returns string.
                // But convertPrice logic above returns localized string for PKR.

                const value = convertPrice(priceInPkr);
                return currency === 'USD' ? `$${value}` : `Rs. ${value}`;
            },
            fetchExchangeRate: async () => {
                try {
                    // We need to import api here, or use fetch
                    // Since this is a store, importing api instance might cause circular dep if api uses store?
                    // Usually api imports store (for auth). 
                    // Let's use fetch directly or dynamic import if possible.
                    // Or pass api as dependency?
                    // For now, let's use the BASE_URL from environment or hardcode relative path if proxied.
                    // Frontend usually uses 'http://localhost:5000/api' or relative '/api' in prod.

                    // Helper to find API URL
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                    const res = await fetch(`${API_URL}/commodity/exchange-rate`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.rate) {
                            set({ exchangeRate: data.rate });
                            console.log('Updated Exchange Rate:', data.rate);
                        }
                    }
                } catch (e) {
                    console.error('Failed to fetch exchange rate', e);
                }
            }
        }),
        {
            name: 'currency-storage',
        }
    )
);
