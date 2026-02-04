import { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, ZoomIn, ZoomOut, Info, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { IMAGE_BASE_URL } from '../lib/api';
import { useCartStore } from '../store/useCartStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { toast } from '../store/useToastStore';
import { getPriceBreakdown } from '../lib/pricing';

interface ProductDetailsModalProps {
    product: any;
    onClose: () => void;
}

export default function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
    const addItem = useCartStore((state) => state.addItem);
    const navigate = useNavigate();
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
        return IMAGE_BASE_URL + url;
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 1));

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addItem({ ...product, price: breakdown.total });
        }
        toast.success(quantity + " item(s) added to Shopping Bag!");
        onClose();
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 bg-[var(--bg-main)]/95 backdrop-blur-md">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-5xl h-full md:h-[90vh] rounded-t-[2rem] md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-8 md:right-8 z-[160] p-2 bg-[var(--bg-card)]/80 hover:bg-red-500 text-[var(--text-main)] hover:text-white rounded-full transition-all backdrop-blur-md border border-[var(--border)] shadow-xl"
                >
                    <X className="w-5 h-5 md:w-6 h-6" />
                </button>

                {/* Left: Image Box */}
                <div className="w-full md:w-[55%] h-[45vh] md:h-full bg-[var(--bg-input)] relative overflow-hidden flex items-center justify-center group shrink-0">
                    <div
                        className="w-full h-full transition-transform duration-500 ease-out"
                        style={{ transform: `scale(${zoom})` }}
                    >
                        <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Zoom Overlay Controls - Hidden on very small screens for simplicity */}
                    <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border)] p-2 rounded-2xl opacity-0 md:group-hover:opacity-100 transition-all shadow-2xl">
                        <button onClick={handleZoomOut} className="p-2 hover:bg-[var(--bg-input)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                            <ZoomOut className="w-4 h-4 md:w-5 h-5" />
                        </button>
                        <div className="h-4 w-px bg-[var(--border)] mx-1" />
                        <span className="text-[10px] font-black w-12 md:w-14 text-center text-[var(--text-main)] uppercase tracking-widest">
                            {Math.round(zoom * 100)}%
                        </span>
                        <div className="h-4 w-px bg-[var(--border)] mx-1" />
                        <button onClick={handleZoomIn} className="p-2 hover:bg-[var(--bg-input)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                            <ZoomIn className="w-4 h-4 md:w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Right: Content Section */}
                <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-card)] relative">
                    {/* Scrollable Body */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                        <div className="p-5 md:p-6 space-y-4">
                            {/* Header Info */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-[var(--primary)]/20">
                                        Premium Collection
                                    </span>
                                </div>
                                <h2 className="text-lg md:text-xl font-black text-[var(--text-main)] mb-2 leading-tight tracking-tight">
                                    {product.name}
                                </h2>
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-black text-[var(--primary)]">
                                        {formatPrice(breakdown.total)}
                                    </span>
                                    <span className="text-sm text-[var(--text-muted)] font-bold line-through opacity-40">
                                        {formatPrice(breakdown.total * 1.5)}
                                    </span>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="p-4 bg-[var(--bg-input)]/50 rounded-2xl border border-[var(--border)] space-y-3 shadow-sm">
                                <div className="flex items-center gap-2 text-[9px] font-black text-[var(--primary)] uppercase tracking-[0.2em]">
                                    <Info className="w-3.5 h-3.5" />
                                    Pricing Breakdown
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] text-[var(--text-muted)] uppercase font-black tracking-widest mb-1">Metal Value</p>
                                        <p className="text-[12px] font-black text-[var(--text-main)]">{formatPrice(breakdown.goldValue)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-[var(--text-muted)] uppercase font-black tracking-widest mb-1">Craftsmanship</p>
                                        <p className="text-[12px] font-black text-[var(--text-main)]">{formatPrice(breakdown.makingCharges)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Weights */}
                            {(product.weightTola > 0 || product.weightMasha > 0 || product.weightRati > 0) && (
                                <div className="flex flex-wrap gap-2">
                                    {product.weightTola > 0 && <span className="px-2 py-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg text-[9px] font-black text-[var(--text-main)] uppercase tracking-wider">{product.weightTola} TOLA</span>}
                                    {product.weightMasha > 0 && <span className="px-2 py-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg text-[9px] font-black text-[var(--text-main)] uppercase tracking-wider">{product.weightMasha} MASHA</span>}
                                    {product.weightRati > 0 && <span className="px-2 py-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg text-[9px] font-black text-[var(--text-main)] uppercase tracking-wider">{product.weightRati} RATI</span>}
                                </div>
                            )}

                            {/* Description */}
                            <p className="text-[var(--text-muted)] leading-relaxed text-[12px] md:text-[13px] font-medium">
                                {product.description || "Indulge in the perfect blend of style and substance..."}
                            </p>

                            {/* Badges */}
                            <div className="flex items-center gap-6 pt-2 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-60">
                                <div className="flex items-center gap-1.5">
                                    <BadgeCheck className="w-3.5 h-3.5 text-green-500" /> 100% Authentic
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Truck className="w-3.5 h-3.5 text-blue-500" /> Global Shipping
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 md:p-5 bg-[var(--bg-card)] border-t border-[var(--border)]/50 mt-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                        <div className="flex flex-row items-center justify-between gap-4 mb-3">
                            <div className="flex items-center bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl p-1 shrink-0">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-1.5 hover:bg-[var(--bg-card)] text-[var(--text-muted)] rounded-xl transition-all active:scale-90"
                                >
                                    <Minus className="w-3 h-3 md:w-3.5 h-3.5" />
                                </button>
                                <span className="w-6 md:w-8 text-center font-black text-xs md:text-sm text-[var(--text-main)]">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-1.5 hover:bg-[var(--bg-card)] text-[var(--text-muted)] rounded-xl transition-all active:scale-90"
                                >
                                    <Plus className="w-3 h-3 md:w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-0.5">Subtotal</p>
                                <p className="text-md md:text-lg font-black text-[var(--primary)]">{formatPrice(breakdown.total * quantity)}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    for (let i = 0; i < quantity; i++) addItem({ ...product, price: breakdown.total });
                                    navigate('/checkout');
                                }}
                                disabled={product.category === 'Silver' ? silverLoading : goldLoading}
                                className="flex-1 h-11 md:h-12 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black rounded-2xl transition-all shadow-lg shadow-[var(--primary)]/10 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-[9px]"
                            >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Buy Now
                            </button>
                            <button
                                onClick={handleAddToCart}
                                disabled={product.category === 'Silver' ? silverLoading : goldLoading}
                                className="w-11 md:w-12 h-11 md:h-12 bg-[var(--bg-input)] hover:bg-[var(--border)] text-[var(--text-main)] rounded-2xl transition-all border border-[var(--border)] flex items-center justify-center active:scale-95 disabled:opacity-50"
                            >
                                <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
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
