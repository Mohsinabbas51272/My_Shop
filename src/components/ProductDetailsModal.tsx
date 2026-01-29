import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, ZoomIn, ZoomOut, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api, { IMAGE_BASE_URL } from '../lib/api';
import { useCartStore } from '../store/useCartStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { getPriceBreakdown } from '../lib/pricing';

interface ProductDetailsModalProps {
    product: any;
    onClose: () => void;
}

export default function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
    const addItem = useCartStore((state) => state.addItem);
    const { formatPrice } = useCurrencyStore();
    const [zoom, setZoom] = useState(1);
    const [quantity, setQuantity] = useState(1);

    const { data: goldRate, isLoading: goldLoading } = useQuery({
        queryKey: ['gold-rate'],
        queryFn: async () => (await api.get('/commodity/gold-rate')).data,
    });

    const { data: silverRate, isLoading: silverLoading } = useQuery({
        queryKey: ['silver-rate'],
        queryFn: async () => (await api.get('/commodity/silver-rate')).data,
    });

    const breakdown = getPriceBreakdown(product, product.category === 'Silver' ? silverRate : goldRate);

    const getImageUrl = (url: string) => {
        if (!url) return 'https://via.placeholder.com/800';
        if (url.startsWith('http')) return url;
        return `${IMAGE_BASE_URL}${url}`;
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 1));

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addItem({ ...product, price: breakdown.total });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-[var(--bg-main)]/90 backdrop-blur-md">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] rounded-3xl md:rounded-[2.5rem] overflow-y-auto md:overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-2 bg-[var(--bg-main)]/50 hover:bg-red-500 text-[var(--text-main)] hover:text-white rounded-full transition-all backdrop-blur-md border border-[var(--border)]"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-3/5 h-[40vh] md:h-auto bg-[var(--bg-input)]/50 relative overflow-hidden flex items-center justify-center group">
                    <div
                        className="w-full h-full transition-transform duration-300 ease-out flex items-center justify-center"
                        style={{ transform: `scale(${zoom})` }}
                    >
                        <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border)] p-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={handleZoomOut} className="p-2 hover:bg-[var(--bg-input)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]">
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-bold w-12 text-center text-[var(--text-main)]">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button onClick={handleZoomIn} className="p-2 hover:bg-[var(--bg-input)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]">
                            <ZoomIn className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="w-full md:w-2/5 p-6 md:p-12 flex flex-col justify-center bg-[var(--bg-card)]">
                    <div className="mb-8">
                        <span className="inline-block px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[var(--primary)]/20 mb-4">
                            Premium Collection
                        </span>
                        <h2 className="text-2xl md:text-4xl font-black text-[var(--text-main)] mb-3 md:mb-4 leading-tight">
                            {product.name}
                        </h2>
                        <div className="flex flex-col gap-2 mb-4 md:mb-6">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl md:text-3xl font-bold text-[var(--primary)]">
                                    {product.category === 'Silver'
                                        ? (silverLoading ? 'Price Loading...' : formatPrice(breakdown.total))
                                        : (goldLoading ? 'Price Loading...' : formatPrice(breakdown.total))
                                    }
                                </span>
                                <span className="text-xs md:text-sm text-[var(--text-muted)] line-through opacity-50">
                                    {product.category === 'Silver'
                                        ? (silverLoading ? '---' : formatPrice(breakdown.total * 1.5))
                                        : (goldLoading ? '---' : formatPrice(breakdown.total * 1.5))
                                    }
                                </span>
                            </div>
                            {breakdown.goldValue > 0 && !goldLoading && !silverLoading && (
                                <div className="p-3 bg-[var(--bg-input)] rounded-xl border border-[var(--border)] space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">
                                        <Info className="w-3 h-3" />
                                        Market Price Breakdown
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">{product.category === 'Silver' ? 'Silver' : 'Gold'} Value</p>
                                            <p className="text-sm font-bold text-[var(--text-main)]">{formatPrice(breakdown.goldValue)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Making Charges</p>
                                            <p className="text-sm font-bold text-[var(--text-main)]">{formatPrice(breakdown.makingCharges)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {(product.weightTola > 0 || product.weightMasha > 0 || product.weightRati > 0) && (
                            <div className="flex gap-2 mb-6">
                                {product.weightTola > 0 && (
                                    <div className="px-3 py-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg text-xs font-bold text-[var(--text-main)]">
                                        {product.weightTola} TOLA
                                    </div>
                                )}
                                {product.weightMasha > 0 && (
                                    <div className="px-3 py-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg text-xs font-bold text-[var(--text-main)]">
                                        {product.weightMasha} MASHA
                                    </div>
                                )}
                                {product.weightRati > 0 && (
                                    <div className="px-3 py-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg text-xs font-bold text-[var(--text-main)]">
                                        {product.weightRati} RATI
                                    </div>
                                )}
                            </div>
                        )}
                        <p className="text-[var(--text-muted)] leading-relaxed text-base md:text-lg">
                            {product.description || "Indulge in the perfect blend of style and substance. This meticulously crafted item represents the pinnacle of our design philosophy, offering both exceptional performance and timeless aesthetic appeal for the modern enthusiast."}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl overflow-hidden p-1">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-3 hover:bg-[var(--bg-card)] text-[var(--text-muted)] transition-colors"
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <span className="w-12 text-center font-bold text-lg text-[var(--text-main)]">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-3 hover:bg-[var(--bg-card)] text-[var(--text-muted)] transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] md:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-0.5 md:mb-1">Subtotal</p>
                                <p className="text-lg md:text-xl font-bold text-[var(--text-main)]">{formatPrice(breakdown.total * quantity)}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.category === 'Silver' ? silverLoading : goldLoading}
                            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-[var(--accent-glow)] flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {(product.category === 'Silver' ? silverLoading : goldLoading) ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <ShoppingCart className="w-6 h-6" />
                            )}
                            {(product.category === 'Silver' ? silverLoading : goldLoading) ? 'Price Loading...' : 'Add to Shopping Bag'}
                        </button>

                        <div className="flex items-center justify-center gap-8 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-50">
                            <div className="flex items-center gap-2">
                                <BadgeCheck className="w-4 h-4" /> 100% Authentic
                            </div>
                            <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4" /> Global Shipping
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BadgeCheck({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

function Truck({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
            <path d="M15 18H9" />
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-2.235-2.794A1 1 0 0 0 18.765 9.5H15" />
            <path d="M15 15h7" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
        </svg>
    );
}
