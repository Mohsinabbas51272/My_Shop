import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { IMAGE_BASE_URL } from '../lib/api';
import Navbar from './Navbar';
import { useCurrencyStore } from '../store/useCurrencyStore';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Plus,
    ExternalLink,
    Trash2,
    CheckCircle,
    Loader2,
    Package,
    User,
    Phone,
    MapPin,
    CreditCard,
    Receipt,
    MessageSquare
} from 'lucide-react';

export default function AdminDashboard() {
    const queryClient = useQueryClient();
    const { currency, convertPrice, formatPrice } = useCurrencyStore();
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', image: '' });
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users' | 'queries'>('products');
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const { data: dashboardCounts } = useQuery({
        queryKey: ['dashboard-counts'],
        queryFn: async () => (await api.get('/complaints/counts')).data,
    });

    const { data: complaints, isLoading: complaintsLoading } = useQuery({
        queryKey: ['complaints'],
        queryFn: async () => (await api.get('/complaints')).data,
        enabled: activeTab === 'queries',
    });

    const { data: products, isLoading: productsLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => (await api.get('/products')).data,
    });

    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => (await api.get('/orders')).data,
    });

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => (await api.get('/users')).data,
    });

    const addProductMutation = useMutation({
        mutationFn: (product: any) => api.post('/products', product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setNewProduct({ name: '', price: '', description: '', image: '' });
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/products/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    });

    const updateOrderStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/orders/${id}/status`, { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    });

    const updatePaymentStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/orders/${id}/payment-status`, { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    });

    const deleteOrderMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/orders/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
        }
    });

    const updateComplaintStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/complaints/${id}/status`, { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complaints'] }),
    });

    const deleteComplaintMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/complaints/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
        }
    });

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${IMAGE_BASE_URL}${url}`;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setNewProduct({ ...newProduct, image: response.data.url });
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'products' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-input)]'}`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'orders' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-input)]'}`}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Orders
                        {dashboardCounts?.orders > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-[var(--bg-main)] shadow-sm">
                                {dashboardCounts.orders}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'users' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-input)]'}`}
                    >
                        <Users className="w-4 h-4" />
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('queries')}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'queries' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-input)]'}`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Queries
                        {dashboardCounts?.complaints > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-[var(--bg-main)] shadow-sm">
                                {dashboardCounts.complaints}
                            </span>
                        )}
                    </button>
                </div>

                {/* Dashboard Counters Removed - Moved to Badges */}

                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full">
                        {/* Add Product Form */}
                        <section className="lg:col-span-1">
                            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-2xl sticky top-28 shadow-xl">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--text-main)]">
                                    <Plus className="w-5 h-5 text-[var(--primary)]" />
                                    Add New Product
                                </h2>
                                <div className="space-y-4">
                                    <input
                                        placeholder="Product Name"
                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text-main)] focus:ring-2 focus:ring-[var(--primary)]/50 outline-none"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    />
                                    <input
                                        placeholder="Price (PKR)"
                                        type="number"
                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text-main)] focus:ring-2 focus:ring-[var(--primary)]/50 outline-none"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="Description"
                                        rows={3}
                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text-main)] focus:ring-2 focus:ring-[var(--primary)]/50 outline-none resize-none"
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    />

                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                            Product Image
                                        </label>
                                        <div className="flex flex-col gap-4">
                                            <input
                                                placeholder="Or paste Image URL"
                                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text-main)] focus:ring-2 focus:ring-[var(--primary)]/50 outline-none"
                                                value={newProduct.image}
                                                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                                            />

                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[var(--border)]"></span></div>
                                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[var(--bg-card)] px-2 text-[var(--text-muted)]">Or Upload</span></div>
                                            </div>

                                            {newProduct.image && (newProduct.image.startsWith('/') || newProduct.image.startsWith('http')) ? (
                                                <div className="relative aspect-video rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg-input)]">
                                                    <img src={getImageUrl(newProduct.image)} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => setNewProduct({ ...newProduct, image: '' })}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--bg-input)]/50 hover:bg-[var(--bg-input)] hover:border-[var(--primary)]/50 transition-all cursor-pointer group">
                                                    {uploading ? (
                                                        <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Plus className="w-8 h-8 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors mb-2" />
                                                            <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text-main)]">Click to upload image</span>
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                        disabled={uploading}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => addProductMutation.mutate({ ...newProduct, price: parseFloat(newProduct.price) })}
                                        disabled={addProductMutation.isPending || uploading || !newProduct.image}
                                        className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-glow)] disabled:opacity-50"
                                    >
                                        {addProductMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Product'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Inventory Management */}
                        <section className="lg:col-span-2">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--text-main)]">
                                <Package className="w-5 h-5 text-[var(--primary)]" />
                                Inventory Management
                            </h2>
                            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden text-sm uppercase font-bold tracking-widest text-[var(--text-muted)] shadow-xl">
                                <table className="w-full text-left">
                                    <thead className="bg-[var(--bg-input)] text-[var(--text-muted)]">
                                        <tr>
                                            <th className="p-4">Image</th>
                                            <th className="p-4">Product</th>
                                            <th className="p-4">Price ({currency})</th>
                                            <th className="p-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {productsLoading ? (
                                            <tr><td colSpan={4} className="p-8 text-center uppercase tracking-widest opacity-50">Loading...</td></tr>
                                        ) : products?.map((p: any) => (
                                            <tr key={p.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="w-12 h-12 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] overflow-hidden">
                                                        <img src={getImageUrl(p.image)} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                </td>
                                                <td className="p-4 text-[var(--text-main)] normal-case tracking-normal font-semibold">{p.name}</td>
                                                <td className="p-4 text-[var(--primary)]">{formatPrice(p.price)}</td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => deleteProductMutation.mutate(p.id)}
                                                        className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                            <ShoppingBag className="w-5 h-5 text-[var(--primary)]" />
                            Order Management
                        </h2>
                        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[var(--bg-input)] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Order ID</th>
                                        <th className="p-4">Customer Details</th>
                                        <th className="p-4">Payment</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Total ({currency})</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {ordersLoading ? (
                                        <tr><td colSpan={6} className="p-8 text-center uppercase tracking-widest opacity-50">Loading...</td></tr>
                                    ) : orders?.map((o: any) => (
                                        <tr key={o.id} className="hover:bg-[var(--bg-input)]/30 transition-colors group">
                                            <td className="p-4 text-[var(--text-muted)] font-mono">#{o.id}</td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-black text-[var(--text-main)] flex items-center gap-1.5">
                                                        <User className="w-3.5 h-3.5 text-[var(--primary)]" />
                                                        {o.customerName || 'N/A'}
                                                    </span>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="px-2 py-0.5 bg-[var(--bg-input)] rounded text-[10px] font-bold text-[var(--text-muted)] border border-[var(--border)] flex items-center gap-1">
                                                            <Phone className="w-2.5 h-2.5" />
                                                            {o.customerPhone || 'N/A'}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-[var(--bg-input)] rounded text-[10px] font-bold text-[var(--text-muted)] border border-[var(--border)]">
                                                            ID: {o.customerCnic || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                                                        <MapPin className="w-3 h-3 opacity-50" />
                                                        {o.customerAddress || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-2">
                                                    <span className="px-2 py-0.5 bg-[var(--bg-input)] rounded text-[10px] font-bold text-[var(--text-muted)] border border-[var(--border)] uppercase w-fit">
                                                        {o.paymentMethod || 'N/A'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updatePaymentStatusMutation.mutate({ id: o.id, status: o.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid' })}
                                                            disabled={updatePaymentStatusMutation.isPending}
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border transition-all ${o.paymentStatus === 'Paid'
                                                                ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                                                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20'
                                                                }`}
                                                            title="Click to toggle status"
                                                        >
                                                            {o.paymentStatus || 'Unpaid'}
                                                        </button>
                                                        {o.paymentReceipt && (
                                                            <a
                                                                href={getImageUrl(o.paymentReceipt)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-[var(--primary)] hover:underline flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                                                                title="View Payment Receipt"
                                                            >
                                                                <Receipt className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${o.status === 'Delivered'
                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                    : 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20'
                                                    }`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-[var(--text-main)]">{formatPrice(o.total)}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {o.status === 'Pending' && (
                                                        <button
                                                            onClick={() => updateOrderStatusMutation.mutate({ id: o.id, status: 'Delivered' })}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white rounded-lg transition-all text-xs border border-green-500/20"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            Deliver
                                                        </button>
                                                    )}
                                                    {o.status === 'Delivered' && (
                                                        <button
                                                            onClick={() => deleteOrderMutation.mutate(o.id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-all text-xs border border-red-500/20"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                            <Users className="w-5 h-5 text-[var(--primary)]" />
                            User Registry
                        </h2>
                        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[var(--bg-input)] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Orders</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {usersLoading ? (
                                        <tr><td colSpan={4} className="p-8 text-center uppercase tracking-widest opacity-50">Loading...</td></tr>
                                    ) : users?.map((u: any) => (
                                        <tr key={u.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                            <td className="p-4 font-semibold text-[var(--text-main)]">{u.name || 'Anonymous'}</td>
                                            <td className="p-4 text-[var(--text-muted)]">{u.email}</td>
                                            <td className="p-4 text-[var(--primary)] font-bold">{u._count?.orders || 0}</td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => setSelectedUser(u.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)] text-[var(--primary)] hover:text-white rounded-lg transition-all text-xs border border-[var(--primary)]/20"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'queries' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                            <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
                            Customer Queries
                        </h2>
                        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[var(--bg-input)] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Customer</th>
                                        <th className="p-4">Message</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {complaintsLoading ? (
                                        <tr><td colSpan={5} className="p-8 text-center uppercase tracking-widest opacity-50">Loading...</td></tr>
                                    ) : complaints?.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">No queries found.</td></tr>
                                    ) : complaints?.map((c: any) => (
                                        <tr key={c.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                            <td className="p-4 text-[var(--text-muted)] whitespace-nowrap">
                                                {new Date(c.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold text-[var(--text-main)]">{c.name}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{c.email}</p>
                                            </td>
                                            <td className="p-4 max-w-sm">
                                                <p className="font-bold text-[var(--text-main)] truncate">{c.subject}</p>
                                                <p className="text-[var(--text-muted)] line-clamp-2">{c.message}</p>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => updateComplaintStatusMutation.mutate({ id: c.id, status: c.status === 'Pending' ? 'Resolved' : 'Pending' })}
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border transition-all ${c.status === 'Resolved'
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                                                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20'
                                                        }`}
                                                >
                                                    {c.status}
                                                </button>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => deleteComplaintMutation.mutate(c.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all text-xs border border-red-500/20"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* User Details Modal */}
            {selectedUser && (
                <UserDetailsModal
                    userId={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    getImageUrl={getImageUrl}
                />
            )}
        </div>
    );
}

function UserDetailsModal({ userId, onClose, getImageUrl }: { userId: number; onClose: () => void; getImageUrl: (url: string) => string }) {
    const { currency, convertPrice, formatPrice } = useCurrencyStore();
    const { data: user, isLoading } = useQuery({
        queryKey: ['users', userId],
        queryFn: async () => (await api.get(`/users/${userId}`)).data,
    });

    if (!user && !isLoading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-main)]/80 backdrop-blur-sm">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-input)]/50">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                        <User className="w-5 h-5 text-[var(--primary)]" />
                        User Profile & History
                    </h3>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-red-500 transition-colors">
                        <Plus className="w-6 h-6 rotate-45" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
                            <p className="mt-4 text-[var(--text-muted)]">Loading user info...</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* User Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-[var(--bg-input)]/50 p-6 rounded-2xl border border-[var(--border)]/50">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Full Name</label>
                                    <p className="text-lg font-bold text-[var(--text-main)]">{user.name || 'Anonymous'}</p>
                                </div>
                                <div className="bg-[var(--bg-input)]/50 p-6 rounded-2xl border border-[var(--border)]/50">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Email Address</label>
                                    <p className="text-lg font-bold text-[var(--text-main)]">{user.email}</p>
                                </div>
                                <div className="bg-[var(--bg-input)]/50 p-6 rounded-2xl border border-[var(--border)]/50">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">CNIC Number</label>
                                    <p className="text-lg font-bold text-[var(--text-main)]">{user.cnic || 'Not Provided'}</p>
                                </div>
                                <div className="bg-[var(--bg-input)]/50 p-6 rounded-2xl border border-[var(--border)]/50">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Contact Number</label>
                                    <p className="text-lg font-bold text-[var(--text-main)]">{user.phone || 'Not Provided'}</p>
                                </div>
                                <div className="bg-[var(--bg-input)]/50 p-6 rounded-2xl border border-[var(--border)]/50">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Default Payment</label>
                                    <p className="text-lg font-bold text-[var(--text-main)]">{user.paymentMethod || 'Not Set'}</p>
                                </div>
                                <div className="bg-[var(--bg-input)]/50 p-6 rounded-2xl border border-[var(--border)]/50 lg:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Home Address</label>
                                    <p className="text-lg font-bold text-[var(--text-main)]">{user.address || 'No Address Saved'}</p>
                                </div>
                                <div className="bg-[var(--bg-input)]/50 p-6 rounded-2xl border border-[var(--border)]/50">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Customer Since</label>
                                    <p className="text-lg font-bold text-[var(--text-main)]">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Order History */}
                            <div>
                                <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-[var(--text-main)]">
                                    <ShoppingBag className="w-5 h-5 text-[var(--primary)]" />
                                    Order History ({user.orders?.length || 0})
                                </h4>
                                <div className="space-y-4">
                                    {!user.orders || user.orders.length === 0 ? (
                                        <p className="text-[var(--text-muted)] italic text-center py-8 bg-[var(--bg-input)]/30 rounded-2xl border border-dashed border-[var(--border)]">No orders placed yet.</p>
                                    ) : user.orders.map((order: any) => (
                                        <div key={order.id} className="bg-[var(--bg-input)]/50 border border-[var(--border)] rounded-2xl p-6">
                                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-[var(--border)]/50">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[var(--text-muted)] font-mono">#{order.id}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${order.status === 'Delivered'
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[var(--text-muted)] text-xs">{new Date(order.createdAt).toLocaleString()}</span>
                                                    <span className="text-lg font-bold text-[var(--primary)]">{formatPrice(order.total)}</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).map((item: any, idx: number) => (
                                                    <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border)]">
                                                        <img
                                                            src={getImageUrl(item.image)}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                        />
                                                        <div className="absolute inset-x-0 bottom-0 bg-[var(--bg-main)]/80 p-1.5 text-[10px] text-center font-bold text-[var(--text-muted)]">
                                                            Qty: {item.quantity}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
