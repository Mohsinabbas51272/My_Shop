import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import Navbar from './Navbar';
import { useCurrencyStore } from '../store/useCurrencyStore';
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
            alert('Legal action recorded in system audit.');
            queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
        },
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
        mutationFn: ({ id, status }: { id: number, status: string }) => api.patch(`/disputes/${id}/status`, { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['super-admin-disputes'] }),
    });

    const deleteAllLogs = useMutation({
        mutationFn: () => api.delete('/audit'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audit-logs'] }),
    });

    // deleted getImageUrl function as it was unused

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-['Outfit']">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
                    <header>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <ShieldCheck className="w-10 h-10 text-[var(--primary)]" />
                            Super Admin Command Center
                        </h1>
                        <p className="text-[var(--text-muted)] mt-2">Manage platform security, verify users, and confirm financial settlements.</p>
                    </header>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                        <button onClick={() => setActiveTab('users')} className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}>
                            <Users className="w-4 h-4" /> Users
                        </button>
                        <button onClick={() => setActiveTab('orders')} className={`relative tab-btn ${activeTab === 'orders' ? 'active' : ''}`}>
                            <ShoppingBag className="w-4 h-4" /> Settlement
                            {dashboardCounts?.orders > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-[var(--bg-main)] shadow-sm">
                                    {dashboardCounts.orders}
                                </span>
                            )}
                        </button>
                        <button onClick={() => setActiveTab('disputes')} className={`tab-btn ${activeTab === 'disputes' ? 'active' : ''}`}>
                            <Gavel className="w-4 h-4" /> Disputes
                        </button>
                        <button onClick={() => setActiveTab('audit')} className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}>
                            <History className="w-4 h-4" /> Logs
                        </button>
                    </div>
                </div>

                {activeTab === 'users' && (
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl">
                            <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-input)]/30">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-[var(--primary)]" />
                                    Financial Settlement & Order Management
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[var(--bg-input)]/50 border-b border-[var(--border)]">
                                        <tr>
                                            <th className="p-4 text-left text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Order ID</th>
                                            <th className="p-4 text-left text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Customer</th>
                                            <th className="p-4 text-left text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Total Amount</th>
                                            <th className="p-4 text-left text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Status</th>
                                            <th className="p-4 text-left text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Payment Status</th>
                                            <th className="p-4 text-right text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {ordersLoading ? (
                                            <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
                                        ) : !orders || orders.length === 0 ? (
                                            <tr><td colSpan={6} className="p-12 text-center text-[var(--text-muted)]">No orders found</td></tr>
                                        ) : orders.map((o: any) => (
                                            <tr key={o.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                                <td className="p-4 font-bold text-[var(--primary)]">#{o.id}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-[var(--text-main)]">{o.customerName || 'N/A'}</span>
                                                        <span className="text-xs text-[var(--text-muted)]">{o.user?.email || 'N/A'}</span>
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
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${o.paymentStatus === 'Paid'
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                        }`}>
                                                        {o.paymentStatus || 'Pending'}
                                                    </span>
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
                        </div>
                    </div>
                )}

                {activeTab === 'disputes' && (
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
                                            <span>ORDER ID: #{d.orderId}</span>
                                            <span>BY: {d.user?.name || 'User'}</span>
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}



                {activeTab === 'audit' && (
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
                )}
            </main>

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
        </div>
    );
}

// Clock function removed as it was unused
