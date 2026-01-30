import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { IMAGE_BASE_URL } from '../lib/api';
import Navbar from './Navbar';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { toast } from '../store/useToastStore';
import {
    ShoppingBag,
    Users,
    Trash2,
    CheckCircle,
    Loader2,
    Receipt,
    ShieldCheck,
    ShieldAlert,
    AlertOctagon,
    FileSearch,
    History,
    Gavel,
    Search
} from 'lucide-react';

export default function SuperAdminDashboard() {
    const queryClient = useQueryClient();
    const { formatPrice } = useCurrencyStore();
    const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'disputes' | 'audit'>('users');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['super-admin-users'],
        queryFn: async () => (await api.get('/users')).data,
    });

    const { data: dashboardCounts } = useQuery({
        queryKey: ['dashboard-counts'],
        queryFn: async () => (await api.get('/complaints/counts')).data,
    });

    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['super-admin-orders'],
        queryFn: async () => (await api.get('/orders')).data,
        refetchInterval: 5000,
        refetchOnWindowFocus: true,
    });

    const { data: disputes, isLoading: disputesLoading } = useQuery({
        queryKey: ['super-admin-disputes'],
        queryFn: async () => (await api.get('/disputes')).data,
    });

    const { data: logs, isLoading: logsLoading } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: async () => (await api.get('/audit')).data,
    });

    // Mutations
    const verifyUser = useMutation({
        mutationFn: (id: number) => api.post(`/users/${id}/verify`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['super-admin-users'] }),
    });

    const freezeUser = useMutation({
        mutationFn: (id: number) => api.post(`/users/${id}/freeze`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['super-admin-users'] }),
    });

    const blockUser = useMutation({
        mutationFn: (id: number) => api.post(`/users/${id}/block`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['super-admin-users'] }),
    });

    const registerFIR = useMutation({
        mutationFn: ({ id, details }: { id: number, details: string }) => api.post(`/users/${id}/register-fir`, { details }),
        onSuccess: () => {
            toast.success('Legal action recorded in system audit.');
            queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
        },
    });

    const deleteUser = useMutation({
        mutationFn: (id: number) => api.delete(`/users/${id}`),
        onSuccess: () => {
            toast.success('User permanently removed from system.');
            queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete user'),
    });

    const confirmPayment = useMutation({
        mutationFn: (id: number) => api.patch(`/superadmin/orders/${id}/confirm-payment`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['super-admin-orders'] }),
    });

    const deleteOrderMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/orders/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['super-admin-orders'] }),
    });

    const updateDispute = useMutation({
        mutationFn: ({ id, status, response }: { id: number, status?: string, response?: string }) =>
            response
                ? api.patch(`/disputes/${id}/response`, { response })
                : api.patch(`/disputes/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['super-admin-disputes'] });
            toast.success('Dispute updated successfully');
        },
    });

    const deleteDispute = useMutation({
        mutationFn: (id: number) => api.delete(`/disputes/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['super-admin-disputes'] });
            toast.success('Dispute deleted successfully');
        },
    });

    const deleteAllLogs = useMutation({
        mutationFn: () => api.delete('/audit'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audit-logs'] }),
    });

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${IMAGE_BASE_URL}${url}`;
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-['Outfit']">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-8">
                    <header>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <ShieldCheck className="w-10 h-10 text-[var(--primary)]" />
                            Super Admin Command Center
                        </h1>
                        <p className="text-[var(--text-muted)] mt-2">Manage platform security, verify users, and confirm financial settlements.</p>
                    </header>
                </div>

                {/* Sticky Secondary Navigation Section */}
                <div className="sticky top-16 z-[90] bg-[var(--bg-main)]/80 backdrop-blur-md py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-[var(--border)]/10 mb-12">
                    <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-2 no-scrollbar">
                        <button onClick={() => setActiveTab('users')} className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}>
                            <Users className="w-4 h-4" /> Users
                        </button>
                        <button onClick={() => setActiveTab('orders')} className={`relative tab-btn ${activeTab === 'orders' ? 'active' : ''}`}>
                            <ShoppingBag className="w-4 h-4" /> Settlement
                            {dashboardCounts?.orders > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black min-w-[20px] h-[20px] flex items-center justify-center rounded-full border-2 border-[var(--bg-main)] shadow-[0_0_10px_rgba(239,68,68,0.3)] z-20">
                                    {dashboardCounts.orders}
                                </span>
                            )}
                        </button>
                        <button onClick={() => setActiveTab('disputes')} className={`relative tab-btn ${activeTab === 'disputes' ? 'active' : ''}`}>
                            <Gavel className="w-4 h-4" /> Disputes
                            {dashboardCounts?.disputes > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black min-w-[20px] h-[20px] flex items-center justify-center rounded-full border-2 border-[var(--bg-main)] shadow-[0_0_10px_rgba(239,68,68,0.3)] z-20">
                                    {dashboardCounts.disputes}
                                </span>
                            )}
                        </button>
                        <button onClick={() => setActiveTab('audit')} className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}>
                            <History className="w-4 h-4" /> Logs
                        </button>
                    </div>
                </div>

                {
                    activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                                <input
                                    placeholder="Search users by name, email or CNIC..."
                                    className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[var(--primary)]/30 transition-all font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {usersLoading ? (
                                    <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" /></div>
                                ) : users?.map((u: any) => (
                                    <div key={u.id} className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row gap-8 items-start hover:border-[var(--primary)]/30 transition-all overflow-hidden relative">
                                        {u.isBlocked && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-4 py-1 flex items-center gap-1"><AlertOctagon className="w-3 h-3" /> BLOCKED</div>}

                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-input)] flex items-center justify-center font-bold text-xl text-[var(--primary)] border border-[var(--border)]">
                                                    {u.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                                        {u.name || 'Anonymous User'}
                                                        {u.isVerified && <ShieldCheck className="w-4 h-4 text-green-500" />}
                                                    </h3>
                                                    <p className="text-xs text-[var(--text-muted)] font-mono">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
                                                <div className="bg-[var(--bg-input)]/50 p-3 rounded-xl border border-[var(--border)]/50">
                                                    <span className="block text-[var(--text-muted)] mb-1 uppercase tracking-tighter">CNIC</span>
                                                    {u.cnic || 'Missing'}
                                                </div>
                                                <div className="bg-[var(--bg-input)]/50 p-3 rounded-xl border border-[var(--border)]/50">
                                                    <span className="block text-[var(--text-muted)] mb-1 uppercase tracking-tighter">Phone</span>
                                                    {u.phone || 'Missing'}
                                                </div>
                                                <div className="bg-[var(--bg-input)]/50 p-3 rounded-xl border border-[var(--border)]/50">
                                                    <span className="block text-[var(--text-muted)] mb-1 uppercase tracking-tighter">Status</span>
                                                    <span className={u.isFrozen ? 'text-orange-500' : 'text-green-500'}>
                                                        {u.isFrozen ? 'FROZEN' : 'ACTIVE'}
                                                    </span>
                                                </div>
                                                <div className="bg-[var(--bg-input)]/50 p-3 rounded-xl border border-[var(--border)]/50">
                                                    <span className="block text-[var(--text-muted)] mb-1 uppercase tracking-tighter">Role</span>
                                                    <span className="text-[var(--primary)]">{u.role}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full lg:w-fit flex flex-wrap lg:flex-col gap-2 relative z-10">
                                            {!u.isVerified && (
                                                <button onClick={() => verifyUser.mutate(u.id)} className="action-btn success"><ShieldCheck className="w-4 h-4" /> Verify</button>
                                            )}
                                            <button onClick={() => freezeUser.mutate(u.id)} className={`action-btn ${u.isFrozen ? 'active' : 'warn'}`}>
                                                <ShieldAlert className="w-4 h-4" /> {u.isFrozen ? 'Unfreeze' : 'Freeze'}
                                            </button>
                                            <button onClick={() => blockUser.mutate(u.id)} className={`action-btn ${u.isBlocked ? 'active' : 'danger'}`}>
                                                <AlertOctagon className="w-4 h-4" /> {u.isBlocked ? 'Unblock' : 'Block'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const details = prompt('Enter FIR details & Reference #');
                                                    if (details) registerFIR.mutate({ id: u.id, details });
                                                }}
                                                className="action-btn danger outline"
                                            >
                                                <Gavel className="w-4 h-4" /> Log FIR
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Are you sure you want to PERMANENTLY delete user ${u.name}? This will delete all their orders and related data.`)) {
                                                        deleteUser.mutate(u.id);
                                                    }
                                                }}
                                                className="action-btn danger"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete User
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'orders' && (
                        <div className="space-y-6">
                            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl">
                                <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-input)]/30">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Receipt className="w-5 h-5 text-[var(--primary)]" />
                                        Financial Settlement & Order Management
                                    </h3>
                                </div>
                                {/* Desktop View */}
                                <div className="hidden lg:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[var(--bg-input)]/50 border-b border-[var(--border)]">
                                            <tr>
                                                <th className="p-4 text-left text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Order ID</th>
                                                <th className="p-4 text-left text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Customer</th>
                                                <th className="p-4 text-left text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Admin (Jeweller)</th>
                                                <th className="p-4 text-left text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Products (To Prepare)</th>
                                                <th className="p-4 text-left text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Total Amount</th>
                                                <th className="p-4 text-left text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Status</th>
                                                <th className="p-4 text-left text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Payment Status</th>
                                                <th className="p-4 text-right text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)]">
                                            {ordersLoading ? (
                                                <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
                                            ) : !orders || orders.length === 0 ? (
                                                <tr><td colSpan={7} className="p-12 text-center text-[var(--text-muted)]">No orders found</td></tr>
                                            ) : orders.map((o: any) => (
                                                <tr key={o.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-[var(--primary)] text-sm">#{o.displayId || 'N/A'}</span>
                                                            <span className="text-[10px] text-[var(--text-muted)] font-mono opacity-50 uppercase tracking-tighter">Global ID: #{o.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-[var(--text-main)]">{o.customerName || 'N/A'}</span>
                                                            <span className="text-xs text-[var(--text-muted)]">{o.customerPhone || 'N/A'}</span>
                                                            <span className="text-[10px] text-[var(--text-muted)]/70">{o.user?.email || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {o.admin ? (
                                                            <div className="flex flex-col gap-0.5 bg-blue-500/5 rounded-lg px-2 py-1.5 border border-blue-500/10">
                                                                <span className="font-bold text-blue-500 text-sm">{o.admin.name || 'Admin'}</span>
                                                                <span className="text-xs text-[var(--text-muted)]">{o.admin.phone || 'No Phone'}</span>
                                                                <span className="text-[10px] text-[var(--text-muted)]/70">{o.admin.email}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-[var(--text-muted)] italic">Not Assigned</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-1 min-w-[200px]">
                                                            {o.items?.map((item: any, idx: number) => (
                                                                <div key={idx} className="flex bg-[var(--bg-input)]/50 p-2 rounded-lg border border-[var(--border)] gap-3">
                                                                    <div className="w-8 h-8 rounded-md bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden shrink-0 shadow-sm">
                                                                        <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div className="flex-1 flex flex-col gap-0.5">
                                                                        <div className="flex justify-between items-start gap-2">
                                                                            <span className="text-[11px] font-bold text-[var(--text-main)] leading-tight truncate max-w-[100px]">{item.name}</span>
                                                                            <span className="bg-[var(--primary)] text-white text-[9px] font-bold px-1 py-0.5 rounded">x{item.quantity}</span>
                                                                        </div>
                                                                        {(item.weightTola > 0 || item.weightMasha > 0 || item.weightRati > 0) && (
                                                                            <div className="flex gap-1 text-[9px] font-bold text-[var(--primary)] uppercase tracking-tighter">
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
                                                        <div className="flex flex-col gap-1">
                                                            <div className="font-bold text-[var(--text-main)]">{formatPrice(o.total)}</div>
                                                            <div className="text-[10px] text-[var(--text-muted)]">
                                                                <div>User Fee (2%): {formatPrice(o.userFee || 0)}</div>
                                                                <div>Admin Fee (2%): {formatPrice(o.adminFee || 0)}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${o.status === 'Delivered'
                                                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                            : o.status === 'Pending'
                                                                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                                : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                            }`}>
                                                            {o.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${o.paymentStatus === 'Paid'
                                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                                : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                                }`}>
                                                                {o.paymentStatus || 'Pending'}
                                                            </span>
                                                            {o.paymentReceipt && (
                                                                <a
                                                                    href={getImageUrl(o.paymentReceipt)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-[var(--primary)] hover:underline flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                                                                    title="View Receipt"
                                                                >
                                                                    <Receipt className="w-3.5 h-3.5" />
                                                                    View
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {o.paymentStatus !== 'Paid' && (
                                                                <button
                                                                    onClick={() => confirmPayment.mutate(o.id)}
                                                                    className="px-3 py-1.5 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white rounded-lg transition-all text-xs border border-green-500/20 font-bold"
                                                                >
                                                                    <CheckCircle className="w-4 h-4 inline mr-1" />
                                                                    Confirm Payment
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('Are you sure you want to permanently delete this order?')) {
                                                                        deleteOrderMutation.mutate(o.id);
                                                                    }
                                                                }}
                                                                className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-all text-xs border border-red-500/20 font-bold"
                                                            >
                                                                <Trash2 className="w-4 h-4 inline mr-1" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="lg:hidden divide-y divide-[var(--border)]">
                                    {ordersLoading ? (
                                        <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
                                    ) : !orders || orders.length === 0 ? (
                                        <div className="p-12 text-center text-[var(--text-muted)] uppercase tracking-widest text-xs">No settlements found</div>
                                    ) : orders.map((o: any) => (
                                        <div key={o.id} className="p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-[var(--primary)] text-lg">#{o.displayId || 'N/A'}</span>
                                                    <span className="text-[10px] text-[var(--text-muted)] font-mono opacity-50">GLOBAL ID: #{o.id}</span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${o.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                                        {o.status}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${o.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                                                        {o.paymentStatus || 'Pending'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-[var(--bg-input)]/50 p-3 rounded-xl border border-[var(--border)]/50">
                                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Customer</p>
                                                    <p className="text-sm font-bold text-[var(--text-main)] truncate">{o.customerName || 'N/A'}</p>
                                                    <p className="text-[10px] text-[var(--text-muted)] truncate">{o.customerPhone || 'N/A'}</p>
                                                </div>
                                                <div className="bg-[var(--bg-input)]/50 p-3 rounded-xl border border-[var(--border)]/50">
                                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Financials</p>
                                                    <p className="text-sm font-black text-[var(--primary)]">{formatPrice(o.total)}</p>
                                                    <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase">FEES: {formatPrice((o.userFee || 0) + (o.adminFee || 0))}</p>
                                                </div>
                                            </div>

                                            <div className="bg-[var(--bg-input)]/30 p-3 rounded-2xl border border-[var(--border)]/50 space-y-2">
                                                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Products to Prepare</p>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {o.items?.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-3 bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border)]/50">
                                                            <img src={getImageUrl(item.image)} alt="" className="w-10 h-10 rounded-lg object-cover border border-[var(--border)]" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between">
                                                                    <p className="text-[11px] font-black text-[var(--text-main)] truncate">{item.name}</p>
                                                                    <p className="text-[10px] font-black text-[var(--primary)]">x{item.quantity}</p>
                                                                </div>
                                                                {(item.weightTola > 0 || item.weightMasha > 0 || item.weightRati > 0) && (
                                                                    <div className="flex gap-1 text-[9px] font-bold text-[var(--text-muted)] uppercase">
                                                                        {item.weightTola > 0 && <span>{item.weightTola}T</span>}
                                                                        {item.weightMasha > 0 && <span>{item.weightMasha}M</span>}
                                                                        {item.weightRati > 0 && <span>{item.weightRati}R</span>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {o.admin && (
                                                <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-0.5">Assigned Jeweller</p>
                                                        <p className="text-sm font-bold text-[var(--text-main)]">{o.admin.name}</p>
                                                    </div>
                                                    <p className="text-xs text-blue-500 font-bold">{o.admin.phone}</p>
                                                </div>
                                            )}

                                            <div className="flex gap-2 pt-2">
                                                {o.paymentStatus !== 'Paid' && (
                                                    <button
                                                        onClick={() => confirmPayment.mutate(o.id)}
                                                        className="flex-1 py-3 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-500/20"
                                                    >
                                                        Confirm Payment
                                                    </button>
                                                )}
                                                {o.paymentReceipt && (
                                                    <a
                                                        href={getImageUrl(o.paymentReceipt)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center justify-center p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--primary)] active:scale-95"
                                                        title="View Receipt"
                                                    >
                                                        <Receipt className="w-5 h-5" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete order record?')) {
                                                            deleteOrderMutation.mutate(o.id);
                                                        }
                                                    }}
                                                    className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl active:scale-95"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'disputes' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {disputesLoading ? (
                                    <div className="col-span-full flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" /></div>
                                ) : disputes?.length === 0 ? (
                                    <div className="col-span-full p-12 text-center text-[var(--text-muted)] bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
                                        No active disputes found. Good job!
                                    </div>
                                ) : disputes?.map((d: any) => (
                                    <div key={d.id} className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-3xl shadow-xl flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-lg border border-red-500/20">CASE #{d.id}</div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${d.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                d.status === 'Under Investigation' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                {d.status}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--text-main)]">{d.subject}</h4>
                                            <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-3">{d.message}</p>
                                        </div>
                                        <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-3">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-muted)]">
                                                <div className="flex flex-col">
                                                    <span className="text-[var(--primary)]">ORDER: #{d.order?.displayId || 'N/A'}</span>
                                                    <span className="text-[var(--text-muted)] text-[8px] opacity-50">Global ID: #{d.orderId}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div>BY: {d.user?.name || 'User'}</div>
                                                    <div className="text-[var(--primary)]">{d.user?.phone || 'No Phone'}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateDispute.mutate({ id: d.id, status: 'Under Investigation' })}
                                                    className="flex-1 py-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 rounded-lg text-xs font-bold transition-all"
                                                >
                                                    Investigate
                                                </button>
                                                <button
                                                    onClick={() => updateDispute.mutate({ id: d.id, status: 'Resolved' })}
                                                    className="flex-1 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/20 rounded-lg text-xs font-bold transition-all"
                                                >
                                                    Resolve
                                                </button>
                                            </div>
                                            <div className="flex flex-col gap-2 pt-2">
                                                <div className="flex gap-2">
                                                    <input
                                                        id={`resp-${d.id}`}
                                                        placeholder="Add command center response..."
                                                        className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[var(--primary)]"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const val = (e.target as HTMLInputElement).value;
                                                                if (val.trim()) {
                                                                    updateDispute.mutate({ id: d.id, response: val });
                                                                    (e.target as HTMLInputElement).value = '';
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const el = document.getElementById(`resp-${d.id}`) as HTMLInputElement;
                                                            if (el.value.trim()) {
                                                                updateDispute.mutate({ id: d.id, response: el.value });
                                                                el.value = '';
                                                            }
                                                        }}
                                                        className="p-1.5 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {d.status === 'Resolved' && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Delete resolved dispute record?')) {
                                                                deleteDispute.mutate(d.id);
                                                            }
                                                        }}
                                                        className="w-full py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                                                    >
                                                        <Trash2 className="w-3" /> Delete Resolved Case
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }



                {
                    activeTab === 'audit' && (
                        <div className="space-y-6">
                            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl">
                                <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-input)]/30 flex items-center justify-between">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <History className="w-5 h-5 text-[var(--primary)]" />
                                        Security & Audit Trail
                                    </h3>
                                    {logs && logs.length > 0 && (
                                        <button
                                            onClick={() => {
                                                if (confirm('WARNING: This will permanently delete ALL system logs. Continue?')) {
                                                    deleteAllLogs.mutate();
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-all text-xs border border-red-500/20 font-bold flex items-center gap-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Clear Full History
                                        </button>
                                    )}
                                </div>
                                <div className="divide-y divide-[var(--border)] max-h-[600px] overflow-y-auto custom-scrollbar">
                                    {logsLoading ? (
                                        <div className="p-12 text-center text-[var(--text-muted)]">Loading system logs...</div>
                                    ) : !logs || logs.length === 0 ? (
                                        <div className="p-12 text-center text-[var(--text-muted)]">No audit entries recorded yet.</div>
                                    ) : (
                                        logs.map((log: any) => (
                                            <div key={log.id} className="p-4 hover:bg-[var(--bg-input)]/20 transition-colors flex items-start gap-4">
                                                <div className={`mt-1 p-2 rounded-lg ${log.action.includes('PAYMENT') ? 'bg-green-500/10 text-green-500' :
                                                    log.action.includes('BLOCK') || log.action.includes('FREEZE') ? 'bg-red-500/10 text-red-500' :
                                                        'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    <FileSearch className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="font-bold text-sm text-[var(--text-main)] truncate">
                                                            {log.action.replace(/_/g, ' ')}
                                                        </p>
                                                        <span className="text-[10px] text-[var(--text-muted)] font-mono whitespace-nowrap">
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                                        Target {log.entity} ID: <span className="text-[var(--text-main)] font-mono">#{log.entityId}</span> |
                                                        By: <span className="text-[var(--primary)] font-bold">{log.user?.name || 'System'}</span>
                                                    </p>
                                                    {(log.oldValue || log.newValue) && (
                                                        <div className="mt-2 flex items-center gap-2 text-[10px]">
                                                            <span className="px-1.5 py-0.5 bg-[var(--bg-input)] rounded border border-[var(--border)] font-mono line-through opacity-50">{log.oldValue || '∅'}</span>
                                                            <span className="text-[var(--text-muted)]">→</span>
                                                            <span className="px-1.5 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded border border-[var(--primary)]/20 font-bold">{log.newValue}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                <style>{`
                .tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    border-radius: 1rem;
                    font-weight: 700;
                    white-space: nowrap;
                    transition: all 0.3s;
                    background: var(--bg-card);
                    color: var(--text-muted);
                    border: 1px solid var(--border);
                }
                .tab-btn.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                    box-shadow: 0 10px 15px -3px var(--accent-glow);
                }
                .action-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .action-btn.success { background: rgba(34, 197, 94, 0.1); color: rgb(34, 197, 94); border: 1px solid rgba(34, 197, 94, 0.2); }
                .action-btn.warn { background: rgba(249, 115, 22, 0.1); color: rgb(249, 115, 22); border: 1px solid rgba(249, 115, 22, 0.2); }
                .action-btn.danger { background: rgba(239, 68, 68, 0.1); color: rgb(239, 68, 68); border: 1px solid rgba(239, 68, 68, 0.2); }
                .action-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
                .action-btn.outline { background: transparent; }
                .action-btn:hover:not(.active) { opacity: 0.8; }
            `}</style>
            </main >
        </div >
    );
}

// Clock function removed as it was unused
