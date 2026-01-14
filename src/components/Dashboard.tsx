import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../lib/api';
import Navbar from './Navbar';
import ProductDetailsModal from './ProductDetailsModal';
import { useCartStore } from '../store/useCartStore';
import { Plus, Loader2, PackageX, ShoppingBag, Clock, CheckCircle2, Receipt, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrencyStore } from '../store/useCurrencyStore';

export default function Dashboard() {
    const { user } = useAuthStore();
    const addItem = useCartStore((state) => state.addItem);
    const { formatPrice } = useCurrencyStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') === 'orders' ? 'orders' : 'shop';
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const getImageUrl = (url: string) => {
        if (!url) return 'https://via.placeholder.com/400';
        if (url.startsWith('http')) return url;
        return `${IMAGE_BASE_URL}${url}`;
    };

    const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
        queryKey: ['products'],
        queryFn: async () => (await api.get('/products')).data,
    });

    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['orders-me', user?.id],
        queryFn: async () => (await api.get(`/orders?userId=${user?.id}`)).data,
        enabled: !!user?.id,
    });

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-main)]">
                            {activeTab === 'shop' ? 'Our Collection' : 'My Order History'}
                        </h1>
                        <p className="text-[var(--text-muted)] mt-2">
                            {activeTab === 'shop'
                                ? 'Discover premium items curated just for you.'
                                : 'Track your recent purchases and delivery status.'}
                        </p>
                    </div>


                </div>

                {activeTab === 'shop' ? (
                    <>
                        {productsLoading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
                                <p className="mt-4 text-[var(--text-muted)] font-medium">Fetching products...</p>
                            </div>
                        ) : productsError ? (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-8 rounded-2xl text-center">
                                <p>Failed to load products. Please check if the backend is running.</p>
                            </div>
                        ) : products?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)]">
                                <PackageX className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-xl font-medium">No products found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {products.map((product: any) => (
                                    <div
                                        key={product.id}
                                        onClick={() => setSelectedProduct(product)}
                                        className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--primary)]/30 transition-all hover:shadow-2xl hover:shadow-[var(--accent-glow)] hover:-translate-y-1 cursor-pointer"
                                    >
                                        <div className="aspect-square relative overflow-hidden">
                                            <img
                                                src={getImageUrl(product.image)}
                                                alt={product.name}
                                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold text-lg text-[var(--text-main)]">{product.name}</h3>
                                                <span className="text-[var(--primary)] font-bold">{formatPrice(product.price)}</span>
                                            </div>
                                            <p className="text-[var(--text-muted)] text-sm line-clamp-2 mb-6">
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
                        )}
                    </>
                ) : (
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
                                    <div key={order.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--primary)]/30 transition-colors">
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--border)]/50">
                                            <div className="flex items-center gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Order ID</label>
                                                    <p className="font-mono text-[var(--text-main)]">#{order.id}</p>
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
                                                        <span className={`px - 2 py - 0.5 rounded - full text - [10px] font - bold uppercase border ${order.paymentStatus === 'Paid'
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
                                            <div className="text-right">
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Total Paid</label>
                                                <p className="text-2xl font-bold text-[var(--primary)]">{formatPrice(order.total)}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                            {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).map((item: any, idx: number) => (
                                                <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden bg-[var(--bg-input)] border border-[var(--border)]">
                                                    <img
                                                        src={getImageUrl(item.image)}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 bg-[var(--bg-main)]/80 p-1 text-[8px] text-center font-bold text-[var(--text-muted)]">
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
                )}
            </main>

            {selectedProduct && (
                <ProductDetailsModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div >
    );
}
