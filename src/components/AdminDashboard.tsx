import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { IMAGE_BASE_URL } from '../lib/api';
import { calculateDynamicPrice } from '../lib/pricing';
import Navbar from './Navbar';
import GoldCalculator from './GoldCalculator';
import OrderReceipt from './OrderReceipt';
import { useCurrencyStore } from '../store/useCurrencyStore';
import {
    TrendingUp,
    RefreshCw,
    ShieldCheck,
    ShieldAlert,
    AlertOctagon,
    History,
    Search,
    LayoutDashboard,
    ShoppingBag,
    Users,
    MessageSquare,
    ExternalLink,
    Gavel,
    Pencil,
    Plus,
    X,
    Trash2,
    Loader2,
    Package,
    Receipt,
    CheckCircle,
    FileText,
    Phone,
    MapPin,
    User,
    Menu
} from 'lucide-react';
import { toast } from '../store/useToastStore';

export default function AdminDashboard() {
    const queryClient = useQueryClient();
    const { currency, formatPrice } = useCurrencyStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        category: 'Gold',
        weightTola: '0',
        weightMasha: '0',
        weightRati: '0'
    });
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users' | 'queries' | 'rates' | 'local' | 'disputes' | 'audit'>('products');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
    const [respondText, setRespondText] = useState('');
    const [isCalcOpen, setIsCalcOpen] = useState(false);
    const [viewingReceipt, setViewingReceipt] = useState<any>(null);

    const { data: dashboardCounts } = useQuery({
        queryKey: ['dashboard-counts'],
        queryFn: async () => (await api.get('/complaints/counts')).data,
        refetchInterval: 10000, // 10 seconds
        refetchOnWindowFocus: true,
    });

    const { data: complaints, isLoading: complaintsLoading } = useQuery({
        queryKey: ['complaints'],
        queryFn: async () => (await api.get('/complaints')).data,
        enabled: activeTab === 'queries',
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: products, isLoading: productsLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => (await api.get('/products', { params: { page: 1, limit: 100 } })).data,
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => (await api.get('/orders')).data,
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => (await api.get('/users')).data,
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: disputes, isLoading: disputesLoading } = useQuery({
        queryKey: ['disputes'],
        queryFn: async () => (await api.get('/disputes')).data,
        enabled: activeTab === 'disputes' || activeTab === 'orders',
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: logs, isLoading: logsLoading } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: async () => (await api.get('/audit')).data,
        enabled: activeTab === 'audit',
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: goldRate, isLoading: goldLoading } = useQuery({
        queryKey: ['gold-rate'],
        queryFn: async () => (await api.get('/commodity/gold-rate')).data,
        refetchInterval: 3600000, // Refresh every hour
    });

    const { data: silverRate, isLoading: silverLoading } = useQuery({
        queryKey: ['silver-rate'],
        queryFn: async () => (await api.get('/commodity/silver-rate')).data,
        refetchInterval: 3600000, // Refresh every hour
    });

    const { data: rateSettings } = useQuery({
        queryKey: ['rate-settings'],
        queryFn: async () => (await api.get('/admin/rate-settings')).data,
    });

    const { data: detailedRates, isLoading: detailedLoading } = useQuery({
        queryKey: ['detailed-rates'],
        queryFn: async () => (await api.get('/commodity/detailed-rates')).data,
        enabled: true,
        refetchInterval: 10000,
    });

    const addProductMutation = useMutation({
        mutationFn: (product: any) => api.post('/products', product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setNewProduct({
                name: '',
                price: '',
                description: '',
                image: '',
                category: 'Gold',
                weightTola: '0',
                weightMasha: '0',
                weightRati: '0'
            });
            toast.success('Product created successfully!');
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/products/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setEditingProduct(null);
            setNewProduct({
                name: '',
                price: '',
                description: '',
                image: '',
                category: 'Gold',
                weightTola: '0',
                weightMasha: '0',
                weightRati: '0'
            });
            toast.success('Product updated successfully!');
        },
        onError: () => toast.error('Failed to update product'),
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted successfully!');
        },
        onError: () => toast.error('Failed to delete product'),
    });

    const updateOrderStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/orders/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Order status updated!');
        },
        onError: () => toast.error('Failed to update order status'),
    });

    // Admin can now confirm payments

    const deleteOrderMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/orders/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
            toast.success('Order deleted successfully!');
        },
        onError: () => toast.error('Failed to delete order'),
    });

    const sendReceiptMutation = useMutation({
        mutationFn: (id: number) => api.patch(`/admin/orders/${id}/send-receipt`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Final Receipt sent to user dashboard!');
        },
        onError: () => toast.error('Failed to send receipt'),
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

    const respondToComplaintMutation = useMutation({
        mutationFn: ({ id, response }: { id: number; response: string }) =>
            api.patch(`/complaints/${id}/respond`, { response }),
        onSuccess: () => {
            // Invalidate both admin and user queries
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
            // Invalidate all user-specific complaint queries
            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === 'complaints-me'
            });
            setSelectedComplaint(null);
            setRespondText('');
            toast.success('Response sent successfully!');
        },
        onError: () => toast.error('Failed to send response'),
    });

    const updateRateSettingsMutation = useMutation({
        mutationFn: (data: any) => api.patch('/admin/rate-settings', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rate-settings'] });
            queryClient.invalidateQueries({ queryKey: ['gold-rate'] });
            queryClient.invalidateQueries({ queryKey: ['silver-rate'] });
            toast.success('Rates adjusted successfully!');
        },
        onError: () => toast.error('Failed to update rates'),
    });

    // SuperAdmin Logic Migrated
    const verifyUser = useMutation({
        mutationFn: (id: number) => api.post(`/users/${id}/verify`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User verified successfully!');
        },
        onError: () => toast.error('Failed to verify user'),
    });

    const freezeUser = useMutation({
        mutationFn: (id: number) => api.post(`/users/${id}/freeze`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User account frozen successfully!');
        },
        onError: () => toast.error('Failed to freeze user'),
    });

    const blockUser = useMutation({
        mutationFn: (id: number) => api.post(`/users/${id}/block`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User blocked successfully!');
        },
        onError: () => toast.error('Failed to block user'),
    });

    const registerFIR = useMutation({
        mutationFn: ({ id, details }: { id: number, details: string }) => api.post(`/users/${id}/register-fir`, { details }),
        onSuccess: () => {
            toast.success('Legal action recorded in system audit.');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: () => toast.error('Failed to record legal action'),
    });

    const deleteUser = useMutation({
        mutationFn: (id: number) => api.delete(`/users/${id}`),
        onSuccess: () => {
            toast.success('User permanently removed from system.');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete user'),
    });

    const confirmPayment = useMutation({
        mutationFn: (id: number) => api.patch(`/orders/${id}/confirm-payment`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Payment confirmed!');
        },
        onError: () => toast.error('Failed to confirm payment'),
    });

    const updateDispute = useMutation({
        mutationFn: ({ id, status, response }: { id: number, status?: string, response?: string }) =>
            response
                ? api.patch(`/disputes/${id}/response`, { response })
                : api.patch(`/disputes/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disputes'] });
            toast.success('Dispute updated successfully');
        },
        onError: () => toast.error('Failed to update dispute'),
    });

    const deleteDispute = useMutation({
        mutationFn: (id: number) => api.delete(`/disputes/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disputes'] });
            toast.success('Dispute deleted successfully');
        },
        onError: () => toast.error('Failed to delete dispute'),
    });

    const deleteAllLogs = useMutation({
        mutationFn: () => api.delete('/audit'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
            toast.success('All audit logs cleared!');
        },
        onError: () => toast.error('Failed to delete logs'),
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
            toast.error('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-['Outfit']">
            <Navbar />

            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] relative">
                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 z-[90] bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar Navigation */}
                <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-[var(--bg-card)] border-r border-[var(--border)]/50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:top-[64px] lg:h-[calc(100vh-64px)] lg:overflow-y-auto lg:z-[80] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-6 space-y-8">
                        <div>
                            <h3 className="px-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Command Center</h3>
                            <div className="space-y-1">
                                {[
                                    { id: 'products', name: 'Products', icon: LayoutDashboard },
                                    { id: 'orders', name: 'Orders', icon: ShoppingBag, count: dashboardCounts?.orders },
                                    { id: 'users', name: 'Users', icon: Users },
                                    { id: 'queries', name: 'Queries', icon: MessageSquare, count: dashboardCounts?.complaints },
                                    { id: 'rates', name: 'Rate Control', icon: TrendingUp },
                                    { id: 'disputes', name: 'Disputes', icon: Gavel, count: dashboardCounts?.disputes },
                                    { id: 'audit', name: 'Audit Logs', icon: History },
                                    { id: 'local', name: 'Local Sources', icon: ExternalLink, color: 'text-green-500' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-sm transition-all group ${activeTab === tab.id
                                            ? 'bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20'
                                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-main)]'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : tab.color || 'text-[var(--primary)] group-hover:scale-110 transition-transform'}`} />
                                            {tab.name}
                                        </div>
                                        {tab.count > 0 && (
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white text-[var(--primary)]' : 'bg-red-500 text-white shadow-lg shadow-red-500/20 animate-pulse'}`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 lg:ml-72 bg-[var(--bg-main)] min-h-screen transition-all">
                    {/* Top Stats/Rates Bar */}
                    <div className="sticky top-16 z-[70] bg-[var(--bg-main)]/80 backdrop-blur-xl border-b border-[var(--border)]/30 px-4 sm:px-8 py-4">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full">
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-[var(--bg-input)] shrink-0 transition-colors"
                                >
                                    <Menu className="w-5 h-5 text-[var(--text-main)]" />
                                </button>
                                <div className="flex items-center gap-6 overflow-x-auto w-full no-scrollbar">
                                    {/* Gold Pill */}
                                    {goldRate && !goldLoading && (
                                        <div className="flex items-center gap-3 shrink-0 bg-[var(--bg-card)]/50 border border-yellow-500/20 px-4 py-2 rounded-2xl shadow-sm">
                                            <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                                                <Gavel className="w-4 h-4 text-yellow-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-yellow-600 uppercase tracking-widest leading-none">GOLD {goldRate.purity}</span>
                                                <span className="text-sm font-black text-[var(--text-main)]">{formatPrice(goldRate.price)}</span>
                                            </div>
                                        </div>
                                    )}
                                    {/* Silver Pill */}
                                    {silverRate && !silverLoading && (
                                        <div className="flex items-center gap-3 shrink-0 bg-[var(--bg-card)]/50 border border-slate-400/20 px-4 py-2 rounded-2xl shadow-sm">
                                            <div className="p-1.5 bg-slate-400/10 rounded-lg">
                                                <Gavel className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">SILVER {silverRate.purity}</span>
                                                <span className="text-sm font-black text-[var(--text-main)]">{formatPrice(silverRate.price)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="hidden md:flex items-center gap-2">
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Live System Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

                        {activeTab === 'rates' && (
                            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">

                                <header className="text-center space-y-2">
                                    <h2 className="text-3xl font-black tracking-tight text-[var(--text-main)]">Live Rate Controller</h2>
                                    <p className="text-[var(--text-muted)]">Set permanent adjustments to market prices for all users.</p>
                                </header>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Gold Adjustment */}
                                    <div className="bg-[var(--bg-card)] border border-yellow-500/20 p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
                                        <button
                                            onClick={() => {
                                                if (confirm('Reset Gold adjustment to 0?')) {
                                                    updateRateSettingsMutation.mutate({ goldAdjustment: 0 });
                                                    (document.getElementById('gold-adjust-input') as HTMLInputElement).value = '0';
                                                }
                                            }}
                                            className="absolute top-4 right-4 p-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-600 hover:text-white rounded-lg transition-all border border-yellow-500/20"
                                            title="Reset Gold Rate"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-yellow-500/10 rounded-2xl">
                                                <TrendingUp className="w-6 h-6 text-yellow-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-yellow-600 text-lg">Gold Adjustment</h3>
                                                <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Permanent Offset</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    placeholder="Example: 5000 or -3000"
                                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl py-4 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-yellow-500/30"
                                                    defaultValue={rateSettings?.goldAdjustment || 0}
                                                    id="gold-adjust-input"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                                    {currency}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const val = parseFloat((document.getElementById('gold-adjust-input') as HTMLInputElement).value);
                                                    updateRateSettingsMutation.mutate({ goldAdjustment: val });
                                                }}
                                                disabled={updateRateSettingsMutation.isPending}
                                                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-yellow-600/20 uppercase tracking-widest text-xs"
                                            >
                                                Apply Gold Offset
                                            </button>
                                        </div>

                                        {goldRate && (
                                            <div className="p-4 bg-[var(--bg-input)] rounded-2xl border border-[var(--border)]/50">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-[var(--text-muted)] font-bold">Market Price:</span>
                                                    <span className="font-mono">{goldRate.basePrice || goldRate.price}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs mt-2 border-t border-[var(--border)]/10 pt-2">
                                                    <span className="text-[var(--text-muted)] font-bold">User Sees:</span>
                                                    <span className="text-yellow-600 font-black">{goldRate.price}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Silver Adjustment */}
                                    <div className="bg-[var(--bg-card)] border border-slate-400/20 p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
                                        <button
                                            onClick={() => {
                                                if (confirm('Reset Silver adjustment to 0?')) {
                                                    updateRateSettingsMutation.mutate({ silverAdjustment: 0 });
                                                    (document.getElementById('silver-adjust-input') as HTMLInputElement).value = '0';
                                                }
                                            }}
                                            className="absolute top-4 right-4 p-2 bg-slate-400/10 hover:bg-slate-500 text-slate-500 hover:text-white rounded-lg transition-all border border-slate-400/20"
                                            title="Reset Silver Rate"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-slate-500/10 rounded-2xl">
                                                <TrendingUp className="w-6 h-6 text-slate-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-500 text-lg">Silver Adjustment</h3>
                                                <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Permanent Offset</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    placeholder="Example: 500 or -200"
                                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl py-4 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-400/30"
                                                    defaultValue={rateSettings?.silverAdjustment || 0}
                                                    id="silver-adjust-input"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                                    {currency}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const val = parseFloat((document.getElementById('silver-adjust-input') as HTMLInputElement).value);
                                                    updateRateSettingsMutation.mutate({ silverAdjustment: val });
                                                }}
                                                disabled={updateRateSettingsMutation.isPending}
                                                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-slate-600/20 uppercase tracking-widest text-xs"
                                            >
                                                Apply Silver Offset
                                            </button>
                                        </div>

                                        {silverRate && (
                                            <div className="p-4 bg-[var(--bg-input)] rounded-2xl border border-[var(--border)]/50">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-[var(--text-muted)] font-bold">Market Price:</span>
                                                    <span className="font-mono">{silverRate.basePrice || silverRate.price}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs mt-2 border-t border-[var(--border)]/10 pt-2">
                                                    <span className="text-[var(--text-muted)] font-bold">User Sees:</span>
                                                    <span className="text-slate-500 font-black">{silverRate.price}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dashboard Counters Removed - Moved to Badges */}

                        {
                            activeTab === 'products' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full">
                                    {/* Add Product Form */}
                                    <section className="lg:col-span-1">
                                        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 md:p-8 rounded-2xl md:sticky md:top-28 shadow-xl">
                                            <h2 className="text-xl font-bold mb-6 flex items-center justify-between text-[var(--text-main)]">
                                                <div className="flex items-center gap-2">
                                                    {editingProduct ? <Pencil className="w-5 h-5 text-[var(--primary)]" /> : <Plus className="w-5 h-5 text-[var(--primary)]" />}
                                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                                </div>
                                                {editingProduct && (
                                                    <button
                                                        onClick={() => {
                                                            setEditingProduct(null);
                                                            setNewProduct({
                                                                name: '',
                                                                price: '',
                                                                description: '',
                                                                image: '',
                                                                category: 'Gold',
                                                                weightTola: '0',
                                                                weightMasha: '0',
                                                                weightRati: '0'
                                                            });
                                                        }}
                                                        className="p-1 hover:bg-[var(--bg-input)] rounded-full transition-colors"
                                                    >
                                                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                                                    </button>
                                                )}
                                            </h2>
                                            <div className="space-y-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setNewProduct({ ...newProduct, category: 'Gold' })}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border ${newProduct.category === 'Gold' ? 'bg-yellow-600/10 text-yellow-600 border-yellow-500/30 shadow-sm' : 'bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border)]'}`}
                                                    >
                                                        Gold
                                                    </button>
                                                    <button
                                                        onClick={() => setNewProduct({ ...newProduct, category: 'Silver' })}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border ${newProduct.category === 'Silver' ? 'bg-slate-400/10 text-slate-500 border-slate-400/30 shadow-sm' : 'bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border)]'}`}
                                                    >
                                                        Silver
                                                    </button>
                                                </div>
                                                <input
                                                    placeholder="Product Name"
                                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text-main)] focus:ring-2 focus:ring-[var(--primary)]/50 outline-none"
                                                    value={newProduct.name}
                                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                />
                                                <div className="relative">
                                                    <input
                                                        placeholder={`Making Charges (${currency})`}
                                                        type="number"
                                                        step="any"
                                                        min="0"
                                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text-main)] focus:ring-2 focus:ring-[var(--primary)]/50 outline-none pr-12"
                                                        value={newProduct.price}
                                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pointer-events-none">
                                                        {currency}
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase px-1">
                                                    * Enter making/labor charges only if weight is specified
                                                </p>

                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Tola</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--text-main)] outline-none"
                                                            value={newProduct.weightTola}
                                                            onChange={(e) => setNewProduct({ ...newProduct, weightTola: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Masha</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--text-main)] outline-none"
                                                            value={newProduct.weightMasha}
                                                            onChange={(e) => setNewProduct({ ...newProduct, weightMasha: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Rati</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--text-main)] outline-none"
                                                            value={newProduct.weightRati}
                                                            onChange={(e) => setNewProduct({ ...newProduct, weightRati: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
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
                                                    onClick={() => {
                                                        let priceVal = parseFloat(newProduct.price);
                                                        // Convert back to PKR if currently in USD
                                                        if (currency === 'USD') {
                                                            const { exchangeRate } = useCurrencyStore.getState();
                                                            priceVal = priceVal * exchangeRate;
                                                        }
                                                        // ROUND to nearest integer to avoid 59999 errors
                                                        const finalPrice = Math.round(priceVal);

                                                        const productData = {
                                                            ...newProduct,
                                                            price: finalPrice,
                                                            weightTola: parseFloat(newProduct.weightTola || '0'),
                                                            weightMasha: parseFloat(newProduct.weightMasha || '0'),
                                                            weightRati: parseFloat(newProduct.weightRati || '0')
                                                        };
                                                        if (editingProduct) {
                                                            updateProductMutation.mutate({ id: editingProduct.id, ...productData });
                                                        } else {
                                                            addProductMutation.mutate(productData);
                                                        }
                                                    }}
                                                    disabled={addProductMutation.isPending || updateProductMutation.isPending || uploading || !newProduct.image}
                                                    className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-glow)] disabled:opacity-50"
                                                >
                                                    {(addProductMutation.isPending || updateProductMutation.isPending) ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        editingProduct ? 'Update Product' : 'Create Product'
                                                    )}
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

                                        {/* Desktop View */}
                                        <div className="hidden md:block bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-x-auto text-sm uppercase font-bold tracking-widest text-[var(--text-muted)] shadow-xl">
                                            <table className="w-full text-left min-w-[600px]">
                                                <thead className="bg-[var(--bg-input)] text-[var(--text-muted)]">
                                                    <tr>
                                                        <th className="p-4">Image</th>
                                                        <th className="p-4">Product</th>
                                                        <th className="p-4">Weight</th>
                                                        <th className="p-4">Price ({currency})</th>
                                                        <th className="p-4 text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--border)]">
                                                    {productsLoading ? (
                                                        <tr><td colSpan={5} className="p-8 text-center uppercase tracking-widest opacity-50">Loading...</td></tr>
                                                    ) : (products?.items || []).map((p: any) => (
                                                        <tr key={p.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                                            <td className="p-4">
                                                                <div className="w-12 h-12 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] overflow-hidden">
                                                                    <img src={getImageUrl(p.image)} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-[var(--text-main)] normal-case tracking-normal font-semibold">{p.name}</td>
                                                            <td className="p-4 text-[var(--text-muted)] text-[10px] whitespace-nowrap">
                                                                {p.weightTola > 0 && <span>{p.weightTola}T </span>}
                                                                {p.weightMasha > 0 && <span>{p.weightMasha}M </span>}
                                                                {p.weightRati > 0 && <span>{p.weightRati}R</span>}
                                                                {(!p.weightTola && !p.weightMasha && !p.weightRati) && '-'}
                                                            </td>
                                                            <td className="p-4 text-[var(--primary)] font-black">
                                                                {p.category === 'Silver'
                                                                    ? (silverLoading ? '---' : formatPrice(calculateDynamicPrice(p, silverRate)))
                                                                    : (goldLoading ? '---' : formatPrice(calculateDynamicPrice(p, goldRate)))
                                                                }
                                                                {((p.weightTola || 0) + (p.weightMasha || 0) + (p.weightRati || 0) > 0) && (
                                                                    <span className="block text-[8px] text-[var(--text-muted)] uppercase tracking-tighter opacity-70">
                                                                        Market Based
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            let displayPrice = Math.round(p.price || 0);
                                                                            if (currency === 'USD') {
                                                                                const { exchangeRate } = useCurrencyStore.getState();
                                                                                displayPrice = parseFloat((p.price / exchangeRate).toFixed(8));
                                                                            }

                                                                            setEditingProduct(p);
                                                                            setNewProduct({
                                                                                name: p.name,
                                                                                price: displayPrice.toString(),
                                                                                description: p.description || '',
                                                                                image: p.image || '',
                                                                                category: p.category || 'Gold',
                                                                                weightTola: (p.weightTola || 0).toString(),
                                                                                weightMasha: (p.weightMasha || 0).toString(),
                                                                                weightRati: (p.weightRati || 0).toString()
                                                                            });
                                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                        }}
                                                                        className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                                                                        title="Edit Product"
                                                                    >
                                                                        <Pencil className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteProductMutation.mutate(p.id)}
                                                                        className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                                                        title="Delete Product"
                                                                    >
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden space-y-4">
                                            {productsLoading ? (
                                                <div className="p-12 text-center text-[var(--text-muted)] uppercase tracking-widest text-xs">Loading Inventory...</div>
                                            ) : (products?.items || []).map((p: any) => (
                                                <div key={p.id} className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-2xl shadow-lg relative h-full">
                                                    <div className="flex gap-4 mb-4">
                                                        <img src={getImageUrl(p.image)} alt="" className="w-20 h-20 rounded-xl object-cover bg-[var(--bg-input)]" />
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-[var(--text-main)] mb-1">{p.name}</h3>
                                                            <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold text-[var(--text-muted)]">
                                                                {p.weightTola > 0 && <span className="px-1.5 py-0.5 bg-[var(--bg-input)] rounded border border-[var(--border)]">{p.weightTola} Tola</span>}
                                                                {p.weightMasha > 0 && <span className="px-1.5 py-0.5 bg-[var(--bg-input)] rounded border border-[var(--border)]">{p.weightMasha} Masha</span>}
                                                                {p.weightRati > 0 && <span className="px-1.5 py-0.5 bg-[var(--bg-input)] rounded border border-[var(--border)]">{p.weightRati} Rati</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]/50">
                                                        <div>
                                                            <div className="text-[var(--primary)] font-black text-lg leading-none">
                                                                {p.category === 'Silver'
                                                                    ? (silverLoading ? '---' : formatPrice(calculateDynamicPrice(p, silverRate)))
                                                                    : (goldLoading ? '---' : formatPrice(calculateDynamicPrice(p, goldRate)))
                                                                }
                                                            </div>
                                                            {((p.weightTola || 0) + (p.weightMasha || 0) + (p.weightRati || 0) > 0) && (
                                                                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-tight font-bold opacity-60">Market Based</span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    let displayPrice = Math.round(p.price || 0);
                                                                    if (currency === 'USD') {
                                                                        const { exchangeRate } = useCurrencyStore.getState();
                                                                        displayPrice = parseFloat((p.price / exchangeRate).toFixed(8));
                                                                    }
                                                                    setEditingProduct(p);
                                                                    setNewProduct({
                                                                        name: p.name,
                                                                        price: displayPrice.toString(),
                                                                        description: p.description || '',
                                                                        image: p.image || '',
                                                                        category: p.category || 'Gold',
                                                                        weightTola: (p.weightTola || 0).toString(),
                                                                        weightMasha: (p.weightMasha || 0).toString(),
                                                                        weightRati: (p.weightRati || 0).toString()
                                                                    });
                                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                }}
                                                                className="p-2.5 bg-[var(--bg-input)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] border border-[var(--border)] transition-all active:scale-95"
                                                            >
                                                                <Pencil className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteProductMutation.mutate(p.id)}
                                                                className="p-2.5 bg-red-500/5 rounded-xl text-red-500 hover:bg-red-500 hover:text-white border border-red-500/10 transition-all active:scale-95"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            )
                        }

                        {
                            activeTab === 'disputes' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                                            <Gavel className="w-5 h-5 text-[var(--primary)]" />
                                            Dispute Resolver
                                        </h2>
                                        <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-xs font-black uppercase tracking-widest border border-red-500/20">
                                            {disputes?.length || 0} Open Cases
                                        </span>
                                    </div>
                                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-x-auto shadow-xl">
                                        <table className="w-full text-left text-sm min-w-[800px]">
                                            <thead className="bg-[var(--bg-input)] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                                                <tr>
                                                    <th className="p-4">Dispute / Order</th>
                                                    <th className="p-4">Evidence</th>
                                                    <th className="p-4">Status</th>
                                                    <th className="p-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border)]">
                                                {disputesLoading ? (
                                                    <tr><td colSpan={4} className="p-8 text-center uppercase tracking-widest opacity-50">Loading Disputes...</td></tr>
                                                ) : disputes?.length === 0 ? (
                                                    <tr><td colSpan={4} className="p-8 text-center text-[var(--text-muted)]">No active disputes found.</td></tr>
                                                ) : disputes?.map((d: any) => (
                                                    <tr key={d.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                                        <td className="p-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-[var(--text-main)] normal-case">{d.reason}</span>
                                                                <span className="text-[10px] text-[var(--primary)] font-bold uppercase mt-1">Order #{d.order?.displayId || d.orderId}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            {d.evidence && (
                                                                <a
                                                                    href={getImageUrl(d.evidence)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="flex items-center gap-2 text-blue-500 hover:underline font-bold text-xs"
                                                                >
                                                                    <Receipt className="w-4 h-4" />
                                                                    View Evidence
                                                                </a>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${d.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                                {d.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        const res = prompt('Admin Response:');
                                                                        if (res) updateDispute.mutate({ id: d.id, response: res });
                                                                    }}
                                                                    className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)]"
                                                                    title="Respond"
                                                                >
                                                                    <MessageSquare className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => confirm('Resolve this dispute?') && updateDispute.mutate({ id: d.id, status: 'Resolved' })}
                                                                    className="p-2 text-[var(--text-muted)] hover:text-green-500"
                                                                    title="Resolve"
                                                                >
                                                                    <CheckCircle className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => confirm('Delete dispute record?') && deleteDispute.mutate(d.id)}
                                                                    className="p-2 text-[var(--text-muted)] hover:text-red-500"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        }

                        {
                            activeTab === 'audit' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                                            <History className="w-5 h-5 text-[var(--primary)]" />
                                            System Audit Logs
                                        </h2>
                                        <button
                                            onClick={() => confirm('Permanently clear ALL audit logs?') && deleteAllLogs.mutate()}
                                            className="px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-all text-xs font-black uppercase tracking-widest border border-red-500/20"
                                        >
                                            Clear Logs
                                        </button>
                                    </div>
                                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl">
                                        <div className="max-h-[600px] overflow-y-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="sticky top-0 bg-[var(--bg-input)] text-[var(--text-muted)] font-bold uppercase tracking-widest z-10">
                                                    <tr>
                                                        <th className="p-4">Timestamp</th>
                                                        <th className="p-4">Action</th>
                                                        <th className="p-4">Entity</th>
                                                        <th className="p-4">Admin</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--border)]">
                                                    {logsLoading ? (
                                                        <tr><td colSpan={4} className="p-8 text-center opacity-50 uppercase tracking-widest">Loading Logs...</td></tr>
                                                    ) : logs?.length === 0 ? (
                                                        <tr><td colSpan={4} className="p-8 text-center text-[var(--text-muted)]">No logs found.</td></tr>
                                                    ) : logs?.map((log: any) => (
                                                        <tr key={log.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                                            <td className="p-4 text-[var(--text-muted)] text-[10px] whitespace-nowrap font-mono">
                                                                {new Date(log.createdAt).toLocaleString()}
                                                            </td>
                                                            <td className="p-4">
                                                                <span className="font-black text-[var(--text-main)] uppercase text-[11px] tracking-tight">{log.action}</span>
                                                                <p className="text-[10px] text-[var(--text-muted)] normal-case mt-0.5">{log.details}</p>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className="px-2 py-0.5 bg-[var(--bg-input)] rounded text-[10px] font-bold text-[var(--text-muted)] border border-[var(--border)] uppercase">
                                                                    {log.entityType} #{log.entityId}
                                                                </span>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-[10px] font-black">
                                                                        {log.admin?.name?.charAt(0) || 'A'}
                                                                    </div>
                                                                    <span className="text-xs font-bold text-[var(--text-main)]">{log.admin?.name || 'Admin'}</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {
                            activeTab === 'orders' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                                        <ShoppingBag className="w-5 h-5 text-[var(--primary)]" />
                                        Order Management
                                    </h2>
                                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-x-auto shadow-xl">
                                        <table className="w-full text-left text-sm min-w-[800px]">
                                            <thead className="bg-[var(--bg-input)] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                                                <tr>
                                                    <th className="p-4">Order ID</th>
                                                    <th className="p-4">Customer</th>
                                                    <th className="p-4">Products (To Prepare)</th>
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
                                                        <td className="p-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-[var(--primary)] text-sm">#{o.displayId || 'N/A'}</span>
                                                                <span className="text-[10px] text-[var(--text-muted)] font-mono opacity-50">Global: #{o.id}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm font-black text-[var(--text-main)] flex items-center gap-1.5">
                                                                    <User className="w-3.5 h-3.5 text-[var(--primary)]" />
                                                                    {o.customerName || o.user?.name || 'N/A'}
                                                                </span>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <span className="px-2 py-0.5 bg-[var(--bg-input)] rounded text-[10px] font-bold text-[var(--text-muted)] border border-[var(--border)] flex items-center gap-1">
                                                                        <Phone className="w-2.5 h-2.5" />
                                                                        {o.customerPhone || o.user?.phone || 'N/A'}
                                                                    </span>
                                                                    <span className="px-2 py-0.5 bg-[var(--bg-input)] rounded text-[10px] font-bold text-[var(--text-muted)] border border-[var(--border)]">
                                                                        ID: {o.customerCnic || o.user?.cnic || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                                                                    <MapPin className="w-3 h-3 opacity-50" />
                                                                    {o.customerAddress || o.user?.address || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex flex-col gap-1 min-w-[220px]">
                                                                {o.items?.map((item: any, idx: number) => (
                                                                    <div key={idx} className="flex bg-[var(--bg-input)]/50 p-2 rounded-lg border border-[var(--border)] gap-3">
                                                                        <div className="w-10 h-10 rounded-md bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden shrink-0 shadow-sm">
                                                                            <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <div className="flex-1 flex flex-col gap-0.5">
                                                                            <div className="flex justify-between items-start gap-2">
                                                                                <span className="text-sm font-bold text-[var(--text-main)] leading-tight">{item.name}</span>
                                                                                <span className="bg-[var(--primary)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">x{item.quantity}</span>
                                                                            </div>
                                                                            {(item.weightTola > 0 || item.weightMasha > 0 || item.weightRati > 0) && (
                                                                                <div className="flex gap-2 text-[10px] font-bold text-[var(--primary)] uppercase tracking-tighter">
                                                                                    {item.weightTola > 0 && <span>{item.weightTola}T</span>}
                                                                                    {item.weightMasha > 0 && <span>{item.weightMasha}M</span>}
                                                                                    {item.weightRati > 0 && <span>{item.weightRati}R</span>}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex flex-col gap-2">
                                                                <span className="px-2 py-0.5 bg-[var(--bg-input)] rounded text-[10px] font-bold text-[var(--text-muted)] border border-[var(--border)] uppercase w-fit">
                                                                    {o.paymentMethod || 'N/A'}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${o.paymentStatus === 'Paid'
                                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                                        }`}>
                                                                        {o.paymentStatus || 'Unpaid'}
                                                                    </span>
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
                                                            <div className="flex flex-col gap-2">
                                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${o.status === 'Delivered'
                                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                                    : 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20'
                                                                    }`}>
                                                                    {o.status}
                                                                </span>
                                                                {(o.status === 'Ready to Deliver' || o.status === 'Pending' || o.status === 'Processing' || o.status === 'Delivered') && (
                                                                    <button
                                                                        onClick={() => setViewingReceipt(o)}
                                                                        className="flex items-center justify-center gap-1.5 px-2 py-1 bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 text-[var(--primary)] rounded text-[9px] font-black uppercase tracking-tighter border border-[var(--primary)]/10 transition-all"
                                                                    >
                                                                        <FileText className="w-3 h-3" />
                                                                        View Receipt
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 font-bold text-[var(--text-main)]">{formatPrice(o.total)}</td>
                                                        <td className="p-4">
                                                            <div className="flex flex-wrap items-center justify-end gap-2">
                                                                {o.paymentStatus !== 'Paid' && (
                                                                    <button
                                                                        onClick={() => confirmPayment.mutate(o.id)}
                                                                        disabled={confirmPayment.isPending}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-xl transition-all text-[10px] border border-emerald-500/20 font-black uppercase tracking-widest shadow-lg shadow-emerald-500/5 active:scale-95 disabled:opacity-50"
                                                                    >
                                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                                        Confirm Payment
                                                                    </button>
                                                                )}
                                                                {(o.status === 'Pending' || o.status === 'Processing') && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => updateOrderStatusMutation.mutate({ id: o.id, status: 'Ready to Deliver' })}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white rounded-xl transition-all text-[10px] border border-blue-500/20 font-black uppercase tracking-widest shadow-lg shadow-blue-500/5 active:scale-95"
                                                                        >
                                                                            <Package className="w-3.5 h-3.5" />
                                                                            Ready
                                                                        </button>
                                                                        <button
                                                                            onClick={() => updateOrderStatusMutation.mutate({ id: o.id, status: 'Delivered' })}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500 text-green-600 hover:text-white rounded-xl transition-all text-[10px] border border-green-500/20 font-black uppercase tracking-widest shadow-lg shadow-green-500/5 active:scale-95"
                                                                        >
                                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                                            Deliver
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {o.status === 'Ready to Deliver' && (
                                                                    <button
                                                                        onClick={() => updateOrderStatusMutation.mutate({ id: o.id, status: 'Delivered' })}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500 text-green-600 hover:text-white rounded-xl transition-all text-[10px] border border-green-500/20 font-black uppercase tracking-widest shadow-lg shadow-green-500/5 active:scale-95"
                                                                        title="Mark as Delivered"
                                                                    >
                                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                                        Deliver
                                                                    </button>
                                                                )}
                                                                {o.status === 'Delivered' && (
                                                                    <button
                                                                        onClick={() => confirm('Are you sure you want to delete this order record? This cannot be undone.') && deleteOrderMutation.mutate(o.id)}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-xl transition-all text-[10px] border border-red-500/20 font-black uppercase tracking-widest shadow-lg shadow-red-500/5 active:scale-95"
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
                            )
                        }

                        {
                            activeTab === 'users' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                                            <Users className="w-5 h-5 text-[var(--primary)]" />
                                            User Registry
                                        </h2>
                                        <div className="relative w-full md:w-72">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                            <input
                                                placeholder="Search by name, email or cnic..."
                                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-x-auto shadow-xl">
                                        <table className="w-full text-left text-sm min-w-[600px]">
                                            <thead className="bg-[var(--bg-input)] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                                                <tr>
                                                    <th className="p-4">User</th>
                                                    <th className="p-4">Email</th>
                                                    <th className="p-4 text-center">Orders</th>
                                                    <th className="p-4 text-center">Status</th>
                                                    <th className="p-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border)]">
                                                {usersLoading ? (
                                                    <tr><td colSpan={5} className="p-8 text-center uppercase tracking-widest opacity-50">Loading...</td></tr>
                                                ) : (users || [])
                                                    .filter((u: any) =>
                                                        !searchQuery ||
                                                        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        u.cnic?.includes(searchQuery)
                                                    )
                                                    .map((u: any) => (
                                                        <tr key={u.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-2 h-2 rounded-full ${u.isVerified ? 'bg-green-500' : 'bg-yellow-500'} shadow-[0_0_8px_rgba(34,197,94,0.3)]`} />
                                                                    <div>
                                                                        <p className="font-black text-[var(--text-main)]">{u.name || 'Anonymous'}</p>
                                                                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">
                                                                            {u.cnic || 'CNIC NOT PROVIDED'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-[var(--text-muted)] font-medium">{u.email}</td>
                                                            <td className="p-4 text-center">
                                                                <span className="bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded text-xs font-black">
                                                                    {u._count?.orders || 0}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                {u.isBlocked ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase border border-red-500/20">
                                                                        <AlertOctagon className="w-3 h-3" />
                                                                        Blocked
                                                                    </span>
                                                                ) : u.isFrozen ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase border border-orange-500/20">
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                        Frozen
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase border border-green-500/20">
                                                                        <CheckCircle className="w-3 h-3" />
                                                                        Active
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => setSelectedUser(u.id)}
                                                                        className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                                                                        title="View Profile"
                                                                    >
                                                                        <ExternalLink className="w-5 h-5" />
                                                                    </button>

                                                                    {!u.isVerified && (
                                                                        <button
                                                                            onClick={() => confirm('Verify this user identity?') && verifyUser.mutate(u.id)}
                                                                            className="p-2 text-[var(--text-muted)] hover:text-green-500"
                                                                            title="Verify User"
                                                                        >
                                                                            <ShieldCheck className="w-5 h-5" />
                                                                        </button>
                                                                    )}

                                                                    <button
                                                                        onClick={() => {
                                                                            const reason = prompt('Legal Action / FIR Details:');
                                                                            if (reason) registerFIR.mutate({ id: u.id, details: reason });
                                                                        }}
                                                                        className="p-2 text-[var(--text-muted)] hover:text-blue-500"
                                                                        title="Register FIR/Legal"
                                                                    >
                                                                        <ShieldAlert className="w-5 h-5" />
                                                                    </button>

                                                                    <button
                                                                        onClick={() => confirm('Freeze this account? User will not be able to login.') && freezeUser.mutate(u.id)}
                                                                        className="p-2 text-[var(--text-muted)] hover:text-orange-500"
                                                                        title="Freeze Account"
                                                                    >
                                                                        <Loader2 className="w-5 h-5" />
                                                                    </button>

                                                                    <button
                                                                        onClick={() => confirm('BLOCK this user? IP and Email will be blacklisted.') && blockUser.mutate(u.id)}
                                                                        className="p-2 text-[var(--text-muted)] hover:text-red-500"
                                                                        title="Block Permanently"
                                                                    >
                                                                        <AlertOctagon className="w-5 h-5" />
                                                                    </button>

                                                                    <button
                                                                        onClick={() => confirm('PERMANENTLY DELETE this user? All data will be lost.') && deleteUser.mutate(u.id)}
                                                                        className="p-2 text-[var(--text-muted)] hover:text-red-700"
                                                                        title="Delete User"
                                                                    >
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        }

                        {
                            activeTab === 'queries' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                                        <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
                                        Customer Queries
                                    </h2>
                                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-x-auto shadow-xl">
                                        <table className="w-full text-left text-sm min-w-[800px]">
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
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-bold text-[var(--text-main)] truncate">{c.subject}</p>
                                                                {c.orderId && (
                                                                    <span className="px-1.5 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] text-[8px] font-bold rounded border border-[var(--primary)]/20 uppercase tracking-widest">
                                                                        Order #{c.order?.displayId || c.orderId}
                                                                    </span>
                                                                )}
                                                            </div>
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
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => setSelectedComplaint(c)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-lg transition-all text-xs border border-blue-500/20 font-bold"
                                                                >
                                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                                    Respond
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteComplaintMutation.mutate(c.id)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all text-xs border border-red-500/20"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        }
                        {
                            activeTab === 'local' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl font-black flex items-center gap-3 text-[var(--text-main)]">
                                                <ExternalLink className="w-6 h-6 text-green-500" />
                                                Market Price Transparency
                                            </h2>
                                            <p className="text-[var(--text-muted)] text-sm mt-1">Direct rates from all 10 sources used for calculation.</p>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-input)] rounded-xl border border-[var(--border)]">
                                            <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">USD/PKR:</span>
                                            <span className="text-sm font-black text-[var(--text-main)]">{detailedLoading ? '...' : detailedRates?.exchangeRate}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Gold Sources */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold text-yellow-600 flex items-center gap-2">
                                                <Gavel className="w-5 h-5" />
                                                Gold Sources (24K / Tola)
                                            </h3>
                                            <div className="bg-[var(--bg-card)] border border-yellow-500/20 rounded-2xl overflow-hidden shadow-xl">
                                                <table className="w-full text-left text-xs uppercase font-bold tracking-widest">
                                                    <thead className="bg-[var(--bg-input)] text-[var(--text-muted)]">
                                                        <tr>
                                                            <th className="p-4">Source</th>
                                                            <th className="p-4">Price</th>
                                                            <th className="p-4">Type</th>
                                                            <th className="p-4 text-right">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[var(--border)]">
                                                        {detailedLoading ? (
                                                            <tr><td colSpan={4} className="p-8 text-center opacity-50">Fetching Rates...</td></tr>
                                                        ) : (
                                                            <>
                                                                {detailedRates?.gold.map((s: any, idx: number) => (
                                                                    <tr key={idx} className="hover:bg-yellow-500/5 transition-colors">
                                                                        <td className="p-4 text-[var(--text-main)] normal-case tracking-normal font-semibold">{s.name}</td>
                                                                        <td className="p-4 font-black text-yellow-600">{s.price24k ? formatPrice(s.price24k) : (s.price ? formatPrice(s.price) : 'N/A')}</td>
                                                                        <td className="p-4 opacity-70 text-[10px]">{s.type}</td>
                                                                        <td className="p-4 text-right">
                                                                            <span className={`px-2 py-0.5 rounded-full text-[8px] border ${s.status === 'Success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                                                {s.status}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                {/* Highlight Row for Highest Gold */}
                                                                {(() => {
                                                                    const validGold = detailedRates?.gold.filter((s: any) => (s.price24k || s.price) > 0) || [];
                                                                    if (validGold.length === 0) return null;
                                                                    const highestGold = [...validGold].sort((a: any, b: any) => (b.price24k || b.price || 0) - (a.price24k || a.price || 0))[0];
                                                                    return (
                                                                        <tr className="bg-yellow-500/10 border-t-2 border-yellow-500/30">
                                                                            <td className="p-4 text-yellow-700 font-black">🔥 Highest (Gold): {highestGold.name}</td>
                                                                            <td className="p-4 text-yellow-700 font-black text-lg">{formatPrice(highestGold.price24k || highestGold.price)}</td>
                                                                            <td className="p-4 text-yellow-700 font-bold opacity-70 text-[10px]">Peak Source</td>
                                                                            <td className="p-4 text-right">
                                                                                <span className="px-2 py-0.5 rounded-full text-[8px] bg-yellow-500 text-white font-black">TOP RATE</span>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })()}
                                                            </>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Silver Sources */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold text-slate-500 flex items-center gap-2">
                                                <Gavel className="w-5 h-5" />
                                                Silver Sources (Chandi / Tola)
                                            </h3>
                                            <div className="bg-[var(--bg-card)] border border-slate-400/20 rounded-2xl overflow-hidden shadow-xl">
                                                <table className="w-full text-left text-xs uppercase font-bold tracking-widest">
                                                    <thead className="bg-[var(--bg-input)] text-[var(--text-muted)]">
                                                        <tr>
                                                            <th className="p-4">Source</th>
                                                            <th className="p-4">Price</th>
                                                            <th className="p-4">Type</th>
                                                            <th className="p-4 text-right">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[var(--border)]">
                                                        {detailedLoading ? (
                                                            <tr><td colSpan={4} className="p-8 text-center opacity-50">Fetching Rates...</td></tr>
                                                        ) : (
                                                            <>
                                                                {detailedRates?.silver.map((s: any, idx: number) => (
                                                                    <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                                                                        <td className="p-4 text-[var(--text-main)] normal-case tracking-normal font-semibold">{s.name}</td>
                                                                        <td className="p-4 font-black text-slate-600">{s.price ? formatPrice(s.price) : 'N/A'}</td>
                                                                        <td className="p-4 opacity-70 text-[10px]">{s.type}</td>
                                                                        <td className="p-4 text-right">
                                                                            <span className={`px-2 py-0.5 rounded-full text-[8px] border ${s.status === 'Success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                                                {s.status}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                {/* Highlight Row for Highest Silver */}
                                                                {(() => {
                                                                    const validSilver = detailedRates?.silver.filter((s: any) => s.price > 0) || [];
                                                                    if (validSilver.length === 0) return null;
                                                                    const highestSilver = [...validSilver].sort((a: any, b: any) => b.price - a.price)[0];
                                                                    return (
                                                                        <tr className="bg-slate-500/10 border-t-2 border-slate-500/30">
                                                                            <td className="p-4 text-slate-700 font-black">⚡ Highest (Silver): {highestSilver.name}</td>
                                                                            <td className="p-4 text-slate-700 font-black text-lg">{formatPrice(highestSilver.price)}</td>
                                                                            <td className="p-4 text-slate-700 font-bold opacity-70 text-[10px]">Peak Source</td>
                                                                            <td className="p-4 text-right">
                                                                                <span className="px-2 py-0.5 rounded-full text-[8px] bg-slate-500 text-white font-black">TOP RATE</span>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })()}
                                                            </>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </main>

                {/* User Details Modal */}
                {
                    selectedUser && (
                        <UserDetailsModal
                            userId={selectedUser}
                            onClose={() => setSelectedUser(null)}
                            getImageUrl={getImageUrl}
                            onViewReceipt={(o: any) => setViewingReceipt(o)}
                        />
                    )
                }

                {/* Respond to Complaint Modal */}
                {
                    selectedComplaint && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-main)]/80 backdrop-blur-sm">
                            <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
                                <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-input)]/50">
                                    <h3 className="text-xl font-bold text-[var(--text-main)]">Respond to Query</h3>
                                    <p className="text-sm text-[var(--text-muted)] mt-1">Order #{selectedComplaint.orderId || 'N/A'}</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Customer Message</label>
                                        <p className="bg-[var(--bg-input)]/50 border border-[var(--border)] rounded-lg p-4 text-sm text-[var(--text-main)]">
                                            {selectedComplaint.message}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Your Response</label>
                                        <textarea
                                            value={respondText}
                                            onChange={(e) => setRespondText(e.target.value)}
                                            placeholder="Type your response here... We'll notify the customer that their issue is being worked on."
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/50 outline-none h-32 resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (!respondText.trim()) {
                                                    toast.error('Please enter a response');
                                                    return;
                                                }
                                                respondToComplaintMutation.mutate({
                                                    id: selectedComplaint.id,
                                                    response: respondText
                                                });
                                            }}
                                            className="flex-1 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold rounded-lg transition-all"
                                        >
                                            {respondToComplaintMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                                            Send Response
                                        </button>
                                        <button
                                            onClick={() => setSelectedComplaint(null)}
                                            className="flex-1 px-4 py-2 bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-muted)] font-bold rounded-lg transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                <GoldCalculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />

                {
                    viewingReceipt && (
                        <OrderReceipt
                            order={viewingReceipt}
                            formatPrice={formatPrice}
                            onClose={() => setViewingReceipt(null)}
                            isAdmin={true}
                            onSendToDashboard={() => sendReceiptMutation.mutate(viewingReceipt.id)}
                        />
                    )
                }
            </div>
        </div>
    );
}

function UserDetailsModal({ userId, onClose, getImageUrl, onViewReceipt }: { userId: number; onClose: () => void; getImageUrl: (url: string) => string; onViewReceipt: (order: any) => void }) {
    const { formatPrice } = useCurrencyStore();
    const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'delivered'>('all');
    const { data: user, isLoading } = useQuery({
        queryKey: ['users', userId],
        queryFn: async () => (await api.get(`/users/${userId}`)).data,
    });

    const filteredOrders = user?.orders?.filter((order: any) => {
        if (orderFilter === 'pending') return order.status === 'Pending' || order.status === 'Ready to Deliver';
        if (orderFilter === 'delivered') return order.status === 'Delivered';
        return true;
    }) || [];

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
                            <div className="flex flex-col md:flex-row items-center gap-8 bg-[var(--bg-input)]/30 p-8 rounded-3xl border border-[var(--border)]/50">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--primary)] shadow-xl shrink-0">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary-hover)]/20 flex items-center justify-center">
                                            <User className="w-10 h-10 text-[var(--primary)]" />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 flex-1">
                                    <div className="bg-[var(--bg-input)]/50 p-4 md:p-6 rounded-2xl border border-[var(--border)]/50">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Full Name</label>
                                        <p className="text-base md:text-lg font-bold text-[var(--text-main)]">{user.name || 'Anonymous'}</p>
                                    </div>
                                    <div className="bg-[var(--bg-input)]/50 p-4 md:p-6 rounded-2xl border border-[var(--border)]/50">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Email Address</label>
                                        <p className="text-base md:text-lg font-bold text-[var(--text-main)]">{user.email}</p>
                                    </div>
                                    <div className="bg-[var(--bg-input)]/50 p-4 md:p-6 rounded-2xl border border-[var(--border)]/50">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">CNIC Number</label>
                                        <p className="text-base md:text-lg font-bold text-[var(--text-main)]">{user.cnic || 'Not Provided'}</p>
                                    </div>
                                    <div className="bg-[var(--bg-input)]/50 p-4 md:p-6 rounded-2xl border border-[var(--border)]/50">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Contact Number</label>
                                        <p className="text-base md:text-lg font-bold text-[var(--text-main)]">{user.phone || 'Not Provided'}</p>
                                    </div>
                                    <div className="bg-[var(--bg-input)]/50 p-4 md:p-6 rounded-2xl border border-[var(--border)]/50 lg:col-span-1">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Customer Since</label>
                                        <p className="text-base md:text-lg font-bold text-[var(--text-main)]">{new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="bg-[var(--bg-input)]/50 p-4 md:p-6 rounded-2xl border border-[var(--border)]/50">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Account Status</label>
                                        <div className="mt-1">
                                            {user.isBlocked ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold uppercase border border-red-500/20">
                                                    <AlertOctagon className="w-3.5 h-3.5" />
                                                    Blocked
                                                </span>
                                            ) : user.isFrozen ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase border border-orange-500/20">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    Frozen
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold uppercase border border-green-500/20">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-[var(--bg-input)]/50 p-4 md:p-6 rounded-2xl border border-[var(--border)]/50 lg:col-span-3">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Home Address</label>
                                        <p className="text-base md:text-lg font-bold text-[var(--text-main)]">{user.address || 'No Address Saved'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order History */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
                                        <ShoppingBag className="w-5 h-5 text-[var(--primary)]" />
                                        Order History ({user.orders?.length || 0})
                                    </h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setOrderFilter('all')}
                                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${orderFilter === 'all'
                                                ? 'bg-[var(--primary)] text-white'
                                                : 'bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border)]'}`}
                                        >
                                            All ({user.orders?.length || 0})
                                        </button>
                                        <button
                                            onClick={() => setOrderFilter('pending')}
                                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${orderFilter === 'pending'
                                                ? 'bg-yellow-600 text-white'
                                                : 'bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border)]'}`}
                                        >
                                            Pending ({user.orders?.filter((o: any) => o.status === 'Pending' || o.status === 'Ready to Deliver').length || 0})
                                        </button>
                                        <button
                                            onClick={() => setOrderFilter('delivered')}
                                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${orderFilter === 'delivered'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border)]'}`}
                                        >
                                            Delivered ({user.orders?.filter((o: any) => o.status === 'Delivered').length || 0})
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {!filteredOrders || filteredOrders.length === 0 ? (
                                        <p className="text-[var(--text-muted)] italic text-center py-8 bg-[var(--bg-input)]/30 rounded-2xl border border-dashed border-[var(--border)]">No orders in this category.</p>
                                    ) : filteredOrders.map((order: any) => (
                                        <div key={order.id} className="bg-[var(--bg-input)]/50 border border-[var(--border)] rounded-2xl p-6">
                                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-[var(--border)]/50">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[var(--primary)] font-bold">#{order.displayId || 'N/A'}</span>
                                                        <span className="text-[10px] text-[var(--text-muted)] font-mono opacity-50">Global: #{order.id}</span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${order.status === 'Delivered'
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                    {(order.status === 'Ready to Deliver' || order.status === 'Pending' || order.status === 'Processing' || order.status === 'Delivered') && (
                                                        <button
                                                            onClick={() => onViewReceipt(order)}
                                                            className="flex items-center gap-1 px-2 py-0.5 bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 text-[var(--primary)] rounded text-[9px] font-black uppercase tracking-tighter border border-[var(--primary)]/10 transition-all"
                                                        >
                                                            <FileText className="w-3 h-3" />
                                                            Receipt
                                                        </button>
                                                    )}
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
