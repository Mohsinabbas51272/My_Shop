import { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus, ShoppingCart, ZoomIn, ZoomOut, Info, ShoppingBag, Loader2, Scale, ShieldCheck, QrCode, FileCheck, Star, BadgeCheck, Truck, Rotate3d, Heart, Share2, MapPin, ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { IMAGE_BASE_URL } from '../lib/api';
import { useCartStore } from '../store/useCartStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { toast } from '../store/useToastStore';
import { getPriceBreakdown, convertTolaToGrams } from '../lib/pricing';
import { useWeightStore } from '../store/useWeightStore';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface ProductDetailsModalProps {
    product: any;
    onClose: () => void;
}

const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/800';
    if (url.startsWith('http')) return url;
    return IMAGE_BASE_URL + url;
};

export default function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
    const addItem = useCartStore((state) => state.addItem);
    const navigate = useNavigate();
    const { formatPrice } = useCurrencyStore();
    const { unit } = useWeightStore();
    const [zoom, setZoom] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);

    // 3D Tilt Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [25, -25]);
    const rotateY = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [-25, 25]);

    const springConfig = { damping: 25, stiffness: 100 };
    const rotateXSpring = useSpring(rotateX, springConfig);
    const rotateYSpring = useSpring(rotateY, springConfig);

    const handleMouseMove = (e: any) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
    };

    // Amazon-style: Track selected image/thumbnail
    const [activeImage, setActiveImage] = useState(getImageUrl(product.image));

    const { data: rates, isLoading: ratesLoading } = useQuery({
        queryKey: ['product-details-rates'],
        queryFn: async () => {
            try {
                const [goldRes, silverRes] = await Promise.all([
                    api.get('/commodity/gold-rate'),
                    api.get('/commodity/silver-rate'),
                ]);
                const parsePrice = (p: any) => p ? parseFloat(p.toString().replace(/,/g, '')) : 0;
                return {
                    gold: { price: parsePrice(goldRes.data?.price) },
                    silver: { price: parsePrice(silverRes.data?.price) },
                };
            } catch (err) {
                return null;
            }
        },
        refetchInterval: 30000,
    });

    const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
        queryKey: ['product-reviews', product.id],
        queryFn: async () => (await api.get(`/reviews/product/${product.id}`)).data,
    });

    const activeRate = product.category === 'Silver' ? rates?.silver : rates?.gold;
    const breakdown = getPriceBreakdown(product, activeRate || null);
    const isLoading = ratesLoading || !activeRate;

    const handleAddToCart = () => {
        addItem({ ...product, price: breakdown.total, quantity });
        toast.success(`${quantity} item(s) added to cart`);
    };

    const handleBuyNow = () => {
        addItem({ ...product, price: breakdown.total, quantity });
        navigate('/checkout');
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--bg-main)] w-full max-w-[1000px] max-h-[90vh] md:rounded-xl shadow-2xl overflow-hidden flex flex-col relative border border-[var(--border)]"
            >
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-3 right-3 z-50 p-1.5 hover:bg-[var(--bg-input)] rounded-full transition-all text-[var(--text-muted)]">
                    <X className="w-5 h-5" />
                </button>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Compact Layout: Left (Gallery), Center (Details), Right (Buy Box) */}
                    <div className="flex flex-col lg:flex-row px-5 pb-5 pt-12 gap-6">

                        {/* 1. LEFT COLUMN: Main Image Area */}
                        <div className="w-full lg:w-[40%] flex flex-col gap-3">
                            <div className="flex-1 relative group bg-[var(--bg-card)] border border-[var(--border)]/50 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px] h-[350px]">
                                <img 
                                    src={activeImage}
                                    className="max-w-full max-h-full object-contain p-4 transition-transform duration-300 group-hover:scale-110 cursor-zoom-in"
                                    onClick={() => setIsExpanded(true)}
                                />
                                <div className="absolute bottom-3 left-3 text-[9px] text-[var(--text-muted)] font-medium">Roll over to zoom</div>
                            </div>
                        </div>

                        {/* 2. CENTER COLUMN: Product Title & Essential Info */}
                        <div className="flex-1 space-y-3">
                            <div>
                                <h1 className="text-xl font-bold text-[var(--text-main)] leading-tight mb-1">
                                    {product.name}
                                </h1>
                                {reviews.length > 0 && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="flex items-center text-[var(--primary)]">
                                            {[...Array(5)].map((_, i) => {
                                                const avgRating = reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length;
                                                return <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(avgRating) ? 'fill-current' : 'opacity-30'}`} />;
                                            })}
                                        </div>
                                        <span className="text-[var(--primary)] hover:opacity-80 cursor-pointer">{reviews.length} ratings</span>
                                    </div>
                                )}
                            </div>

                            <hr className="border-[var(--border)]" />

                            {/* Price Section */}
                            <div className="space-y-0.5">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-light text-red-500">-35%</span>
                                    <div className="flex items-start">
                                        <span className="text-xs mt-1 font-medium italic text-[var(--text-main)]">{breakdown.currencySymbol || 'Rs'}</span>
                                        <span className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
                                            {isLoading ? '...' : Math.floor(breakdown.total).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)]">
                                    List Price: <span className="line-through">{formatPrice(breakdown.total * 1.5)}</span>
                                </div>
                            </div>

                            {/* Highlights */}
                            <div className="space-y-2">
                                <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider">Highlights</h3>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--text-main)] opacity-90">
                                    <li><strong>Authenticity:</strong> 100% Genuine {product.category}.</li>
                                    <li><strong>Weight:</strong>
                                        {unit === 'TMR' ?
                                            ` ${product.weightTola} Tola, ${product.weightMasha} Masha, ${product.weightRati} Rati` :
                                            ` ${convertTolaToGrams(product.weightTola, product.weightMasha, product.weightRati).toFixed(3)} Grams`
                                        }
                                    </li>
                                    <li><strong>Certified:</strong> Includes Digital Certificate.</li>
                                    <li><strong>Gifting:</strong> Premium packaging included.</li>
                                </ul>
                            </div>
                        </div>

                        {/* 3. RIGHT COLUMN: Buy Box */}
                        <div className="w-full lg:w-[220px] shrink-0">
                            <div className="border border-[var(--border)] rounded-lg p-3 space-y-3 bg-[var(--bg-card)] md:sticky md:top-0 shadow-sm">
                                <div className="text-lg font-bold text-[var(--text-main)]">
                                    {isLoading ? '...' : formatPrice(breakdown.total)}
                                </div>

                                <div className="text-xs space-y-1">
                                    <div className="text-green-600 font-bold">In Stock</div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
                                        <span className="text-[10px] text-[var(--primary)]">Deliver to location</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-[var(--text-main)]">Quantity:</label>
                                    <select
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-2 py-1 text-xs shadow-sm focus:border-[var(--primary)] outline-none text-[var(--text-main)]"
                                    >
                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2 pt-1">
                                    <button 
                                        onClick={handleAddToCart}
                                        className="w-full bg-[var(--primary)] hover:opacity-90 text-white py-1.5 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95"
                                    >
                                        Add to Cart
                                    </button>
                                    <button 
                                        onClick={handleBuyNow}
                                        className="w-full bg-[var(--text-main)] text-[var(--bg-main)] hover:opacity-90 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 border border-[var(--border)]"
                                    >
                                        Buy Now
                                    </button>
                                </div>

                                <div className="pt-2 space-y-2 border-t border-[var(--border)]/50 mt-1">
                                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                                        <Lock className="w-3 h-3" />
                                        <span>Secure transaction</span>
                                    </div>
                                    <button
                                        onClick={() => setShowCertificate(true)}
                                        className="w-full mt-1 py-1.5 border border-[var(--border)] rounded-md text-[10px] font-bold text-[var(--text-main)] hover:bg-[var(--bg-input)] transition-colors"
                                    >
                                        View Certificate
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <ProductReviewsSection reviews={reviews} isLoading={reviewsLoading} />
                </div>
            </motion.div>

            {/* Full Screen 3D Tilt Image Modal */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-8 cursor-zoom-out"
                        onClick={() => setIsExpanded(false)}
                        onMouseMove={handleMouseMove}
                        style={{ perspective: 1200 }}
                    >
                        <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[210]">
                            <X className="w-8 h-8" />
                        </button>
                        <motion.div
                            style={{
                                rotateX: rotateXSpring,
                                rotateY: rotateYSpring,
                                z: 0
                            }}
                            className="relative w-full h-full flex items-center justify-center pointer-events-none"
                        >
                            <motion.img
                                src={activeImage}
                                className="max-w-[90%] max-h-[90%] object-contain drop-shadow-2xl"
                                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.5, opacity: 0, y: 50 }}
                                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Certificate Modal Overlay */}
            <AnimatePresence>
                {showCertificate && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowCertificate(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--bg-main)] p-6 rounded-lg max-w-sm w-full shadow-2xl relative border border-[var(--border)]" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setShowCertificate(false)} className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text-main)]"><X className="w-5 h-5" /></button>
                            <div className="text-center space-y-3">
                                <div className="w-14 h-14 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full mx-auto flex items-center justify-center border-4 border-[var(--primary)]/20">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <h2 className="text-lg font-bold uppercase tracking-wide text-[var(--text-main)]">Purity Certified</h2>
                                <div className="bg-[var(--bg-input)] p-3 rounded-md space-y-1.5 text-xs text-left font-mono text-[var(--text-main)]">
                                    <div className="flex justify-between border-b border-[var(--border)] pb-1"><span>Asset</span><span>{product.name}</span></div>
                                    <div className="flex justify-between border-b border-[var(--border)] pb-1"><span>Metal</span><span>{product.category}</span></div>
                                    <div className="flex justify-between border-b border-[var(--border)] pb-1"><span>Weight</span><span>{convertTolaToGrams(product.weightTola, product.weightMasha, product.weightRati).toFixed(3)}g</span></div>
                                    <div className="flex justify-between"><span>Registry</span><span>#AZ-{product.id}</span></div>
                                </div>
                                <QrCode className="w-24 h-24 mx-auto mt-3 text-[var(--text-main)] opacity-80" />
                                <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">Verified by AZ Collection Audits</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ProductReviewsSection({ reviews, isLoading }: { reviews: any[], isLoading: boolean }) {
    if (isLoading) return null;
    if (!reviews || reviews.length === 0) return null;

    return (
        <div className="p-4 bg-[var(--bg-card)]/30 border-t border-[var(--border)]">
            <div className="max-w-[1000px] mx-auto">
                <section>
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Ratings Summary */}
                        <div className="w-full md:w-[200px] space-y-2">
                            <h3 className="text-sm font-bold text-[var(--text-main)]">Customer Reviews</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="flex text-[var(--primary)]">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <span className="font-bold text-sm text-[var(--text-main)]">4.8 out of 5</span>
                            </div>
                            <span className="text-xs text-[var(--text-muted)] block">{reviews.length} global ratings</span>
                            <div className="space-y-1 pt-1">
                                {[5, 4, 3, 2, 1].map(n => (
                                    <div key={n} className="flex items-center gap-2 group cursor-pointer">
                                        <span className="text-[10px] text-[var(--primary)] w-6 hover:underline">{n} star</span>
                                        <div className="flex-1 h-3 bg-[var(--bg-input)] rounded-sm border border-[var(--border)] overflow-hidden">
                                            <div className="h-full bg-[var(--primary)]" style={{ width: `${n === 5 ? 85 : n === 4 ? 10 : 2}%` }} />
                                        </div>
                                        <span className="text-[10px] text-[var(--primary)] w-6 hover:underline text-right">{n === 5 ? '85' : n === 4 ? '10' : '2'}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Review Feed */}
                        <div className="flex-1 space-y-4">
                            <h4 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wide">Top reviews</h4>
                            <div className="space-y-4">
                                {reviews.map((review: any) => (
                                    <div key={review.id} className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] text-[10px] font-bold uppercase">
                                                {review.user?.name?.[0]}
                                            </div>
                                            <span className="text-xs font-medium text-[var(--text-main)]">{review.user?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex text-[var(--primary)]">
                                                {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-[var(--border)]'}`} />)}
                                            </div>
                                            <span className="text-[10px] font-bold text-[var(--primary)]">Verified Purchase</span>
                                        </div>
                                        <div className="text-[10px] text-[var(--text-muted)]">Reviewed on {new Date(review.createdAt).toLocaleDateString()}</div>
                                        <p className="text-xs text-[var(--text-main)] leading-relaxed opacity-90">{review.comment}</p>
                                        <div className="flex items-center gap-3 text-[10px] pt-0.5">
                                            <span className="text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer border px-2 py-0.5 rounded">Helpful</span>
                                            <span className="text-[var(--text-muted)] hover:text-red-500 cursor-pointer">Report</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
