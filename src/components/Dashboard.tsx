import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../lib/api';
import Navbar from './Navbar';
import ProductDetailsModal from './ProductDetailsModal';
import { useCartStore } from '../store/useCartStore';
import { Plus, Loader2, PackageX, ShoppingBag, Clock, CheckCircle2, Receipt, Trash2, Edit2, MessageCircle, AlertCircle, Gavel, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { toast } from '../store/useToastStore';

export default function Dashboard() {
    const { user } = useAuthStore();
    const addItem = useCartStore((state) => state.addItem);
    const { formatPrice } = useCurrencyStore();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'shop';
    const [selectedProduct, setSelectedProduct] = useState<any>(null);


    const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
    const [disputingOrder, setDisputingOrder] = useState<any>(null);
    const [disputeData, setDisputeData] = useState({ subject: '', message: '' });
    const [editFormData, setEditFormData] = useState<any>({});

    // Shop discovery controls
    const [q, setQ] = useState('');
    const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
    const [page, setPage] = useState(1);
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');

    useEffect(() => {
        // Reset to first page whenever filters change
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, sort, minPrice, maxPrice]);

    const getImageUrl = (url: string) => {
        if (!url) return 'https://via.placeholder.com/400';
        if (url.startsWith('http')) return url;
        return `${IMAGE_BASE_URL}${url}`;
    };

    const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
        queryKey: ['products', q, sort, page, minPrice, maxPrice],
        queryFn: async () => (
            await api.get('/products', {
                params: {
                    q: q || undefined,
                    sort,
                    page,
                    limit: 24,
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
    });

    const { data: complaints, isLoading: complaintsLoading } = useQuery({
        queryKey: ['complaints-me', user?.id],
        queryFn: async () => (await api.get(`/complaints?userId=${user?.id}`)).data,
        enabled: !!user?.id,
    });

    const { data: disputes, isLoading: disputesUserLoading } = useQuery({
        queryKey: ['disputes-me', user?.id],
        queryFn: async () => (await api.get('/disputes')).data,
        enabled: !!user?.id,
    });

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
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-main)]">
                            {activeTab === 'shop' ? 'Our Collection' : activeTab === 'orders' ? 'My Order History' : 'My Queries & Support'}
                        </h1>
                        <p className="text-[var(--text-muted)] mt-2">
                            {activeTab === 'shop'
                                ? 'Discover premium items curated just for you.'
                                : activeTab === 'orders'
                                    ? 'Track your recent purchases and delivery status.'
                                    : 'View your support queries and admin responses.'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSearchParams({ tab: 'shop' })}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'shop'
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--primary)]'
                                }`}
                        >
                            Shop
                        </button>
                        <button
                            onClick={() => setSearchParams({ tab: 'orders' })}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'orders'
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--primary)]'
                                }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Orders
                        </button>
                        <button
                            onClick={() => setSearchParams({ tab: 'complaints' })}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'complaints'
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--primary)]'
                                }`}
                        >
                            <MessageCircle className="w-4 h-4" />
                            Queries
                        </button>
                    </div>
                </div>

                {activeTab === 'shop' ? (
                    <>
                        <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div className="lg:col-span-6">
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Search</label>
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search products (name, description)"
                                    className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/40 outline-none"
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Sort</label>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as any)}
                                    className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/40 outline-none cursor-pointer"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Min Price</label>
                                <input
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    inputMode="numeric"
                                    placeholder="0"
                                    className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/40 outline-none"
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Max Price</label>
                                <input
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    inputMode="numeric"
                                    placeholder="999999"
                                    className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/40 outline-none"
                                />
                            </div>
                        </div>

                        {productsLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
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
                            <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)]">
                                <PackageX className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-xl font-medium">No products found</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {productsData?.items?.map((product: any) => (
                                        <div
                                            key={product.id}
                                            onClick={() => setSelectedProduct(product)}
                                            className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden hover:border-[var(--primary)]/50 transition-all shadow-xl hover:shadow-[var(--accent-glow)] flex flex-col h-full cursor-pointer"
                                        >
                                            <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-[var(--bg-input)]/50">
                                                <img
                                                    src={getImageUrl(product.image)}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>

                                            <div className="p-5 flex flex-col flex-grow">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="font-bold text-lg text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">{product.name}</h3>
                                                    <span className="text-[var(--primary)] font-bold">{formatPrice(product.price)}</span>
                                                </div>
                                                <p className="text-[var(--text-muted)] text-sm line-clamp-2 mb-6 flex-grow">
                                                    {product.description || 'No description available for this premium item.'}
                                                </p>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addItem(product);
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 bg-[var(--primary)]/10 hover:bg-[var(--primary)] text-[var(--primary)] hover:text-white font-semibold py-2.5 rounded-xl transition-all border border-[var(--primary)]/20 active:scale-[0.98]"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    ))}
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
                    </>
                ) : activeTab === 'complaints' ? (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <MessageCircle className="w-6 h-6 text-[var(--primary)]" />
                                Support & Disputes
                            </h2>
                            <p className="text-[var(--text-muted)] mt-1">Track your order disputes and support queries.</p>
                        </div>

                        {/* Disputes Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                                <Gavel className="w-4 h-4" /> Order Disputes
                            </h3>
                            {disputesUserLoading ? (
                                <div className="p-12 text-center animate-pulse bg-[var(--bg-card)]/30 rounded-3xl border border-[var(--border)]">
                                    Checking disputes...
                                </div>
                            ) : !disputes || disputes.length === 0 ? (
                                <div className="p-12 text-center text-[var(--text-muted)] bg-[var(--bg-card)]/30 rounded-3xl border border-dashed border-[var(--border)]">
                                    No active disputes found.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {disputes.map((d: any) => (
                                        <div key={d.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-xl space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-tighter">Case #{d.id}</span>
                                                    <h4 className="font-bold text-[var(--text-main)] mt-1">{d.subject}</h4>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${d.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    d.status === 'Under Investigation' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                    }`}>
                                                    {d.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{d.message}</p>

                                            {d.adminResponse && (
                                                <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 p-4 rounded-xl space-y-2">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Command Center Response
                                                    </div>
                                                    <p className="text-sm text-[var(--text-main)] italic">"{d.adminResponse}"</p>
                                                    <div className="text-[10px] text-[var(--text-muted)] text-right">
                                                        {new Date(d.adminRespondedAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-2 flex items-center justify-between border-t border-[var(--border)]/50 text-[10px] font-bold text-[var(--text-muted)]">
                                                <span>Order: #{d.order?.displayId || d.orderId}</span>
                                                <span>Started: {new Date(d.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* General Queries Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4" /> Support Queries
                                </h3>
                                <Link
                                    to="/contact"
                                    className="text-xs font-bold text-[var(--primary)] hover:underline"
                                >
                                    + Submit New Query
                                </Link>
                            </div>
                            {complaintsLoading ? (
                                <div className="p-12 text-center animate-pulse bg-[var(--bg-card)]/30 rounded-3xl border border-[var(--border)]">
                                    Loading queries...
                                </div>
                            ) : !complaints || complaints.length === 0 ? (
                                <div className="p-12 text-center text-[var(--text-muted)] bg-[var(--bg-card)]/30 rounded-3xl border border-dashed border-[var(--border)]">
                                    No general support queries found.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {complaints.map((c: any) => (
                                        <div key={c.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-xl space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-[var(--text-main)]">{c.subject}</h4>
                                                    {c.orderId && (
                                                        <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest block mt-0.5">
                                                            Order: #{c.order?.displayId || c.orderId}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${c.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--text-muted)] line-clamp-3">{c.message}</p>
                                            {c.adminResponse && (
                                                <div className="bg-[var(--bg-input)]/50 border border-[var(--border)] p-4 rounded-xl space-y-1">
                                                    <div className="font-bold text-[10px] text-[var(--primary)] uppercase tracking-widest">Admin Response</div>
                                                    <p className="text-sm text-[var(--text-main)] italic">"{c.adminResponse}"</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'orders' ? (
                    <div className="space-y-6">
                        {ordersLoading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
                                <p className="mt-4 text-[var(--text-muted)] font-medium">Retrieving your orders...</p>
                            </div>
                        ) : !orders || orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)] bg-[var(--bg-card)]/30 rounded-3xl border border-dashed border-[var(--border)]">
                                <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-xl font-medium">No orders found yet</p>
                                <button
                                    onClick={() => setSearchParams({ tab: 'shop' })}
                                    className="mt-4 text-[var(--primary)] hover:underline font-bold"
                                >
                                    Start shopping now
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {orders.map((order: any) => (
                                    <div key={order.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 md:p-6 hover:border-[var(--primary)]/30 transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--border)]/50">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:flex md:items-center md:gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Order ID</label>
                                                    <p className="font-mono text-[var(--text-main)]">#{order.displayId || order.id}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Status</label>
                                                    <div className="flex items-center gap-2">
                                                        {order.status === 'Delivered' ? (
                                                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-bold uppercase">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                {order.status}
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 rounded-full text-[10px] font-bold uppercase">
                                                                <Clock className="w-3 h-3" />
                                                                {order.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Payment</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${order.paymentStatus === 'Paid'
                                                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                            } `}>
                                                            {order.paymentStatus || 'Unpaid'}
                                                        </span>
                                                        {order.paymentReceipt && (
                                                            <a
                                                                href={getImageUrl(order.paymentReceipt)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-[var(--primary)] hover:underline flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                                                                title="View Receipt"
                                                            >
                                                                <Receipt className="w-3 h-3" />
                                                                Receipt
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Date</label>
                                                    <p className="text-sm text-[var(--text-muted)]">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t lg:border-t-0 border-[var(--border)] flex flex-col items-end">
                                                <div className="text-[10px] text-[var(--text-muted)] space-y-1 w-full sm:w-48">
                                                    <div className="flex justify-between">
                                                        <span>Subtotal:</span>
                                                        <span className="text-[var(--text-main)] font-medium">{formatPrice((order.total || 0) - (order.userFee || 0) - (order.shippingFee || 0))}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Platform Fee (2%):</span>
                                                        <span className="text-[var(--text-main)] font-medium">{formatPrice(order.userFee || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Shipping Fee:</span>
                                                        <span className="text-[var(--text-main)] font-medium">{formatPrice(order.shippingFee || 0)}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-right">
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Total Amount</label>
                                                    <p className="text-xl md:text-2xl font-bold text-[var(--primary)]">{formatPrice(order.total || 0)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4 p-4 bg-[var(--bg-input)]/30 rounded-xl border border-[var(--border)] flex gap-2">
                                            {editingOrderId === order.id ? (
                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <label className="text-xs font-bold uppercase text-[var(--text-muted)] block mb-2">Customer Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Customer Name"
                                                            value={editFormData.customerName || ''}
                                                            onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold uppercase text-[var(--text-muted)] block mb-2">Address</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Address"
                                                            value={editFormData.customerAddress || ''}
                                                            onChange={(e) => setEditFormData({ ...editFormData, customerAddress: e.target.value })}
                                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold uppercase text-[var(--text-muted)] block mb-2">Phone</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Phone"
                                                            value={editFormData.customerPhone || ''}
                                                            onChange={(e) => setEditFormData({ ...editFormData, customerPhone: e.target.value })}
                                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold uppercase text-[var(--text-muted)] block mb-2">Item Quantities</label>
                                                        <div className="space-y-2">
                                                            {editFormData.items?.map((item: any, idx: number) => (
                                                                <div key={idx} className="flex items-center gap-3 bg-[var(--bg-input)] p-2 rounded-lg">
                                                                    <img src={getImageUrl(item.image)} alt={item.name} className="w-12 h-12 rounded object-cover" />
                                                                    <div className="flex-1">
                                                                        <p className="text-xs font-bold">{item.name}</p>
                                                                        <p className="text-[10px] text-[var(--text-muted)]">{formatPrice(item.price)}</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            onClick={() => {
                                                                                if (item.quantity > 1) {
                                                                                    const newItems = [...editFormData.items];
                                                                                    newItems[idx].quantity -= 1;
                                                                                    setEditFormData({ ...editFormData, items: newItems });
                                                                                }
                                                                            }}
                                                                            className="px-2 py-1 bg-[var(--bg-card)] border border-[var(--border)] rounded text-xs"
                                                                        >
                                                                            −
                                                                        </button>
                                                                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                                        <button
                                                                            onClick={() => {
                                                                                const newItems = [...editFormData.items];
                                                                                newItems[idx].quantity += 1;
                                                                                setEditFormData({ ...editFormData, items: newItems });
                                                                            }}
                                                                            className="px-2 py-1 bg-[var(--bg-card)] border border-[var(--border)] rounded text-xs"
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => editOrderMutation.mutate({ orderId: order.id, data: editFormData })}
                                                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingOrderId(null)}
                                                            className="flex-1 px-3 py-2 bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/80 border border-[var(--border)] rounded-lg text-xs font-bold transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {(order.status === 'Pending' && order.paymentStatus !== 'Paid') && (
                                                        <>
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
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/20 rounded-lg text-xs font-bold transition-all"
                                                            >
                                                                <Edit2 className="w-3 h-3" /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('Are you sure you want to delete this order?')) {
                                                                        deleteOrderMutation.mutate(order.id);
                                                                    }
                                                                }}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold transition-all"
                                                            >
                                                                <Trash2 className="w-3 h-3" /> Delete
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setDisputingOrder(order);
                                                                    setDisputeData({ subject: `Dispute for Order #${order.displayId || order.id}`, message: '' });
                                                                }}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-600 border border-yellow-500/20 rounded-lg text-xs font-bold transition-all"
                                                            >
                                                                <Gavel className="w-3 h-3" /> Dispute
                                                            </button>
                                                        </>
                                                    )}
                                                    {(order.status !== 'Pending' || order.paymentStatus === 'Paid') && (
                                                        <button
                                                            onClick={() => {
                                                                setDisputingOrder(order);
                                                                setDisputeData({ subject: `Dispute for Order #${order.displayId || order.id}`, message: '' });
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-600 border border-yellow-500/20 rounded-lg text-xs font-bold transition-all"
                                                        >
                                                            <Gavel className="w-3 h-3" /> Dispute Order
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
                                            {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).map((item: any, idx: number) => (
                                                <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden bg-[var(--bg-input)] border border-[var(--border)]">
                                                    <img
                                                        src={getImageUrl(item.image)}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 bg-[var(--bg-main)]/80 p-1 text-[8px] text-center font-bold text-[var(--text-main)]">
                                                        x{item.quantity}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : null}
            </main>

            {selectedProduct && (
                <ProductDetailsModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}

            {/* Dispute Modal */}
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
        </div >
    );
}
