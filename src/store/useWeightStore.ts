import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WeightUnit = 'TMR' | 'GRAMS';

interface WeightState {
    unit: WeightUnit;
    setUnit: (unit: WeightUnit) => void;
    toggleUnit: () => void;
}

export const useWeightStore = create<WeightState>()(
    persist(
        (set) => ({
            unit: 'GRAMS',
            setUnit: (unit) => set({ unit }),
            toggleUnit: () => set((state) => ({ unit: state.unit === 'TMR' ? 'GRAMS' : 'TMR' })),
        }),
        {
            name: 'weight-storage-v2',
        }
    )
);
