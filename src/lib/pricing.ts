export interface ProductWeights {
    weightTola?: number;
    weightMasha?: number;
    weightRati?: number;
    price: number; // Making charges / labor
}

export interface GoldRate {
    price: string | number;
    currency: string;
    unit: string;
    purity: string;
    error?: string;
}

export const TOLA_TO_GRAMS = 11.6638038;

export const calculateDynamicPrice = (product: ProductWeights, goldRate: GoldRate | null): number => {
    if (!goldRate || goldRate.error || !goldRate.price) {
        return Math.round(product.price || 0);
    }

    // Parse gold rate price (remove commas if string)
    const ratePerTola = typeof goldRate.price === 'string'
        ? parseFloat(goldRate.price.replace(/,/g, ''))
        : goldRate.price;

    if (isNaN(ratePerTola)) return product.price;

    // Weight conversions:
    const tola = Number(product.weightTola || 0);
    const masha = Number(product.weightMasha || 0);
    const rati = Number(product.weightRati || 0);

    const totalTola = tola + (masha / 12) + (rati / 96);

    // Calculate gold value
    const goldValue = totalTola * ratePerTola;

    // Total = Gold Value + Making Charges
    return Math.round(goldValue + Number(product.price || 0));
};

export const convertTolaToGrams = (tola: number, masha: number, rati: number): number => {
    const totalTola = Number(tola || 0) + (Number(masha || 0) / 12) + (Number(rati || 0) / 96);
    return totalTola * TOLA_TO_GRAMS;
};

export const convertGramsToTola = (grams: number) => {
    const totalTola = Number(grams || 0) / TOLA_TO_GRAMS;
    const tola = Math.floor(totalTola);
    const remainingMasha = (totalTola - tola) * 12;
    const masha = Math.floor(remainingMasha);
    const remainingRati = (remainingMasha - masha) * 8; // Masha to Rati is 8, but some systems use 96 rati per tola. 12 masha * 8 rati = 96.
    const rati = parseFloat(remainingRati.toFixed(2));

    return { tola, masha, rati };
};

export const getPriceBreakdown = (product: ProductWeights, goldRate: GoldRate | null) => {
    if (!goldRate || goldRate.error || !goldRate.price) {
        return { goldValue: 0, makingCharges: Number(product.price || 0), total: Number(product.price || 0) };
    }

    const ratePerTola = typeof goldRate.price === 'string'
        ? parseFloat(goldRate.price.replace(/,/g, ''))
        : Number(goldRate.price);

    const tola = Number(product.weightTola || 0);
    const masha = Number(product.weightMasha || 0);
    const rati = Number(product.weightRati || 0);

    const totalTola = tola + (masha / 12) + (rati / 96);
    const goldValue = Math.round(totalTola * ratePerTola);

    return {
        goldValue,
        makingCharges: Math.round(Number(product.price || 0)),
        total: Math.round(goldValue + Number(product.price || 0))
    };
};
