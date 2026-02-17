import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../lib/api';
import { calculateDynamicPrice, convertTolaToGrams } from '../lib/pricing';
import { useWeightStore } from '../store/useWeightStore';
import Navbar from './Navbar';
import ProductDetailsModal from './ProductDetailsModal';
import Policy from './Policy';
import { useCartStore } from '../store/useCartStore';
import { Plus, Loader2, PackageX, ShoppingBag, Receipt, MessageCircle, Gavel, ShieldCheck, File, Heart, ShoppingCart, ShieldAlert, X, Star, Check, FileText, Pencil, XCircle, Trash2, Minus } from 'lucide-react';
import OrderReceipt from './OrderReceipt';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useSearchStore } from '../store/useSearchStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { toast } from '../store/useToastStore';

export default function Dashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { isInWishlist, toggleItem } = useWishlistStore();
    const { addItem } = useCartStore();
    const { formatPrice } = useCurrencyStore();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'shop';
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
    const [disputingOrder, setDisputingOrder] = useState<any>(null);
    const [disputeData, setDisputeData] = useState({ subject: '', message: '', evidence: '' });
    const [uploadingEvidence, setUploadingEvidence] = useState(false);
    const [editFormData, setEditFormData] = useState<any>({ items: [] });
    const [viewingReceipt, setViewingReceipt] = useState<any>(null);
    const [viewingFir, setViewingFir] = useState<any>(null);
    const [reviewingProduct, setReviewingProduct] = useState<any>(null);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '', images: [] as string[] });

    // Shop discovery controls from global store
    const { q, sort, minPrice, maxPrice, metalCategory, setMetalCategory, occasion } = useSearchStore();
    const { unit, toggleUnit } = useWeightStore();
    const [page, setPage] = useState(1);

    const updateItemQuantity = (id: string, delta: number) => {
        setEditFormData((prev: any) => {
            const updatedItems = prev.items.map((item: any) => {
                if (item.id === id) {
                    const newQty = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            });
            return { ...prev, items: updatedItems };
        });
    };

    const removeItemFromEdit = (id: string) => {
        setEditFormData((prev: any) => {
            const updatedItems = prev.items.filter((item: any) => item.id !== id);
            return { ...prev, items: updatedItems };
        });
    };

    useEffect(() => {
        // Reset to first page whenever filters change
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, sort, minPrice, maxPrice, metalCategory, occasion]);

    useEffect(() => {
        if (disputingOrder) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [disputingOrder]);

    const getImageUrl = (url: string) => {
        if (!url) return 'https://via.placeholder.com/400';
        if (url.startsWith('http')) return url;
        return `${IMAGE_BASE_URL}${url}`;
    };

    const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
        queryKey: ['products', q, sort, page, minPrice, maxPrice, metalCategory, occasion],
        queryFn: async () => (
            await api.get('/products', {
                params: {
                    q: q || undefined,
                    sort,
                    page,
                    limit: 24,
                    category: metalCategory,
                    occasion: occasion !== 'All' ? occasion : undefined,
                    minPrice: minPrice ? Number(minPrice) : undefined,
                    maxPrice: maxPrice ? Number(maxPrice) : undefined,
                }
            })
        ).data,
    });

    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['orders-me', user?.id],
        queryFn: async () => (await api.get(`/orders?userId=${user?.id}`)).data,
        enabled: !!user?.id,
        refetchInterval: 10000, // Real-time updates
    });

    const { data: complaints, isLoading: complaintsLoading } = useQuery({
        queryKey: ['complaints-me', user?.id],
        queryFn: async () => (await api.get(`/complaints?userId=${user?.id}`)).data,
        enabled: !!user?.id,
        refetchInterval: 10000,
    });

    const { data: disputes, isLoading: disputesUserLoading } = useQuery({
        queryKey: ['disputes-me', user?.id],
        queryFn: async () => (await api.get('/disputes')).data,
        enabled: !!user?.id,
        refetchInterval: 10000,
    });

    const { data: notices, isLoading: noticesLoading } = useQuery({
        queryKey: ['notices-me', user?.id],
        queryFn: async () => (await api.get('/users/my-notices')).data,
        enabled: !!user?.id,
        refetchInterval: 10000,
    });

    const { data: rates, isLoading: ratesLoading } = useQuery({
        queryKey: ['commodity-rates'],
        queryFn: async () => {
            try {
                // Fetch all in parallel
                const [goldRes, silverRes, detailedRes] = await Promise.all([
                    api.get('/commodity/gold-rate'),
                    api.get('/commodity/silver-rate'),
                    api.get('/commodity/detailed-rates')
                ]);

                return {
                    gold: goldRes.data?.price ? parseFloat(goldRes.data.price.toString().replace(/,/g, '')) : 0,
                    silver: silverRes.data?.price ? parseFloat(silverRes.data.price.toString().replace(/,/g, '')) : 0,
                    goldRaw: goldRes.data,
                    silverRaw: silverRes.data,
                    detailedResult: detailedRes.data
                };
            } catch (error) {
                console.error('Failed to fetch rates', error);
                return { gold: 0, silver: 0, goldRaw: { price: 0 }, silverRaw: { price: 0 } };
            }
        },
        refetchInterval: 60000, // 1 minute
        staleTime: 30000,
        retry: 3,
    });

    // Keeping separate aliases for compatibility if used elsewhere in the component
    const goldRate = rates?.goldRaw;
    const silverRate = rates?.silverRaw;
    const goldLoading = ratesLoading;
    const silverLoading = ratesLoading;

    const deleteOrderMutation = useMutation({
        mutationFn: (orderId: number) => api.delete(`/orders/${orderId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders-me', user?.id] });
            toast.success('Order deleted successfully');
        },
        onError: () => toast.error('Failed to delete order'),
    });

    const editOrderMutation = useMutation({
        mutationFn: ({ orderId, data }: { orderId: number; data: any }) =>
            api.patch(`/orders/${orderId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders-me', user?.id] });
            setEditingOrderId(null);
            toast.success('Order updated successfully');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update order'),
    });

    const disputeOrderMutation = useMutation({
        mutationFn: (data: any) => api.post('/disputes', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders-me', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['disputes-me', user?.id] });
            setDisputingOrder(null);
            setDisputeData({ subject: '', message: '', evidence: '' });
            toast.success('Dispute submitted successfully. Super Admin will investigate.');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit dispute'),
    });

    const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploadingEvidence(true);
        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setDisputeData(prev => ({ ...prev, evidence: response.data.url }));
            toast.success('Evidence uploaded successfully');
        } catch (error) {
            console.error('Evidence upload failed', error);
            toast.error('Failed to upload evidence');
        } finally {
            setUploadingEvidence(false);
        }
    };

    const submitReviewMutation = useMutation({
        mutationFn: (data: any) => api.post('/reviews', data),
        onSuccess: () => {
            setReviewingProduct(null);
            setReviewData({ rating: 5, comment: '', images: [] });
            toast.success('Review submitted! It will appear after admin approval.');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit review'),
    });

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-['Outfit']">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-black text-[var(--text-main)] tracking-tight">
                            Our <span className="text-[var(--primary)]">Collection</span>
                        </h1>
                        <p className="text-sm md:text-base text-[var(--text-muted)] font-medium">Manage your assets and explore the market.</p>
                    </div>

                    {/* Market Rate Pill & Metal Toggle */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Gold/Silver Toggle - Web View Only */}
                        <div className="hidden md:flex items-center p-1 bg-[var(--bg-card)]/50 backdrop-blur-xl border border-[var(--border)] rounded-full">
                            <button
                                onClick={() => setMetalCategory('Gold')}
                                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${metalCategory === 'Gold' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                            >
                                Gold
                            </button>
                            <button
                                onClick={() => setMetalCategory('Silver')}
                                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${metalCategory === 'Silver' ? 'bg-slate-400 text-black shadow-lg shadow-slate-400/20' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                            >
                                Silver
                            </button>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-1.5 bg-[var(--bg-card)]/50 backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-xl">
                            {/* ... existing Live Market content ... */}
                            <div className="flex -space-x-2">
                                <div className="p-1 px-1.5 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                                </div>
                            </div>
                            <div className="flex flex-col flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">Live Market</span>
                                    <span className="text-[7px] font-bold text-[var(--text-muted)] opacity-60 tabular-nums">
                                        {ratesLoading ? '--:-- --' : new Date(rates?.goldRaw?.sourceUpdatedAt || rates?.goldRaw?.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[10px] font-bold text-amber-500">AU</span>
                                            <span className="text-xs font-black text-[var(--text-main)] min-w-[60px] text-right">
                                                {ratesLoading ? (
                                                    <div className="h-4 w-16 bg-[var(--text-muted)]/20 animate-pulse rounded" />
                                                ) : (
                                                    rates?.gold && rates.gold !== 0 ? formatPrice(rates.gold) : 'Unavailable'
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-px h-4 bg-[var(--border)]" />
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[10px] font-bold text-slate-400">AG</span>
                                            <span className="text-xs font-black text-[var(--text-main)] min-w-[50px] text-right">
                                                {ratesLoading ? (
                                                    <div className="h-4 w-14 bg-[var(--text-muted)]/20 animate-pulse rounded" />
                                                ) : (
                                                    formatPrice(rates?.silver || 0)
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Badge */}
                        {user?.role === 'ADMIN' && (
                            <div className="px-4 py-3 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-2xl flex items-center gap-2 shadow-lg shadow-[var(--primary)]/5">
                                <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
                                <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">Operator Access</span>
                            </div>
                        )}
                    </div>
                </div>


                {/* Legal Action Banner - compact soft gold */}
                <AnimatePresence>
                    {notices?.length > 0 && activeTab !== 'legal' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="max-w-7xl mx-auto px-4 mb-6 overflow-hidden"
                        >
                            <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 rounded-2xl px-5 py-4 shadow-sm group border border-amber-200/60 dark:border-amber-700/30">
                                {/* Subtle shimmer */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/40 dark:via-amber-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s] ease-in-out" />
                                <div className="absolute top-0 right-0 p-4 opacity-[0.04]">
                                    <ShieldAlert className="w-28 h-28" />
                                </div>

                                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl border border-amber-200/80 dark:border-amber-700/40">
                                                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="px-2 py-0.5 bg-amber-200/60 dark:bg-amber-800/40 rounded-md text-[8px] font-black uppercase tracking-[0.15em] text-amber-700 dark:text-amber-300 border border-amber-300/50 dark:border-amber-600/30">
                                                    Legal Notice
                                                </span>
                                                <span className="text-[9px] font-bold text-amber-500/70 dark:text-amber-400/60 uppercase tracking-wider">
                                                    Ref #FIR-{user?.id}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100 leading-tight">
                                                {notices.length} Legal {notices.length > 1 ? 'Actions' : 'Action'} Recorded
                                            </h3>
                                            <p className="text-xs text-amber-700/70 dark:text-amber-300/60 mt-0.5 leading-relaxed max-w-lg">
                                                Review your records to maintain account standing.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 sm:ml-4">
                                        <button
                                            onClick={() => setSearchParams({ tab: 'legal' })}
                                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm shadow-amber-600/20 flex items-center gap-1.5"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            View Records
                                        </button>
                                        <button
                                            onClick={() => navigate('/contact')}
                                            className="px-4 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-800/50 text-amber-700 dark:text-amber-300 font-bold rounded-xl text-[10px] uppercase tracking-widest border border-amber-200 dark:border-amber-700/40 transition-all"
                                        >
                                            Support
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content Area */}
                <div className="min-h-[60vh]">
                    {activeTab === 'shop' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

                            {(productsLoading || ratesLoading) ? (
                                <div className="responsive-grid">
                                    {Array.from({ length: 8 }).map((_, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl"
                                        >
                                            <div className="relative aspect-[4/3] sm:aspect-square bg-[var(--bg-input)]/50 animate-pulse" />
                                            <div className="p-5 space-y-3">
                                                <div className="h-4 w-3/4 bg-[var(--bg-input)]/70 rounded animate-pulse" />
                                                <div className="h-4 w-1/3 bg-[var(--bg-input)]/70 rounded animate-pulse" />
                                                <div className="h-10 w-full bg-[var(--bg-input)]/70 rounded-xl animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : productsError ? (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-8 rounded-2xl text-center">
                                    <p>Failed to load products. Please check if the backend is running.</p>
                                </div>
                            ) : productsData?.items?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)] bg-[var(--bg-card)]/10 border-2 border-dashed border-[var(--border)] rounded-[2.5rem]">
                                    <PackageX className="w-16 h-16 mb-4 opacity-10" />
                                    <p className="font-bold text-lg">No items found</p>
                                    <p className="text-sm">Try adjusting your search or category.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="responsive-grid">
                                        <AnimatePresence mode='wait'>
                                            {productsData?.items?.map((product: any, index: number) => (
                                                <motion.div
                                                    key={product.id}
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
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    <div className="mt-10 flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                            className="px-4 py-2 rounded-lg font-bold text-sm bg-[var(--bg-card)] border border-[var(--border)] disabled:opacity-50"
                                        >
                                            Prev
                                        </button>
                                        <div className="text-sm text-[var(--text-muted)] font-bold">
                                            Page {productsData?.page || page} of {productsData?.totalPages || 1}
                                        </div>
                                        <button
                                            onClick={() => setPage((p) => {
                                                const totalPages = productsData?.totalPages || 1;
                                                return Math.min(totalPages, p + 1);
                                            })}
                                            disabled={page >= (productsData?.totalPages || 1)}
                                            className="px-4 py-2 rounded-lg font-bold text-sm bg-[var(--bg-card)] border border-[var(--border)] disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'complaints' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black flex items-center gap-2">
                                        <div className="p-2 bg-[var(--primary)]/10 rounded-xl border border-[var(--primary)]/20 shadow-lg">
                                            <MessageCircle className="w-5 h-5 text-[var(--primary)]" />
                                        </div>
                                        <span className="text-gradient-primary">Support & Disputes</span>
                                    </h2>
                                    <p className="text-[var(--text-muted)] mt-1 font-medium opacity-80 text-sm">Track your order disputes and ongoing support consultations.</p>
                                </div>
                                <Link
                                    to="/contact"
                                    className="group flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-[var(--primary-hover)] transition-all shadow-lg hover:shadow-[var(--accent-glow)] w-fit text-sm"
                                >
                                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                    Submit New Query
                                </Link>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] flex items-center gap-2 opacity-60">
                                    <MessageCircle className="w-3.5 h-3.5" /> Support Queries
                                </h3>
                                {complaintsLoading ? (
                                    <div className="p-8 text-center animate-pulse bg-[var(--bg-card)]/20 rounded-2xl border border-[var(--border)]/50 backdrop-blur-sm">
                                        <p className="font-bold text-[var(--text-muted)] text-sm">Retrieving support threads...</p>
                                    </div>
                                ) : !complaints || complaints.length === 0 ? (
                                        <div className="p-8 text-center text-[var(--text-muted)] bg-[var(--bg-card)]/10 rounded-2xl border border-dashed border-[var(--border)]/50">
                                            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-10" />
                                            <p className="text-sm font-bold">No general support queries</p>
                                            <p className="text-[10px] mt-0.5 opacity-60">Need help? We're just a message away.</p>
                                    </div>
                                ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {complaints.map((c: any) => (
                                            <motion.div
                                                key={c.id}
                                                whileHover={{ y: -3 }}
                                                className="glass-card bg-[var(--bg-card)]/30 border border-[var(--border)]/50 rounded-xl p-4 shadow-lg hover:border-[var(--primary)]/30 transition-all duration-300 group"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-black text-base text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">{c.subject}</h4>
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border shadow-sm ${c.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                        {c.status}
                                                    </span>
                                                </div>
                                                {c.orderId && (
                                                    <span className="text-[8px] font-black text-[var(--primary)] uppercase tracking-widest block mb-2">
                                                        Linked Order: #{c.order?.displayId || c.orderId}
                                                    </span>
                                                )}
                                                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3 opacity-80 line-clamp-2">{c.message}</p>
                                                {c.adminResponse && (
                                                    <div className="bg-[var(--bg-input)]/40 border border-[var(--border)]/50 p-2.5 rounded-lg">
                                                        <div className="font-black text-[8px] text-[var(--primary)] uppercase tracking-widest mb-1 opacity-60">Official Response</div>
                                                        <p className="text-xs text-[var(--text-main)] italic font-medium">"{c.adminResponse}"</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] flex items-center gap-2 opacity-60">
                                    <Gavel className="w-3.5 h-3.5" /> Order Disputes
                                </h3>
                                {disputesUserLoading ? (
                                    <div className="p-8 text-center animate-pulse bg-[var(--bg-card)]/20 rounded-2xl border border-[var(--border)]/50 backdrop-blur-sm">
                                        <Loader2 className="w-5 h-5 mx-auto animate-spin text-[var(--primary)] mb-2" />
                                        <p className="font-bold text-[var(--text-muted)] text-sm">Checking records...</p>
                                    </div>
                                ) : !disputes || disputes.length === 0 ? (
                                        <div className="p-8 text-center text-[var(--text-muted)] bg-[var(--bg-card)]/10 rounded-2xl border border-dashed border-[var(--border)]/50">
                                            <Gavel className="w-8 h-8 mx-auto mb-2 opacity-10" />
                                            <p className="text-sm font-bold">No active disputes</p>
                                            <p className="text-[10px] mt-0.5 opacity-60">Everything is in order.</p>
                                    </div>
                                ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {disputes.map((d: any) => (
                                            <motion.div
                                                key={d.id}
                                                whileHover={{ y: -3 }}
                                                className="glass-card bg-[var(--bg-card)]/30 border border-[var(--border)]/50 rounded-xl p-4 shadow-lg hover:border-[var(--primary)]/30 transition-all duration-300 relative overflow-hidden group"
                                            >
                                                <div className="absolute top-0 right-0 p-1 px-2 bg-[var(--primary)]/5 rounded-bl-lg border-l border-b border-[var(--border)]/30">
                                                    <span className="text-[7px] font-black text-[var(--primary)] uppercase tracking-tighter">Case #{d.id}</span>
                                                </div>
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-black text-base text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">{d.subject}</h4>
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border shadow-sm ${d.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                        d.status === 'Under Investigation' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                        }`}>
                                                        {d.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3 opacity-80 line-clamp-2">{d.message}</p>

                                                {d.adminResponse && (
                                                    <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 p-2.5 rounded-lg relative">
                                                        <div className="flex items-center gap-1.5 text-[8px] font-black text-[var(--primary)] uppercase tracking-widest mb-1">
                                                            <ShieldCheck className="w-3 h-3" />
                                                            Response
                                                        </div>
                                                        <p className="text-xs text-[var(--text-main)] italic font-medium">"{d.adminResponse}"</p>
                                                        <div className="text-[8px] text-[var(--text-muted)] text-right mt-1 font-bold opacity-50">
                                                            {new Date(d.adminRespondedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-4 pt-2 flex items-center justify-between border-t border-[var(--border)]/50 text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                                                    <span>Order: <span className="text-[var(--primary)]">#{d.order?.displayId || d.orderId}</span></span>
                                                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'orders' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto space-y-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-black text-[var(--text-main)]">Your Orders</h2>
                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">{orders?.length || 0} Total Orders</p>
                            </div>

                            {ordersLoading ? (
                                <div className="flex flex-col items-center justify-center py-32 bg-[var(--bg-card)]/20 rounded-[2.5rem] border border-[var(--border)]/50">
                                    <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mb-4" />
                                    <p className="text-lg font-bold text-[var(--text-main)]">Accessing History...</p>
                                </div>
                            ) : !orders || orders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-card)]/10 border-2 border-dashed border-[var(--border)] rounded-[2.5rem]">
                                        <ShoppingBag className="w-16 h-16 mb-4 opacity-10" />
                                        <p className="font-bold text-lg">No orders found</p>
                                    <button
                                        onClick={() => setSearchParams({ tab: 'shop' })}
                                            className="mt-6 px-6 py-2 bg-[var(--primary)] text-white font-bold rounded-xl text-xs uppercase tracking-widest"
                                    >
                                            Start Shopping
                                    </button>
                                </div>
                            ) : (
                                        <div className="space-y-4">
                                            {orders.map((order: any) => {
                                                const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                                                const displaySteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
                                                const statusToIndex: Record<string, number> = { 'Pending': 0, 'Processing': 1, 'Ready to Deliver': 2, 'Delivered': 3 };
                                                const currentStatusIndex = statusToIndex[order.status] ?? 0;

                                                return (
                                                    <motion.div 
                                                        layout
                                                        key={order.id} 
                                                        className="luxury-card border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl bg-[var(--bg-card)]/40 backdrop-blur-md group hover:border-[var(--primary)]/30 transition-all duration-500"
                                                    >
                                                        {/* COMPACT HEADER */}
                                                        <div className="bg-gradient-to-r from-[var(--bg-input)]/80 to-transparent border-b border-[var(--border)] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60 leading-none">Registry</span>
                                                                    <span className="text-xs font-mono font-black text-[var(--primary)]">#{order.displayId || order.id}</span>
                                                                </div>
                                                                <div className="hidden xs:block h-6 w-px bg-[var(--border)]" />
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60 leading-none">Value</span>
                                                                    <span className="text-xs font-black text-[var(--text-main)]">{formatPrice(order.total || 0)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 sm:gap-3 sm:ml-2">
                                                                    <div className={`w-2 h-2 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'Paid' ? 'text-green-500' : 'text-red-500'}`}>{order.paymentStatus || 'Unpaid'}</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 max-w-[250px] mx-6 hidden lg:block">
                                                                <div className="relative h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${(currentStatusIndex / (displaySteps.length - 1)) * 100}%` }}
                                                                        className="h-full bg-[var(--primary)]"
                                                                    />
                                                                </div>
                                                                <div className="flex justify-between mt-1.5">
                                                                    {displaySteps.map((step, idx) => (
                                                                        <span key={step} className={`text-[7px] font-black uppercase tracking-tighter ${idx <= currentStatusIndex ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] opacity-30'}`}>
                                                                            {step}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                                                                <span className="text-[10px] sm:text-[11px] font-black text-[var(--text-main)] italic opacity-60">
                                                                    {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                                </span>
                                                                <div className={`px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                                    {order.status === 'Ready to Deliver' ? 'Shipped' : order.status}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* COMPACT BODY */}
                                                        <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                                                            {/* Items compact list */}
                                                            <div className="flex -space-x-6 overflow-hidden py-1 shrink-0">
                                                                {orderItems.slice(0, 4).map((item: any, idx: number) => (
                                                                    <div key={idx} className="relative w-14 h-14 rounded-xl border-[3px] border-[var(--bg-card)] overflow-hidden bg-white shrink-0 shadow-md transition-transform hover:scale-110 hover:z-10 first:rotate-0 rotate-2">
                                                                        <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                                                        {item.quantity > 1 && (
                                                                            <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] font-black px-1.5 py-0.5 rounded-tl-lg">
                                                                                x{item.quantity}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {orderItems.length > 4 && (
                                                                    <div className="w-14 h-14 rounded-xl border-[3px] border-[var(--bg-card)] bg-[var(--bg-input)] flex items-center justify-center text-xs font-black text-[var(--text-muted)] shrink-0 shadow-md">
                                                                        +{orderItems.length - 4}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-black text-[var(--text-main)] truncate uppercase tracking-tight opacity-80">
                                                                    {orderItems.map((i: any) => i.name).join(' • ')}
                                                                </p>
                                                            </div>

                                                            {/* Actions Row */}
                                                            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                                                                <div className="flex items-center gap-2">
                                                                    {order.paymentReceipt && (
                                                                        <a href={getImageUrl(order.paymentReceipt)} target="_blank" rel="noreferrer" title="Payment Proof"
                                                                            className="p-2 bg-[var(--bg-input)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-all border border-[var(--border)] shadow-sm">
                                                                            <Receipt className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                                                        </a>
                                                                    )}
                                                                    {order.isFinalReceiptSent && (
                                                                        <button onClick={() => setViewingReceipt(order)} title="Certificate"
                                                                            className="p-2 bg-[var(--primary)]/5 rounded-xl text-[var(--primary)] transition-all border border-[var(--primary)]/20 shadow-sm">
                                                                            <FileText className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div className="hidden xs:block h-6 w-px bg-[var(--border)] mx-1" />

                                                                <div className="flex items-center gap-2">
                                                                    {(order.status === 'Pending' && order.paymentStatus !== 'Paid') && (
                                                                        <>
                                                                            <button onClick={() => {
                                                                                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                                                                                setEditingOrderId(order.id);
                                                                                setEditFormData({ customerName: order.customerName, customerAddress: order.customerAddress, customerPhone: order.customerPhone, items: items || [] });
                                                                            }} className="px-3 sm:px-4 py-2 bg-[var(--bg-input)] hover:bg-[var(--primary)] text-[var(--text-main)] hover:text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all rounded-xl border border-[var(--border)] flex items-center gap-1.5 sm:gap-2 shadow-sm">
                                                                                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Edit
                                                                            </button>
                                                                            <button onClick={() => confirm('Abort this order?') && deleteOrderMutation.mutate(order.id)}
                                                                                className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 shadow-sm" title="Cancel">
                                                                                <XCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                                                            </button>
                                                                        </>
                                                                    )}

                                                                    {order.status === 'Delivered' && (
                                                                        <button
                                                                            onClick={() => {
                                                                                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                                                                                if (items?.length) setReviewingProduct(items[0]);
                                                                            }}
                                                                            className="px-4 pr-5 py-2 bg-[var(--primary)] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-[var(--primary)]/20 hover:scale-105 active:scale-95"
                                                                        >
                                                                            Review
                                                                        </button>
                                                                    )}

                                                                    <button onClick={() => {
                                                                        setDisputingOrder(order);
                                                                        setDisputeData({ subject: `Dispute Case #${order.displayId || order.id}`, message: '', evidence: '' });
                                                                    }} className="p-2 text-[var(--text-muted)] hover:text-yellow-600 rounded-xl transition-all border border-[var(--border)] shadow-sm" title="Dispute">
                                                                        <Gavel className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                                                    </button>

                                                                    {order.status === 'Delivered' && (
                                                                        <button onClick={() => confirm('Remove from history?') && deleteOrderMutation.mutate(order.id)}
                                                                            className="p-2 text-[var(--text-muted)] hover:text-red-500 rounded-xl transition-all border border-[var(--border)] shadow-sm" title="Remove">
                                                                            <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'policy' && <Policy />}

                    {
                        activeTab === 'legal' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h2 className="text-3xl font-black flex items-center gap-3">
                                            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-lg shadow-red-500/5">
                                                <ShieldAlert className="w-6 h-6 text-red-500" />
                                            </div>
                                            <span className="text-red-500">Legal Notices & FIRs</span>
                                        </h2>
                                        <p className="text-[var(--text-muted)] mt-2 font-medium opacity-80">Official legal communications and record of system FIRs issued to your account.</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {noticesLoading ? (
                                        <div className="p-16 text-center animate-pulse bg-[var(--bg-card)]/20 rounded-[2.5rem] border border-[var(--border)]/50 backdrop-blur-sm">
                                            <Loader2 className="w-8 h-8 mx-auto animate-spin text-red-500 mb-4" />
                                            <p className="font-bold text-[var(--text-muted)]">Retrieving legal records...</p>
                                        </div>
                                    ) : !notices || notices.length === 0 ? (
                                        <div className="p-16 text-center text-[var(--text-muted)] bg-[var(--bg-card)]/10 rounded-[2.5rem] border border-dashed border-[var(--border)]/50">
                                            <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20 text-green-500" />
                                            <p className="text-lg font-bold">Your Record is Clean</p>
                                            <p className="text-sm mt-1 opacity-60">No legal notices or FIRs have been issued to your account.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {notices.map((n: any) => (
                                                <motion.div
                                                    key={n.id}
                                                    whileHover={{ y: -5 }}
                                                    className="glass-card bg-[var(--bg-card)]/30 border border-red-500/20 rounded-[2.5rem] p-8 shadow-xl hover:border-red-500/40 transition-all duration-300 relative overflow-hidden group"
                                                >
                                                    <div className="absolute top-0 right-0 p-1 px-3 bg-red-500 text-white rounded-bl-2xl">
                                                        <span className="text-[9px] font-black uppercase tracking-widest">FIR-#{n.id}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                                                            <ShieldAlert className="w-5 h-5 text-red-500" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-xl text-[var(--text-main)] group-hover:text-red-500 transition-colors uppercase tracking-tight">
                                                                {n.metadata?.violation || 'General Violation'}
                                                            </h4>
                                                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">Registered: {new Date(n.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8 opacity-80 line-clamp-3">
                                                        {n.metadata?.details}
                                                    </p>

                                                    <button
                                                        onClick={() => setViewingFir(n)}
                                                        className="w-full py-4 bg-[var(--bg-input)] hover:bg-red-500 hover:text-white border border-[var(--border)] hover:border-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <File className="w-4 h-4" />
                                                        View Official Receipt
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }
                </div>
            </main>

            {/* Modals */}
            {selectedProduct && (
                <ProductDetailsModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}

            {disputingOrder && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[var(--bg-main)]/80 backdrop-blur-sm">
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-input)]/50">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Gavel className="w-5 h-5 text-yellow-500" />
                                Dispute Order #{disputingOrder.displayId || disputingOrder.id}
                            </h3>
                            <p className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-widest">Submit this to the Super Admin for investigation</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Subject</label>
                                <input
                                    value={disputeData.subject}
                                    onChange={(e) => setDisputeData({ ...disputeData, subject: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/40 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Details of Issue</label>
                                <textarea
                                    value={disputeData.message}
                                    onChange={(e) => setDisputeData({ ...disputeData, message: e.target.value })}
                                    placeholder="Explain the problem in detail (e.g., payment sent but not confirmed, wrong items received, etc.)"
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/40 outline-none h-32 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Evidence (Optional)</label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center justify-center px-4 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--bg-input)]/80 transition-all group w-full">
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleEvidenceUpload}
                                            accept="image/*,application/pdf"
                                        />
                                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
                                            {uploadingEvidence ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : disputeData.evidence ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Plus className="w-4 h-4" />
                                            )}
                                            <span className="font-bold">
                                                {uploadingEvidence ? 'Uploading...' : disputeData.evidence ? 'Evidence Attached' : 'Upload Proof'}
                                            </span>
                                        </div>
                                    </label>
                                    {disputeData.evidence && (
                                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] overflow-hidden shrink-0 relative group">
                                            <img
                                                src={getImageUrl(disputeData.evidence)}
                                                alt="Evidence"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => setDisputeData(prev => ({ ...prev, evidence: '' }))}
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => disputeOrderMutation.mutate({
                                        orderId: disputingOrder.id,
                                        ...disputeData
                                    })}
                                    disabled={disputeOrderMutation.isPending || !disputeData.message.trim()}
                                    className="flex-1 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl text-sm hover:bg-[var(--primary-hover)] transition-all shadow-lg shadow-[var(--accent-glow)] disabled:opacity-50"
                                >
                                    {disputeOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                                    Submit Case
                                </button>
                                <button
                                    onClick={() => setDisputingOrder(null)}
                                    className="flex-1 px-6 py-3 bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-main)] font-bold rounded-xl text-sm hover:opacity-80 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewingReceipt && (
                <OrderReceipt
                    order={viewingReceipt}
                    formatPrice={formatPrice}
                    onClose={() => setViewingReceipt(null)}
                />
            )}

            {/* Order Edit Modal */}
            <AnimatePresence>
                {editingOrderId && editFormData && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-input)]/30 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center">
                                        <Pencil className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[var(--text-main)]">Edit Order</h3>
                                        <p className="text-xs text-[var(--text-muted)]">Order #{editingOrderId}</p>
                                    </div>
                                </div>
                                <button onClick={() => setEditingOrderId(null)} className="p-2 hover:bg-[var(--bg-input)] rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-[var(--text-muted)]" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Delivery Info */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Delivery Information</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-[var(--text-muted)]">Customer Name</label>
                                            <input
                                                value={editFormData.customerName || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--primary)] transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-[var(--text-muted)]">Phone Number</label>
                                            <input
                                                value={editFormData.customerPhone || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, customerPhone: e.target.value })}
                                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--primary)] transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-[var(--text-muted)]">Delivery Address</label>
                                        <textarea
                                            value={editFormData.customerAddress || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, customerAddress: e.target.value })}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--primary)] transition-all outline-none h-20 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Order Items ({editFormData.items?.length || 0})</h4>
                                    <div className="space-y-3">
                                        {editFormData.items?.map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-4 p-3 bg-[var(--bg-input)]/50 border border-[var(--border)] rounded-2xl">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--bg-input)] border border-[var(--border)] shrink-0">
                                                    <img src={getImageUrl(item.image)} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-sm font-bold text-[var(--text-main)] truncate">{item.name}</h5>
                                                    <p className="text-xs text-[var(--primary)] font-medium">{formatPrice(item.price)}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button onClick={() => updateItemQuantity(item.id, -1)}
                                                        className="w-8 h-8 flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border)] hover:border-red-500 hover:text-red-500 rounded-lg transition-all active:scale-90">
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                                    <button onClick={() => updateItemQuantity(item.id, 1)}
                                                        className="w-8 h-8 flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] rounded-lg transition-all active:scale-90">
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => removeItemFromEdit(item.id)}
                                                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all active:scale-90 ml-1">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(editFormData.items?.length === 0) && (
                                            <div className="py-10 text-center text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
                                                <PackageX className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                <p className="text-sm font-medium">No items in order</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Total */}
                                {editFormData.items?.length > 0 && (
                                    <div className="flex items-center justify-between p-4 bg-[var(--primary)]/5 border border-[var(--primary)]/10 rounded-2xl">
                                        <span className="text-sm font-bold text-[var(--text-muted)]">Estimated Total</span>
                                        <span className="text-xl font-black text-[var(--text-main)]">
                                            {formatPrice(editFormData.items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-input)]/20 flex gap-3 shrink-0">
                                <button
                                    onClick={() => setEditingOrderId(null)}
                                    className="flex-1 px-6 py-3 bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-main)] font-bold rounded-xl text-sm hover:opacity-80 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (!editFormData.customerName || !editFormData.customerAddress || !editFormData.customerPhone) {
                                            toast.error("Please fill all delivery fields");
                                            return;
                                        }
                                        if (editFormData.items.length === 0) {
                                            toast.error("Order must have at least one item");
                                            return;
                                        }
                                        editOrderMutation.mutate({ orderId: editingOrderId, data: editFormData });
                                    }}
                                    disabled={editOrderMutation.isPending}
                                    className="flex-1 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl text-sm hover:bg-[var(--primary-hover)] transition-all shadow-lg shadow-[var(--accent-glow)] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {editOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Review Submission Modal */}
            <AnimatePresence>
                {reviewingProduct && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl p-8"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight">Rate this Masterpiece</h2>
                                <button onClick={() => setReviewingProduct(null)} className="p-2 hover:bg-[var(--bg-input)] rounded-full transition-colors">
                                    <X className="w-5 h-5 text-[var(--text-muted)]" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-8 p-4 bg-[var(--bg-input)]/50 rounded-2xl border border-[var(--border)]">
                                <img src={getImageUrl(reviewingProduct.image)} className="w-16 h-16 rounded-xl object-cover" />
                                <div>
                                    <h3 className="font-bold text-[13px] text-[var(--text-main)]">{reviewingProduct.name}</h3>
                                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Share your experience with us</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setReviewData({ ...reviewData, rating: s })}
                                            className="p-1 transition-transform hover:scale-125 active:scale-95"
                                        >
                                            <Star className={`w-8 h-8 ${s <= reviewData.rating ? 'fill-yellow-500 text-yellow-500' : 'text-[var(--text-muted)] opacity-30'}`} />
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Your Thoughts</label>
                                    <textarea
                                        value={reviewData.comment}
                                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                        placeholder="Craft your story about this piece..."
                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[1.5rem] p-5 text-sm font-medium focus:border-[var(--primary)]/50 focus:ring-4 focus:ring-[var(--primary)]/5 outline-none transition-all h-32 resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Gallery (Optional)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {reviewData.images.map((img, idx) => (
                                            <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[var(--border)]">
                                                <img src={getImageUrl(img)} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setReviewData({ ...reviewData, images: reviewData.images.filter((_, i) => i !== idx) })}
                                                    className="absolute top-0.5 right-0.5 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {reviewData.images.length < 3 && (
                                            <label className="w-16 h-16 rounded-xl border border-dashed border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-input)] transition-all">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        const formData = new FormData();
                                                        formData.append('file', file);
                                                        try {
                                                            const res = await api.post('/upload', formData, {
                                                                headers: {
                                                                    'Content-Type': 'multipart/form-data',
                                                                },
                                                            });
                                                            setReviewData({ ...reviewData, images: [...reviewData.images, res.data.url] });
                                                        } catch (err: any) {
                                                            console.error('Upload error:', err);
                                                            toast.error(err.response?.data?.message || 'Upload failed');
                                                        }
                                                    }}
                                                />
                                                <Plus className="w-5 h-5 text-[var(--text-muted)]" />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => submitReviewMutation.mutate({
                                        productId: reviewingProduct.id,
                                        ...reviewData
                                    })}
                                    disabled={submitReviewMutation.isPending || !reviewData.comment.trim()}
                                    className="w-full py-4 bg-[var(--primary)] text-white font-black rounded-[1.5rem] uppercase tracking-widest text-xs shadow-xl shadow-[var(--primary)]/20 hover:bg-[var(--primary-hover)] transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {submitReviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                                    Publish Review
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* FIR Receipt Modal */}
            <AnimatePresence>
                {viewingFir && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingFir(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 50 }}
                            className="relative w-full max-w-2xl bg-white text-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                        >
                            <div className="bg-red-600 w-full md:w-32 flex flex-row md:flex-col items-center justify-between p-6 md:py-10 text-white shrink-0">
                                <ShieldAlert className="w-10 h-10" />
                                <div className="md:rotate-180 md:[writing-mode:vertical-lr] font-black text-lg uppercase tracking-[0.3em] opacity-40">
                                    Official Legal Notice
                                </div>
                                <div className="bg-white/10 p-3 rounded-full border border-white/20">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                </div>
                            </div>

                            <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar-light">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Digital FIR Record</p>
                                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Case Registry</h2>
                                    </div>
                                    <button
                                        onClick={() => setViewingFir(null)}
                                        className="p-2 hover:bg-slate-100 rounded-2xl transition-colors"
                                    >
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-8 border-y border-slate-100 py-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case ID</p>
                                            <p className="font-mono font-black text-slate-900">#{viewingFir.id.toString().padStart(6, '0')}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</p>
                                            <p className="font-bold text-slate-900">{new Date(viewingFir.createdAt).toLocaleDateString('en-PK', { dateStyle: 'long' })}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Defendant</p>
                                            <p className="font-black text-slate-900">{user?.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Violation Type</p>
                                            <p className="font-black text-red-600">{viewingFir.metadata?.violation}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description of Violation</p>
                                        <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                                                "{viewingFir.metadata?.details}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center rotate-3 border-2 border-slate-200/50">
                                            <ShieldCheck className="w-12 h-12 text-slate-300 -rotate-3" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authenticated System Record</p>
                                            <p className="text-[9px] text-slate-300 font-bold mt-1">This is a system generated legal notice. No physical signature required.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

