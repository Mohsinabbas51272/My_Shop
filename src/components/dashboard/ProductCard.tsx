import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingBag, ShoppingCart } from 'lucide-react';
import { calculateDynamicPrice, convertTolaToGrams } from '../../lib/pricing';
import { toast } from '../../store/useToastStore';
import { IMAGE_BASE_URL } from '../../lib/api';

interface ProductCardProps {
    product: any;
    index: number;
    setSelectedProduct: (product: any) => void;
    isInWishlist: (id: number) => boolean;
    toggleItem: (product: any) => void;
    goldRate: any;
    silverRate: any;
    formatPrice: (price: number) => string;
    unit: string;
    toggleUnit: () => void;
    addItem: (product: any) => void;
    navigate: (path: string) => void;
    silverLoading: boolean;
    goldLoading: boolean;
    rates: any;
}

const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/400';
    if (url.startsWith('http')) return url;
    return `${IMAGE_BASE_URL}${url}`;
};

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    index,
    setSelectedProduct,
    isInWishlist,
    toggleItem,
    goldRate,
    silverRate,
    formatPrice,
    unit,
    toggleUnit,
    addItem,
    navigate,
    silverLoading,
    goldLoading,
    rates
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
            onClick={() => setSelectedProduct(product)}
            className="luxury-card group cursor-pointer"
        >
            <div className="luxury-image-container">
                <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                />
                {product.occasion && product.occasion !== 'Other' && (
                    <div className="luxury-badge">
                        {product.occasion}
                    </div>
                )}
                <button
                    className="absolute top-4 left-4 p-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white hover:text-red-500 transition-all z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        const wasInWishlist = isInWishlist(product.id);
                        toggleItem(product);
                        if (wasInWishlist) {
                            toast.success('Removed from Wishlist');
                        } else {
                            toast.success('Added to Wishlist');
                        }
                    }}
                >
                    <Heart className={`w-4.5 h-4.5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
            </div>

            <div className="luxury-info">
                <div className="flex items-center justify-between mb-1">
                    <span className="luxury-collection-tag text-[9px] font-black tracking-[0.2em] text-[var(--text-muted)] uppercase opacity-60">
                        {product.category} Collection
                    </span>
                    {product.reviews?.length > 0 && (
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => {
                                const rating = product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length;
                                return (
                                    <Star
                                        key={i}
                                        className={`w-2 h-2 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                    />
                                );
                            })}
                            <span className="text-[7px] font-bold text-[var(--text-muted)] ml-0.5">
                                ({product.reviews.length})
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="luxury-name line-clamp-1 !mb-0">
                        {product.name}
                    </h3>
                    <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest shrink-0 ${product.category === 'Silver' ? 'luxury-silver-pill' : 'luxury-gold-pill'}`}>
                        {product.category === 'Silver' ? '925 Silver' : '24K Gold'}
                    </div>
                </div>

                <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 mb-3 leading-relaxed italic opacity-80">
                    {product.description || 'No description available'}
                </p>

                <div className="flex flex-col gap-3 mt-auto">
                    <div className="flex items-center justify-between">
                        <div className="luxury-price">
                            {rates?.gold && rates?.gold !== 0 ? (
                                product.category === 'Silver'
                                    ? formatPrice(calculateDynamicPrice(product, silverRate))
                                    : formatPrice(calculateDynamicPrice(product, goldRate))
                            ) : (
                                <div className="h-8 w-28 bg-[var(--bg-input)] animate-pulse rounded-lg" />
                            )}
                        </div>

                        {(product.weightTola > 0 || product.weightMasha > 0 || product.weightRati > 0) && (
                            <div className="flex flex-col items-end">
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleUnit();
                                    }}
                                    className="text-[10px] font-black text-[var(--primary)] bg-[var(--primary)]/5 px-2 py-1 rounded-lg border border-[var(--primary)]/10 cursor-pointer hover:bg-[var(--primary)]/10 transition-colors"
                                    title={`Switch to ${unit === 'GRAMS' ? 'Tola' : 'Grams'}`}
                                >
                                    {unit === 'TMR'
                                        ? `${product.weightTola > 0 ? product.weightTola + 'T ' : ''}${product.weightMasha > 0 ? product.weightMasha + 'M ' : ''}${product.weightRati > 0 ? product.weightRati + 'R' : ''}`.trim()
                                        : `${convertTolaToGrams(product.weightTola, product.weightMasha, product.weightRati).toFixed(3)}g`
                                    }
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const rate = product.category === 'Silver' ? silverRate : goldRate;
                                const calculatedPrice = calculateDynamicPrice(product, rate);
                                addItem({ ...product, price: calculatedPrice });
                                navigate('/checkout');
                            }}
                            disabled={(product.category === 'Silver' ? silverLoading : goldLoading)}
                            className="flex-1 bg-[var(--primary)] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-[var(--primary)]/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Buy
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const rate = product.category === 'Silver' ? silverRate : goldRate;
                                const calculatedPrice = calculateDynamicPrice(product, rate);
                                addItem({ ...product, price: calculatedPrice });
                                toast.success('Added to Bag');
                            }}
                            disabled={(product.category === 'Silver' ? silverLoading : goldLoading)}
                            className="p-3 bg-[var(--bg-input)] hover:bg-[var(--border)] text-[var(--text-main)] rounded-xl border border-[var(--border)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
                            title="Add to Cart"
                        >
                            <ShoppingCart className="w-4.5 h-4.5 group-hover:text-[var(--primary)]" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
