import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../lib/api';
import { calculateDynamicPrice } from '../lib/pricing';
import Navbar from './Navbar';
import ProductDetailsModal from './ProductDetailsModal';
import Policy from './Policy';
import { useCartStore } from '../store/useCartStore';
import { Plus, Loader2, PackageX, ShoppingBag, Clock, CheckCircle2, Receipt, Trash2, Edit2, MessageCircle, Gavel, ShieldCheck, File, Heart, ShoppingCart } from 'lucide-react';
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
    const [disputeData, setDisputeData] = useState({ subject: '', message: '' });
    const [editFormData, setEditFormData] = useState<any>({});
    const [viewingReceipt, setViewingReceipt] = useState<any>(null);

    // Shop discovery controls from global store
    const { q, sort, minPrice, maxPrice, metalCategory, setMetalCategory } = useSearchStore();
    const [page, setPage] = useState(1);

    useEffect(() => {
        // Reset to first page whenever filters change
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, sort, minPrice, maxPrice, metalCategory]);

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
        queryKey: ['products', q, sort, page, minPrice, maxPrice, metalCategory],
        queryFn: async () => (
            await api.get('/products', {
                params: {
                    q: q || undefined,
                    sort,
                    page,
                    limit: 24,
                    category: metalCategory,
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

    const { data: rates, isLoading: ratesLoading } = useQuery({
        queryKey: ['commodity-rates'],
        queryFn: async () => {
            try {
                const gold = await api.get('/commodity/gold-rate');
                const silver = await api.get('/commodity/silver-rate');
                const detailed = await api.get('/commodity/detailed-rates');

                // Extract peak rates from detailed sources
                const peakGold = detailed.data?.gold ? [...detailed.data.gold].sort((a: any, b: any) => b.price - a.price)[0]?.price : (gold.data?.price || 0);
                const peakSilver = detailed.data?.silver ? [...detailed.data.silver].sort((a: any, b: any) => b.price - a.price)[0]?.price : (silver.data?.price || 0);

                return {
                    gold: peakGold,
                    silver: peakSilver,
                    goldRaw: { ...gold.data, price: peakGold },
                    silverRaw: { ...silver.data, price: peakSilver },
                    detailedResult: detailed.data
                };
            } catch (error) {
                console.error('Failed to fetch rates', error);
                return {
                    gold: 0,
                    silver: 0,
                    goldRaw: { price: 0, error: 'Network Error' },
                    silverRaw: { price: 0, error: 'Network Error' }
                };
            }
        },
        refetchInterval: 5000,
        retry: 2,
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
            setDisputeData({ subject: '', message: '' });
            toast.success('Dispute submitted successfully. Super Admin will investigate.');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit dispute'),
    });

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-['Outfit']">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
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

                        <div className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-card)]/50 backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-xl">
                            <div className="flex -space-x-2">
                                <div className="p-1.5 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Live Market</span>
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[10px] font-bold text-amber-500">AU</span>
                                            <span className="text-xs md:text-sm font-black text-[var(--text-main)] min-w-[60px] text-right">
                                                {ratesLoading ? (
                                                    <div className="h-4 w-16 bg-[var(--text-muted)]/20 animate-pulse rounded" />
                                                ) : (
                                                    rates?.gold && rates.gold !== 0 ? formatPrice(rates.gold) : 'Unavailable'
                                                )}
                                            </span>
                                        </div>
                                        <span className="text-[8px] text-[var(--text-muted)] opacity-60 leading-none mt-0.5">
                                            {ratesLoading ? (
                                                <div className="h-2 w-10 bg-[var(--text-muted)]/20 animate-pulse rounded ml-auto" />
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <span>
                                                        {new Date(rates?.goldRaw?.sourceUpdatedAt || rates?.goldRaw?.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                    <div className="w-px h-6 bg-[var(--border)]" />
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[10px] font-bold text-slate-400">AG</span>
                                            <span className="text-xs md:text-sm font-black text-[var(--text-main)] min-w-[50px] text-right">
                                                {ratesLoading ? (
                                                    <div className="h-4 w-14 bg-[var(--text-muted)]/20 animate-pulse rounded" />
                                                ) : (
                                                    formatPrice(rates?.silver || 0)
                                                )}
                                            </span>
                                        </div>
                                        <span className="text-[8px] text-[var(--text-muted)] opacity-60 leading-none mt-0.5">
                                            {ratesLoading ? (
                                                <div className="h-2 w-10 bg-[var(--text-muted)]/20 animate-pulse rounded ml-auto" />
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <span>
                                                        {new Date(rates?.silverRaw?.sourceUpdatedAt || rates?.silverRaw?.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Badge */}
                        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                            <div className="px-4 py-3 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-2xl flex items-center gap-2 shadow-lg shadow-[var(--primary)]/5">
                                <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
                                <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">Operator Access</span>
                            </div>
                        )}
                    </div>
                </div>

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
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2, delay: index * 0.02 }}
                                                    onClick={() => setSelectedProduct(product)}
                                                    className="classic-card group cursor-pointer flex flex-col h-full"
                                                >
                                                    <div className="classic-image-wrapper">
                                                        <img
                                                            src={getImageUrl(product.image)}
                                                            alt={product.name}
                                                            className="transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                        <button
                                                            className={`classic-heart-btn ${isInWishlist(product.id) ? '!text-red-500 !bg-white' : ''}`}
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
                                                            <Heart className={`w-4.5 h-4.5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                                                        </button>
                                                    </div>

                                                    <div className="classic-info flex flex-col flex-grow p-4 md:p-5">
                                                        <h3 className="classic-name !text-lg !mb-1 line-clamp-1">
                                                            {product.name}
                                                        </h3>

                                                        <div className="flex items-center justify-between gap-2 mb-4">
                                                            <div className="classic-price !text-xl !mb-0">
                                                                {product.category === 'Silver'
                                                                    ? formatPrice(calculateDynamicPrice(product, silverRate))
                                                                    : formatPrice(calculateDynamicPrice(product, goldRate))
                                                                }
                                                            </div>

                                                            {(product.weightTola > 0 || product.weightMasha > 0 || product.weightRati > 0) && (
                                                                <div className="flex gap-1">
                                                                    {product.weightTola > 0 && (
                                                                        <span className="weight-pill !py-0.5 !px-1.5 !text-[10px]"><span className="weight-value">{product.weightTola}</span>T</span>
                                                                    )}
                                                                    {product.weightMasha > 0 && (
                                                                        <span className="weight-pill !py-0.5 !px-1.5 !text-[10px]"><span className="weight-value">{product.weightMasha}</span>M</span>
                                                                    )}
                                                                    {product.weightRati > 0 && (
                                                                        <span className="weight-pill !py-0.5 !px-1.5 !text-[10px]"><span className="weight-value">{product.weightRati}</span>R</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[var(--border)]/20">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const rate = product.category === 'Silver' ? silverRate : goldRate;
                                                                    const calculatedPrice = calculateDynamicPrice(product, rate);
                                                                    addItem({ ...product, price: calculatedPrice });
                                                                    navigate('/checkout');
                                                                }}
                                                                disabled={(product.category === 'Silver' ? silverLoading : goldLoading)}
                                                                className="flex-1 bg-[var(--primary)] text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-lg shadow-[var(--primary)]/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
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
                            className="space-y-12"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-3xl font-black flex items-center gap-3">
                                        <div className="p-3 bg-[var(--primary)]/10 rounded-2xl border border-[var(--primary)]/20 shadow-lg">
                                            <MessageCircle className="w-6 h-6 text-[var(--primary)]" />
                                        </div>
                                        <span className="text-gradient-primary">Support & Disputes</span>
                                    </h2>
                                    <p className="text-[var(--text-muted)] mt-2 font-medium opacity-80">Track your order disputes and ongoing support consultations.</p>
                                </div>
                                <Link
                                    to="/contact"
                                    className="group flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-2xl hover:bg-[var(--primary-hover)] transition-all shadow-lg hover:shadow-[var(--accent-glow)] w-fit"
                                >
                                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                    Submit New Query
                                </Link>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] flex items-center gap-2 opacity-60">
                                    <MessageCircle className="w-4 h-4" /> Support Queries
                                </h3>
                                {complaintsLoading ? (
                                    <div className="p-16 text-center animate-pulse bg-[var(--bg-card)]/20 rounded-[2.5rem] border border-[var(--border)]/50 backdrop-blur-sm">
                                        <p className="font-bold text-[var(--text-muted)]">Retrieving support threads...</p>
                                    </div>
                                ) : !complaints || complaints.length === 0 ? (
                                    <div className="p-16 text-center text-[var(--text-muted)] bg-[var(--bg-card)]/10 rounded-[2.5rem] border border-dashed border-[var(--border)]/50">
                                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                        <p className="text-lg font-bold">No general support queries</p>
                                        <p className="text-sm mt-1 opacity-60">Need help? We're just a message away.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {complaints.map((c: any) => (
                                            <motion.div
                                                key={c.id}
                                                whileHover={{ y: -5 }}
                                                className="glass-card bg-[var(--bg-card)]/30 border border-[var(--border)]/50 rounded-[2.5rem] p-8 shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300 group"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="font-black text-xl text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">{c.subject}</h4>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${c.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                        {c.status}
                                                    </span>
                                                </div>
                                                {c.orderId && (
                                                    <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest block mb-4">
                                                        Linked Order: #{c.order?.displayId || c.orderId}
                                                    </span>
                                                )}
                                                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6 opacity-80 line-clamp-3">{c.message}</p>
                                                {c.adminResponse && (
                                                    <div className="bg-[var(--bg-input)]/40 border border-[var(--border)]/50 p-5 rounded-2xl">
                                                        <div className="font-black text-[10px] text-[var(--primary)] uppercase tracking-widest mb-2 opacity-60">Official Response</div>
                                                        <p className="text-sm text-[var(--text-main)] italic font-medium">"{c.adminResponse}"</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] flex items-center gap-2 opacity-60">
                                    <Gavel className="w-4 h-4" /> Order Disputes
                                </h3>
                                {disputesUserLoading ? (
                                    <div className="p-16 text-center animate-pulse bg-[var(--bg-card)]/20 rounded-[2.5rem] border border-[var(--border)]/50 backdrop-blur-sm">
                                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-[var(--primary)] mb-4" />
                                        <p className="font-bold text-[var(--text-muted)]">Checking command center records...</p>
                                    </div>
                                ) : !disputes || disputes.length === 0 ? (
                                    <div className="p-16 text-center text-[var(--text-muted)] bg-[var(--bg-card)]/10 rounded-[2.5rem] border border-dashed border-[var(--border)]/50">
                                        <Gavel className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                        <p className="text-lg font-bold">No active disputes found</p>
                                        <p className="text-sm mt-1 opacity-60">Everything seems to be in order.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {disputes.map((d: any) => (
                                            <motion.div
                                                key={d.id}
                                                whileHover={{ y: -5 }}
                                                className="glass-card bg-[var(--bg-card)]/30 border border-[var(--border)]/50 rounded-[2.5rem] p-8 shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300 relative overflow-hidden group"
                                            >
                                                <div className="absolute top-0 right-0 p-1 px-2 bg-[var(--primary)]/5 rounded-bl-2xl border-l border-b border-[var(--border)]/30">
                                                    <span className="text-[9px] font-black text-[var(--primary)] uppercase tracking-tighter">Case #{d.id}</span>
                                                </div>
                                                <div className="flex justify-between items-start mb-6">
                                                    <h4 className="font-black text-xl text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">{d.subject}</h4>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${d.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                        d.status === 'Under Investigation' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                        }`}>
                                                        {d.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6 opacity-80">{d.message}</p>

                                                {d.adminResponse && (
                                                    <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 p-5 rounded-2xl relative">
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-3">
                                                            <ShieldCheck className="w-3.5 h-3.5" />
                                                            Command Center Message
                                                        </div>
                                                        <p className="text-sm text-[var(--text-main)] italic font-medium">"{d.adminResponse}"</p>
                                                        <div className="text-[10px] text-[var(--text-muted)] text-right mt-3 font-bold opacity-50">
                                                            Responded: {new Date(d.adminRespondedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-8 pt-6 flex items-center justify-between border-t border-[var(--border)]/50 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">
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
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-10"
                        >
                            {ordersLoading ? (
                                <div className="flex flex-col items-center justify-center py-32 bg-[var(--bg-card)]/20 rounded-[2.5rem] border border-[var(--border)]/50 backdrop-blur-sm">
                                    <Loader2 className="w-16 h-16 text-[var(--primary)] animate-spin mb-6" />
                                    <p className="text-xl font-black text-gradient-primary">Accessing our collection...</p>
                                    <p className="text-[var(--text-muted)] mt-2 font-medium">Retrieving your order history.</p>
                                </div>
                            ) : !orders || orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 text-[var(--text-muted)] bg-[var(--bg-card)]/20 rounded-[2.5rem] border border-dashed border-[var(--border)]/50">
                                    <div className="p-8 bg-[var(--bg-input)]/50 rounded-full mb-6">
                                        <ShoppingBag className="w-16 h-16 opacity-20" />
                                    </div>
                                    <p className="text-2xl font-black text-[var(--text-main)]">Your collection is empty</p>
                                    <p className="text-sm mt-2 font-medium max-w-xs text-center">You haven't placed any orders yet. Start your journey with our collection.</p>
                                    <button
                                        onClick={() => setSearchParams({ tab: 'shop' })}
                                        className="mt-8 px-8 py-3 bg-[var(--primary)] text-white font-black rounded-2xl shadow-lg hover:shadow-[var(--accent-glow)] transition-all active:scale-95"
                                    >
                                        Explore The Collection
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-10">
                                    {orders.map((order: any) => (
                                        <motion.div
                                            key={order.id}
                                            layout
                                            className="glass-card bg-[var(--bg-card)]/30 border border-[var(--border)]/50 rounded-[2.5rem] overflow-hidden hover:border-[var(--primary)]/30 transition-all duration-500 shadow-xl"
                                        >
                                            <div className="p-5 md:p-7 flex flex-col xl:flex-row gap-7">
                                                <div className="flex-1 space-y-8">
                                                    <div className="flex flex-wrap items-center justify-between gap-6">
                                                        <div className="flex items-center gap-6">
                                                            <div className="p-3 bg-[var(--bg-input)]/50 rounded-2xl border border-[var(--border)]/50">
                                                                <ShoppingBag className="w-6 h-6 text-[var(--primary)]" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-0.5 opacity-60">Order Reference</label>
                                                                <p className="font-mono text-lg font-black text-[var(--text-main)]">#{order.displayId || order.id}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right hidden sm:block">
                                                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1 opacity-60">Status</label>
                                                                {order.status === 'Delivered' ? (
                                                                    <span className="flex items-center gap-1.5 px-4 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                                        {order.status}
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        {order.status}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1 opacity-60">Payment</label>
                                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${order.paymentStatus === 'Paid'
                                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                                    } `}>
                                                                    {order.paymentStatus || 'Unpaid'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[var(--bg-input)]/30 rounded-3xl border border-[var(--border)]/50">
                                                        <div>
                                                            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 opacity-60">Date</label>
                                                            <p className="text-sm font-bold text-[var(--text-main)]">{new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 opacity-60">Receipts</label>
                                                            <div className="flex gap-2">
                                                                {order.paymentReceipt && (
                                                                    <a
                                                                        href={getImageUrl(order.paymentReceipt)}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all shadow-sm"
                                                                        title="Payment Confirmation"
                                                                    >
                                                                        <Receipt className="w-4 h-4" />
                                                                    </a>
                                                                )}
                                                                {order.isFinalReceiptSent && (
                                                                    <button
                                                                        onClick={() => setViewingReceipt(order)}
                                                                        className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                                                        title="Final Receipt"
                                                                    >
                                                                        <File className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2 text-right">
                                                            <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-0.5 opacity-60">Exquisite Total</label>
                                                            <p className="text-2xl font-black text-gradient-primary">{formatPrice(order.total || 0)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-60">Secured Items ({(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).length})</label>
                                                        <div className="flex flex-wrap gap-4">
                                                            {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).map((item: any, idx: number) => (
                                                                <div key={idx} className="group relative w-16 h-16 rounded-2xl overflow-hidden bg-[var(--bg-input)] border border-[var(--border)]/50 hover:border-[var(--primary)] transition-all">
                                                                    <img
                                                                        src={getImageUrl(item.image)}
                                                                        alt={item.name}
                                                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                                                    />
                                                                    <div className="absolute inset-x-0 bottom-0 bg-[var(--primary)]/90 text-[8px] text-center font-black text-white py-0.5">
                                                                        x{item.quantity}
                                                                    </div>
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                                        <span className="text-[8px] font-black text-white text-center px-1 leading-tight">{item.name}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-full xl:w-60 bg-[var(--bg-input)]/20 rounded-[2rem] border border-[var(--border)]/50 p-5 flex flex-col">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-5 opacity-60 text-center">Order Management</h4>
                                                    <div className="space-y-4 mt-auto">
                                                        {editingOrderId === order.id ? (
                                                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                                                <div className="space-y-4">
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Customer Identity</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Full Name"
                                                                            value={editFormData.customerName || ''}
                                                                            onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                                                                            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs font-bold focus:border-[var(--primary)]/50 focus:ring-4 focus:ring-[var(--primary)]/5 outline-none transition-all placeholder:opacity-30"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Delivery Protocol</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Shipping Address"
                                                                            value={editFormData.customerAddress || ''}
                                                                            onChange={(e) => setEditFormData({ ...editFormData, customerAddress: e.target.value })}
                                                                            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs font-bold focus:border-[var(--primary)]/50 focus:ring-4 focus:ring-[var(--primary)]/5 outline-none transition-all placeholder:opacity-30"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Contact Reference</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Phone Number"
                                                                            value={editFormData.customerPhone || ''}
                                                                            onChange={(e) => setEditFormData({ ...editFormData, customerPhone: e.target.value })}
                                                                            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs font-bold focus:border-[var(--primary)]/50 focus:ring-4 focus:ring-[var(--primary)]/5 outline-none transition-all placeholder:opacity-30"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5 pt-2">
                                                                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Order Manifest</label>
                                                                        <div className="space-y-2 max-h-[180px] overflow-y-auto no-scrollbar pr-1">
                                                                            {editFormData.items?.map((item: any, idx: number) => (
                                                                                <div key={idx} className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border)] p-2 rounded-xl group transition-all hover:border-[var(--primary)]/30">
                                                                                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-[var(--border)] shrink-0">
                                                                                        <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-[10px] font-bold text-[var(--text-main)] truncate leading-tight">{item.name}</p>
                                                                                        <p className="text-[9px] text-[var(--text-muted)] font-bold">Qty: {item.quantity}</p>
                                                                                    </div>
                                                                                    {editFormData.items.length > 1 && (
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                const newItems = [...editFormData.items];
                                                                                                newItems.splice(idx, 1);
                                                                                                setEditFormData({ ...editFormData, items: newItems });
                                                                                            }}
                                                                                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                                            title="Remove Item"
                                                                                        >
                                                                                            <Trash2 className="w-3 h-3" />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-3 pt-2">
                                                                    <button
                                                                        onClick={() => editOrderMutation.mutate({ orderId: order.id, data: editFormData })}
                                                                        disabled={editOrderMutation.isPending}
                                                                        className="flex-1 py-4 bg-[var(--primary)] text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all disabled:opacity-50"
                                                                    >
                                                                        {editOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Update'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingOrderId(null)}
                                                                        className="flex-1 py-4 bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-main)] rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all hover:bg-[var(--bg-card)]"
                                                                    >
                                                                        Back
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 gap-4">
                                                                {(order.status === 'Pending' && order.paymentStatus !== 'Paid') && (
                                                                    <div className="flex flex-col gap-2.5">
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingOrderId(order.id);
                                                                                setEditFormData({
                                                                                    customerName: order.customerName,
                                                                                    customerAddress: order.customerAddress,
                                                                                    customerPhone: order.customerPhone,
                                                                                    items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
                                                                                });
                                                                            }}
                                                                            className="w-full flex items-center justify-center gap-3 py-2.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white text-[var(--primary)] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 group"
                                                                        >
                                                                            <Edit2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" /> Edit Credentials
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                if (confirm('WARNING: Cancelling this order will permanently erase it from our records. Proceed?')) {
                                                                                    deleteOrderMutation.mutate(order.id);
                                                                                }
                                                                            }}
                                                                            className="w-full flex items-center justify-center gap-3 py-2.5 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-500/80 hover:shadow-lg hover:shadow-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" /> Permanent Cancel
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                {order.status === 'Delivered' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            if (confirm('This will remove the order from your history but it will remain in our archives. Continue?')) {
                                                                                deleteOrderMutation.mutate(order.id);
                                                                            }
                                                                        }}
                                                                        className="w-full flex items-center justify-center gap-3 py-2.5 bg-[var(--text-muted)]/5 hover:bg-[var(--text-muted)] hover:text-white text-[var(--text-muted)] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" /> Delete from History
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => {
                                                                        setDisputingOrder(order);
                                                                        setDisputeData({ subject: `Dispute for Order #${order.displayId || order.id}`, message: '' });
                                                                    }}
                                                                    className="w-full flex items-center justify-center gap-3 py-2.5 bg-yellow-500/10 hover:bg-yellow-500 hover:text-white text-yellow-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                                                                >
                                                                    <Gavel className="w-4 h-4" /> Dispute Resolve
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'policy' && <Policy />}
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
        </div>
    );
}
