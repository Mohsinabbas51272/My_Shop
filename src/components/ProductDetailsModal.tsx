import { useState, useEffect, useRef } from 'react';
import { X, QrCode, Star, Lock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { IMAGE_BASE_URL } from '../lib/api';
import { useCartStore } from '../store/useCartStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { toast } from '../store/useToastStore';
import { getPriceBreakdown, convertTolaToGrams } from '../lib/pricing';

import { motion, AnimatePresence } from 'framer-motion';

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

    const [quantity, setQuantity] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);

    // Magnifier State
    const activeImage = getImageUrl(product.image);
    const [showMagnifier, setShowMagnifier] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [lensProps, setLensProps] = useState({ x: 0, y: 0, show: false });
    const [zoomProps, setZoomProps] = useState({ x: 0, y: 0 });

    // Config: Compact Modal = Better View
    const ZOOM_LEVEL = 1.3;

    // We'll use state to store the exact dimensions of the image container to match the pane size
    const [paneDimensions, setPaneDimensions] = useState({ width: 0, height: 0 });

    // Remove any traces of thumbnails logic (const thumbnails = ... is gone)

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
                    gold: { price: parsePrice(goldRes.data?.price), currency: 'PKR', unit: 'Tola', purity: '24K' },
                    silver: { price: parsePrice(silverRes.data?.price), currency: 'PKR', unit: 'Tola', purity: '999' },
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

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || !imgRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const { left, top, width, height } = rect;

        // update pane dimensions on move (or could do on enter) to ensure sync
        if (width !== paneDimensions.width || height !== paneDimensions.height) {
            setPaneDimensions({ width, height });
        }

        let x = e.pageX - left - window.scrollX;
        let y = e.pageY - top - window.scrollY;

        // Lens Dimensions - matches the pane size / zoom level
        // Since pane size now equals image container size (width/height), the lens size is container / zoom
        const lensWidth = width / ZOOM_LEVEL;
        const lensHeight = height / ZOOM_LEVEL;

        let lensX = x - lensWidth / 2;
        let lensY = y - lensHeight / 2;

        if (lensX < 0) lensX = 0;
        if (lensY < 0) lensY = 0;
        if (lensX > width - lensWidth) lensX = width - lensWidth;
        if (lensY > height - lensHeight) lensY = height - lensHeight;

        setLensProps({ x: lensX, y: lensY, show: true });

        const bgX = -lensX * ZOOM_LEVEL;
        const bgY = -lensY * ZOOM_LEVEL;

        setZoomProps({ x: bgX, y: bgY });
    };

    const handleAddToCart = () => {
        addItem({ ...product, price: breakdown.total, quantity });
        toast.success(`${quantity} item(s) added to cart`);
    };

    const handleBuyNow = () => {
        addItem({ ...product, price: breakdown.total, quantity });
        navigate('/checkout');
    };

    // Ref to track if we have a pushed lightbox history entry
    const lightboxHistoryPushed = useRef(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        if (isExpanded) {
            // Push history state when lightbox opens
            window.history.pushState({ lightbox: true }, '');
            lightboxHistoryPushed.current = true;
        } else if (lightboxHistoryPushed.current) {
            // Lightbox closed via click (not back button) — pop the orphaned state
            lightboxHistoryPushed.current = false;
            window.history.back();
        }

        // Handle Back button for lightbox
        const handlePopState = () => {
            if (isExpanded) {
                lightboxHistoryPushed.current = false; // Mark as consumed by back button
                setIsExpanded(false);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isExpanded]);

    const discountPercentage = 9;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-hidden"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 300,
                    mass: 0.8
                }}
                // Reduced max-w from 5xl to 4xl for even more compact modal
                className="bg-[var(--bg-main)] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border border-[var(--border)]"
            >
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-[var(--text-main)]/10 hover:bg-[var(--text-main)]/20 rounded-full transition-all text-[var(--text-main)] hover:text-red-400 backdrop-blur-md border border-[var(--border)]">
                    <X className="w-5 h-5" />
                </button>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col lg:flex-row h-full">

                        {/* 1. LEFT COLUMN: Main Image Box - Full Width/Height Logic */}
                        <div className="w-full lg:w-[50%] bg-[var(--bg-input)]/20 relative flex items-start justify-center">

                            <div
                                ref={containerRef}
                                className="relative w-full h-full min-h-[500px] flex items-center justify-center group cursor-zoom-in select-none bg-[var(--bg-card)] overflow-hidden border-r border-[var(--border)]"
                                onMouseEnter={() => setShowMagnifier(true)}
                                onMouseLeave={() => { setShowMagnifier(false); setLensProps(p => ({ ...p, show: false })); }}
                                onMouseMove={handleMouseMove}
                                onClick={() => setIsExpanded(true)}
                            >
                                {/* Discount Badge Removed */}

                                <img 
                                    ref={imgRef}
                                    src={activeImage}
                                    // Use object-cover to stretch to corners as requested
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    alt={product.name}
                                />

                                {/* LENS Tracker */}
                                {showMagnifier && lensProps.show && (
                                    <div
                                        className="absolute border border-[var(--primary)] bg-[var(--primary)]/5 pointer-events-none hidden lg:block rounded-sm"
                                        style={{
                                            left: lensProps.x,
                                            top: lensProps.y,
                                            width: `${paneDimensions.width / ZOOM_LEVEL}px`,
                                            height: `${paneDimensions.height / ZOOM_LEVEL}px`,
                                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.05)', // Creates a dimming effect outside lens
                                            zIndex: 20
                                        }}
                                    />
                                )}

                                {/* MOBILE INDICATOR */}
                                <div className="absolute bottom-4 right-4 lg:hidden bg-[var(--bg-main)]/80 p-2 rounded-full shadow-lg border border-[var(--border)]">
                                    <QrCode className="w-5 h-5 text-[var(--primary)]" />
                                </div>

                                {/* ZOOM PANE (Magnifier) - Fixed Position to escape overflow */}
                                <AnimatePresence>
                                    {showMagnifier && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: -10, scale: 0.95 }}
                                            className="hidden lg:block fixed z-[9999] bg-[var(--bg-main)] border border-[var(--border)] shadow-2xl rounded-xl overflow-hidden pointer-events-none"
                                            style={{
                                                width: `${paneDimensions.width}px`,
                                                height: `${paneDimensions.height}px`,
                                                // Calculate position dynamically to sit right next to the image
                                                left: containerRef.current ? containerRef.current.getBoundingClientRect().right + 10 : 0,
                                                top: containerRef.current ? containerRef.current.getBoundingClientRect().top : 0,

                                                backgroundImage: `url(${activeImage})`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: `${paneDimensions.width * ZOOM_LEVEL}px ${paneDimensions.height * ZOOM_LEVEL}px`,
                                                backgroundPosition: `${zoomProps.x}px ${zoomProps.y}px`
                                            }}
                                        >
                                            <div className="absolute top-2 right-2 text-[10px] font-black text-white bg-[var(--primary)] px-2 py-0.5 rounded shadow border border-white/20">
                                                {ZOOM_LEVEL}X
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* 2. RIGHT COLUMN: Information - Compact Layout */}
                        <div className="w-full lg:w-[50%] p-3 lg:p-4 flex flex-col gap-3">

                            <div>
                                <h1 className="text-xl lg:text-2xl font-black text-[var(--text-main)] mb-1 leading-tight font-serif tracking-tight">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <div className="flex text-amber-500">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'fill-current' : 'opacity-20'}`} />)}
                                    </div>
                                    <span className="text-[var(--text-muted)] text-xs font-bold hover:text-[var(--primary)] cursor-pointer transition-colors border-l border-[var(--border)] pl-3">
                                        {reviews.length} VERIFIED REVIEWS
                                    </span>
                                </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-[var(--border)] to-transparent w-full opacity-50" />

                            {/* PRICE BLOCK - Scaled Down */}
                            <div className="space-y-1">
                                <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">Investment Value</div>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-black text-[var(--primary)] tracking-tighter leading-none">
                                        {isLoading ? '...' : formatPrice(breakdown.total)}
                                    </span>
                                    {!isLoading && (
                                        <span className="text-lg text-[var(--text-muted)] line-through opacity-40 font-bold mb-1">
                                            {formatPrice(breakdown.total / (1 - discountPercentage / 100))}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <span className="text-[10px] text-green-600 font-black bg-green-50 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1 uppercase shadow-sm">
                                        <Lock className="w-3 h-3" /> Secure Insured Pricing
                                    </span>
                                </div>
                            </div>

                            {/* SPECIFICATIONS GRID - Compact */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="group p-2 bg-[var(--bg-input)]/40 rounded-xl border border-[var(--border)] transition-all hover:bg-[var(--bg-card)] hover:shadow-md">
                                    <div className="text-[10px] text-[var(--text-muted)] uppercase font-black mb-0.5 opacity-60">Net Weight</div>
                                    <div className="text-sm font-black text-[var(--text-main)]">
                                        {convertTolaToGrams(product.weightTola, product.weightMasha, product.weightRati).toFixed(3)}<span className="text-[10px] ml-1 opacity-50">G</span>
                                    </div>
                                </div>
                                <div className="group p-2 bg-[var(--bg-input)]/40 rounded-xl border border-[var(--border)] transition-all hover:bg-[var(--bg-card)] hover:shadow-md">
                                    <div className="text-[10px] text-[var(--text-muted)] uppercase font-black mb-0.5 opacity-60">Purity Scale</div>
                                    <div className="text-sm font-black text-[var(--text-main)]">24 KARAT</div>
                                </div>
                            </div>

                            {/* SERVICES - Compact List */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 p-1">
                                    <div className="w-6 h-6 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center shrink-0 border border-[var(--primary)]/20 shadow-sm">
                                        <QrCode className="w-3 h-3 text-[var(--primary)]" />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black text-[var(--text-main)] uppercase tracking-wide">Authenticity Verified</h4>
                                        <p className="text-[9px] text-[var(--text-muted)] font-medium">100% Genuine Hallmarked Jewelry</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-1">
                                    <div className="w-6 h-6 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center shrink-0 border border-[var(--primary)]/20 shadow-sm">
                                        <MapPin className="w-3 h-3 text-[var(--primary)]" />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black text-[var(--text-main)] uppercase tracking-wide">Nationwide Delivery</h4>
                                        <p className="text-[9px] text-[var(--text-muted)] font-medium">Fully Insured Doorstep Shipping</p>
                                    </div>
                                </div>
                            </div>

                            {/* QUANTITY & ACTION - Moved Up */}
                            <div className="mt-auto pt-6 border-t border-[var(--border)] space-y-4">
                                <div className="flex items-center justify-between bg-[var(--bg-input)]/50 p-1.5 rounded-xl border border-[var(--border)] shadow-inner">
                                    <div className="flex items-center gap-1 p-0.5 bg-[var(--bg-main)] rounded-lg shadow-sm border border-[var(--border)]">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-[var(--bg-input)] rounded transition-all text-[var(--text-main)] font-black text-lg"
                                        >-</button>
                                        <span className="w-10 text-center text-xs font-black text-[var(--text-main)]">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-[var(--bg-input)] rounded transition-all text-[var(--text-main)] font-black text-lg"
                                        >+</button>
                                    </div>
                                    <div className="text-right pr-3">
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-green-600 uppercase tracking-tighter">Ready to Ship</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-[var(--bg-main)] border-2 border-[var(--primary)] text-[var(--primary)] font-black py-2.5 rounded-xl hover:bg-[var(--bg-input)] transition-all uppercase text-[10px] tracking-widest active:scale-95"
                                    >
                                        Add to Cart
                                    </button>
                                    <button 
                                        onClick={handleBuyNow}
                                        className="flex-1 bg-[var(--text-main)] text-[var(--bg-main)] font-black py-2.5 rounded-xl hover:opacity-90 transition-all uppercase text-[10px] tracking-widest shadow-xl active:scale-95"
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* DETAILS FOOTER - Compact */}
                    <div className="mt-8 border-t border-[var(--border)]">
                        {/* Collection Story & Features Removed as requested */}
                        <ProductReviewsSection reviews={reviews} isLoading={reviewsLoading} />
                    </div>

                </div>
            </motion.div>

            {/* LIGHTBOX */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-[var(--bg-main)] flex items-center justify-center p-4 lg:p-12 cursor-zoom-out"
                        onClick={() => setIsExpanded(false)}
                    >
                        <button className="absolute top-8 right-8 text-[var(--text-main)] hover:opacity-50 transition-all z-[310] p-3 bg-[var(--bg-input)] rounded-full shadow-xl">
                            <X className="w-8 h-8" />
                        </button>
                        <motion.img
                            src={activeImage}
                            className="max-w-full max-h-full object-contain"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function ProductReviewsSection({ reviews, isLoading }: { reviews: any[], isLoading: boolean }) {
    if (isLoading || !reviews || reviews.length === 0) return null;

    return (
        <div className="px-6 lg:px-10 py-8 border-t border-[var(--border)] bg-[var(--bg-input)]/30 backdrop-blur-xl">
            <h3 className="text-lg font-black text-[var(--text-main)] font-serif italic mb-6">Client Experiences</h3>
            <div className="grid gap-6 md:grid-cols-2">
                {reviews.map((review: any) => (
                    <div key={review.id} className="p-5 bg-[var(--bg-main)]/70 rounded-2xl border border-[var(--border)] shadow-xl shadow-black/5 hover:shadow-black/10 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center font-black text-[var(--primary)] text-xs border border-[var(--primary)]/10 shadow-inner">
                                {review.user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div className="text-xs font-black text-[var(--text-main)] leading-tight">{review.user?.name || 'Verified Customer'}</div>
                                <div className="flex text-amber-500 gap-0.5 mt-0.5">
                                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? 'fill-current' : 'opacity-20'}`} />)}
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] italic font-medium leading-relaxed">"{review.comment}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
