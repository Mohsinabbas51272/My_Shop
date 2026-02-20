import React from 'react';
import { 
    ShoppingBag, 
    User, 
    MapPin, 
    Receipt, 
    CheckCircle, 
    ShieldCheck, 
    Package, 
    FileText, 
    Trash2,
    Phone
} from 'lucide-react';

interface OrdersTabProps {
    orders: any[];
    ordersLoading: boolean;
    q: string;
    formatPrice: (price: number) => string;
    getImageUrl: (url: string) => string;
    confirmPayment: any;
    updateOrderStatusMutation: any;
    deleteOrderMutation: any;
    sendReceiptMutation: any;
    setViewingReceipt: (order: any) => void;
    disputes?: any[];
}

const OrdersTab: React.FC<OrdersTabProps> = ({
    orders,
    ordersLoading,
    q,
    formatPrice,
    getImageUrl,
    confirmPayment,
    updateOrderStatusMutation,
    deleteOrderMutation,
    sendReceiptMutation: _sendReceiptMutation,
    setViewingReceipt,
    disputes: _disputes,
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-black flex items-center gap-3 text-[var(--text-main)]">
                    <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
                        <ShoppingBag className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    Order Management
                </h2>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-1.5 rounded-full border border-[var(--border)] shadow-sm whitespace-nowrap">
                        {orders?.length || 0} Total Orders
                    </div>
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--bg-input)] text-[var(--text-muted)] font-black uppercase tracking-[0.15em] text-[10px]">
                        <tr>
                            <th className="p-6">Order ID</th>
                            <th className="p-6">Customer Details</th>
                            <th className="p-6">Items Ordered</th>
                            <th className="p-6">Financials</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-right">Quick Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]/50">
                        {ordersLoading ? (
                            <tr><td colSpan={6} className="p-12 text-center uppercase tracking-widest opacity-50 font-bold">Loading Orders...</td></tr>
                        ) : (orders || [])
                            .filter((o: any) =>
                                !q ||
                                o.displayId?.toLowerCase().includes(q.toLowerCase()) ||
                                o.user?.name?.toLowerCase().includes(q.toLowerCase()) ||
                                o.phone?.includes(q)
                            )
                            .map((o: any) => (
                                <tr key={o.id} className="hover:bg-[var(--bg-input)]/30 transition-colors group">
                                    <td className="p-6 align-top">
                                        <div className="space-y-1">
                                            <span className="font-black text-[var(--primary)] text-sm block">#{o.displayId || 'N/A'}</span>
                                            <span className="text-[9px] text-[var(--text-muted)] font-mono opacity-50 block">GID: {o.id}</span>
                                            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold block mt-2">
                                                {new Date(o.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6 align-top">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-muted)]">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[var(--text-main)] text-sm leading-none">{o.customerName || o.user?.name || 'Guest'}</p>
                                                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mt-1">{o.customerPhone || o.user?.phone || 'No Phone'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 p-2 bg-[var(--bg-input)]/30 rounded-lg border border-[var(--border)]/50">
                                                <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 mt-0.5" />
                                                <p className="text-[11px] text-[var(--text-muted)] leading-tight line-clamp-2 w-48">
                                                    {o.customerAddress || o.user?.address || 'No Address Provided'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 align-top">
                                        <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-2">
                                            {o.items?.map((item: any, idx: number) => (
                                                <div key={idx} className="flex gap-3 items-center group/item hover:bg-[var(--bg-input)] p-1.5 rounded-lg transition-colors">
                                                    <div className="w-10 h-10 rounded-md bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden shrink-0">
                                                        <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-bold text-[var(--text-main)] truncate max-w-[120px]" title={item.name}>{item.name}</p>
                                                            <span className="text-[9px] font-black bg-[var(--bg-input)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">x{item.quantity}</span>
                                                        </div>
                                                        <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-tight flex gap-1 mt-0.5">
                                                            {item.weightTola > 0 && <span>{item.weightTola}T</span>}
                                                            {item.weightMasha > 0 && <span>{item.weightMasha}M</span>}
                                                            {item.weightRati > 0 && <span>{item.weightRati}R</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-6 align-top">
                                        <div className="space-y-2">
                                            <p className="text-lg font-black text-[var(--text-main)] tracking-tight">{formatPrice(o.total)}</p>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${o.paymentStatus === 'Paid' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]'}`} />
                                                    <span className={`text-[10px] uppercase font-black tracking-widest ${o.paymentStatus === 'Paid' ? 'text-green-500' : 'text-yellow-600'}`}>
                                                        {o.paymentStatus || 'Unpaid'}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-[var(--text-muted)] px-2 py-1 bg-[var(--bg-input)] rounded-lg border border-[var(--border)] w-fit">
                                                    Via {o.paymentMethod || 'COD'}
                                                </span>
                                                {o.paymentReceipt && (
                                                    <a
                                                        href={getImageUrl(o.paymentReceipt)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1.5 text-[10px] font-black text-[var(--primary)] hover:underline uppercase tracking-widest mt-1"
                                                    >
                                                        <Receipt className="w-3 h-3" />
                                                        Receipt
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 align-top">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${o.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            o.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                o.status === 'Ready to Deliver' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                            }`}>
                                            {o.status === 'Delivered' && <CheckCircle className="w-3.5 h-3.5" />}
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="p-6 align-top text-right">
                                        <div className="flex flex-col gap-2 items-end">
                                            {o.paymentStatus !== 'Paid' && (
                                                <button
                                                    onClick={() => confirmPayment.mutate(o.id)}
                                                    disabled={confirmPayment.isPending}
                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[var(--bg-main)] hover:bg-green-500 text-[var(--text-main)] hover:text-white rounded-lg text-[10px] font-bold uppercase transition-all border border-[var(--border)] hover:border-green-600 shadow-sm"
                                                >
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                    <span>Verify Pay</span>
                                                </button>
                                            )}

                                            {(o.status === 'Pending' || o.status === 'Processing') && (
                                                <div className="flex gap-2 w-full">
                                                    <button
                                                        onClick={() => updateOrderStatusMutation.mutate({ id: o.id, status: 'Ready to Deliver' })}
                                                        className="flex-1 p-2 bg-[var(--bg-main)] hover:bg-[var(--primary)] text-[var(--text-muted)] hover:text-white rounded-lg border border-[var(--border)] transition-all"
                                                        title="Mark Ready"
                                                    >
                                                        <Package className="w-4 h-4 mx-auto" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateOrderStatusMutation.mutate({ id: o.id, status: 'Delivered' })}
                                                        className="flex-1 p-2 bg-[var(--bg-main)] hover:bg-green-500 text-[var(--text-muted)] hover:text-white rounded-lg border border-[var(--border)] transition-all"
                                                        title="Mark Delivered"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mx-auto" />
                                                    </button>
                                                </div>
                                            )}

                                            {o.status === 'Ready to Deliver' && (
                                                <button
                                                    onClick={() => updateOrderStatusMutation.mutate({ id: o.id, status: 'Delivered' })}
                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-[10px] font-bold uppercase transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    <span>Dispatch</span>
                                                </button>
                                            )}

                                            <div className="flex gap-2 w-full mt-1">
                                                <button
                                                    onClick={() => setViewingReceipt(o)}
                                                    className="flex-1 flex items-center justify-center p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg hover:bg-[var(--bg-input)] transition-colors"
                                                    title="View Invoice"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>

                                                {(o.status === 'Delivered' || o.status === 'Cancelled') && (
                                                    <button
                                                        onClick={() => confirm('Delete order record permanently?') && deleteOrderMutation.mutate(o.id)}
                                                        className="flex-1 flex items-center justify-center p-2 text-[var(--text-muted)] hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4">
                {ordersLoading ? (
                    <div className="p-8 text-center uppercase tracking-widest text-xs font-bold opacity-60">Loading Orders...</div>
                ) : (orders || [])
                    .filter((o: any) =>
                        !q ||
                        o.displayId?.toLowerCase().includes(q.toLowerCase()) ||
                        o.user?.name?.toLowerCase().includes(q.toLowerCase()) ||
                        o.phone?.includes(q)
                    )
                    .map((o: any) => (
                        <div key={o.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden">
                            {/* Header Stripe */}
                            <div className={`absolute top-0 left-0 w-1 h-full ${o.status === 'Delivered' ? 'bg-green-500' : o.paymentStatus === 'Paid' ? 'bg-[var(--primary)]' : 'bg-yellow-500'}`} />

                            <div className="flex justify-between items-start pl-2">
                                <div>
                                    <h3 className="font-black text-[var(--text-main)]">Order #{o.displayId}</h3>
                                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{new Date(o.createdAt).toDateString()}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${o.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                    'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                    }`}>
                                    {o.status}
                                </span>
                            </div>

                            <div className="pl-2 space-y-3">
                                {/* User Info */}
                                <div className="flex items-center gap-3 p-3 bg-[var(--bg-input)]/50 rounded-xl border border-[var(--border)]/50">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] flex items-center justify-center border border-[var(--border)]">
                                        <User className="w-5 h-5 text-[var(--text-muted)]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-[var(--text-main)]">{o.customerName || o.user?.name}</p>
                                        <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> {o.customerPhone || o.user?.phone}
                                        </p>
                                    </div>
                                </div>

                                {/* Items Summary */}
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                    {o.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="shrink-0 w-16 space-y-1">
                                            <img src={getImageUrl(item.image)} alt="" className="w-16 h-16 rounded-lg object-cover bg-[var(--bg-input)] border border-[var(--border)]" />
                                            <p className="text-[9px] font-bold truncate text-[var(--text-muted)]">{item.name}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Financials */}
                                <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]/50">
                                    <div>
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Total Amount</p>
                                        <p className="text-xl font-black text-[var(--text-main)]">{formatPrice(o.total)}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`block text-[10px] font-black uppercase tracking-widest ${o.paymentStatus === 'Paid' ? 'text-green-500' : 'text-yellow-600'}`}>
                                            {o.paymentStatus || 'Unpaid'}
                                        </span>
                                        <span className="text-[9px] font-bold text-[var(--text-muted)]">{o.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Actions Grid */}
                            <div className="grid grid-cols-2 gap-2 pl-2">
                                {o.paymentStatus !== 'Paid' && (
                                    <button
                                        onClick={() => confirmPayment.mutate(o.id)}
                                        className="col-span-2 py-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <ShieldCheck className="w-4 h-4" /> Verify Payment
                                    </button>
                                )}
                                {(o.status === 'Pending' || o.status === 'Processing') && (
                                    <>
                                        <button
                                            onClick={() => updateOrderStatusMutation.mutate({ id: o.id, status: 'Ready to Deliver' })}
                                            className="py-2 bg-[var(--bg-input)] rounded-xl text-[10px] font-black uppercase text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all border border-[var(--border)]"
                                        >
                                            Mark Ready
                                        </button>
                                        <button
                                            onClick={() => updateOrderStatusMutation.mutate({ id: o.id, status: 'Delivered' })}
                                            className="py-2 bg-[var(--bg-input)] rounded-xl text-[10px] font-black uppercase text-[var(--text-muted)] hover:text-green-500 hover:bg-green-500/10 transition-all border border-[var(--border)]"
                                        >
                                            Mark Delivered
                                        </button>
                                    </>
                                )}
                                {o.status === 'Ready to Deliver' && (
                                    <button
                                        onClick={() => updateOrderStatusMutation.mutate({ id: o.id, status: 'Delivered' })}
                                        className="col-span-2 py-3 bg-green-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Dispatch Order
                                    </button>
                                )}
                                <button
                                    onClick={() => setViewingReceipt(o)}
                                    className="py-2 text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold text-[10px] uppercase border border-transparent hover:border-[var(--border)] rounded-xl transition-all"
                                >
                                    Receipt
                                </button>
                                {(o.status === 'Delivered' || o.status === 'Cancelled') && (
                                    <button
                                        onClick={() => deleteOrderMutation.mutate(o.id)}
                                        className="py-2 text-red-500 hover:bg-red-500/10 font-bold text-[10px] uppercase rounded-xl transition-all"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default OrdersTab;
