import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CurrencyState {
    currency: 'PKR' | 'USD';
    exchangeRate: number;
    setCurrency: (currency: 'PKR' | 'USD') => void;
    convertPrice: (priceInPkr: number) => string;
    formatPrice: (priceInPkr: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set, get) => ({
            currency: 'PKR',
            exchangeRate: 280,
            setCurrency: (currency) => set({ currency }),
            convertPrice: (priceInPkr) => {
                const { currency, exchangeRate } = get();
                if (currency === 'USD') {
                    return (priceInPkr / exchangeRate).toFixed(2);
                }
                return priceInPkr.toString();
            },
            formatPrice: (priceInPkr) => {
                const { currency, convertPrice } = get();
                const value = convertPrice(priceInPkr);
                return currency === 'USD' ? `$${value}` : `Rs. ${value}`;
            },
        }),
        {
            name: 'currency-storage',
        }
    )
);
