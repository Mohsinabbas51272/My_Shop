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
    const tola = Number(product.weightTola || 0);
    const masha = Number(product.weightMasha || 0);
    const rati = Number(product.weightRati || 0);

    const totalTola = tola + (masha / 12) + (rati / 96);

    // Calculate gold value
    const goldValue = totalTola * ratePerTola;

    // Total = Gold Value + Making Charges
    return Math.round(goldValue + Number(product.price || 0));
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
