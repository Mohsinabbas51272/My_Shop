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
    // 1 Tola = 12 Masha
    // 1 Masha = 8 Rati -> 1 Tola = 96 Rati
    const tola = product.weightTola || 0;
    const masha = product.weightMasha || 0;
    const rati = product.weightRati || 0;

    const totalTola = tola + (masha / 12) + (rati / 96);

    // Calculate gold value
    const goldValue = totalTola * ratePerTola;

    // Total = Gold Value + Making Charges
    return Math.round(goldValue + product.price);
};

export const getPriceBreakdown = (product: ProductWeights, goldRate: GoldRate | null) => {
    if (!goldRate || goldRate.error || !goldRate.price) {
        return { goldValue: 0, makingCharges: product.price, total: product.price };
    }

    const ratePerTola = typeof goldRate.price === 'string'
        ? parseFloat(goldRate.price.replace(/,/g, ''))
        : goldRate.price;

    const totalTola = (product.weightTola || 0) + (product.weightMasha || 0) / 12 + (product.weightRati || 0) / 96;
    const goldValue = Math.round(totalTola * ratePerTola);

    return {
        goldValue,
        makingCharges: Math.round(product.price || 0),
        total: Math.round(goldValue + (product.price || 0))
    };
};
