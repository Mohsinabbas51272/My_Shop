import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShoppingBag, Receipt, FileText, Pencil, XCircle, Gavel, Trash2 } from 'lucide-react';
import { IMAGE_BASE_URL } from '../../lib/api';

interface OrdersTabProps {
    ordersLoading: boolean;
    orders: any[];
    formatPrice: (price: number) => string;
    setSearchParams: (params: any) => void;
    setViewingReceipt: (order: any) => void;
    setEditingOrderId: (id: number) => void;
    setEditFormData: (data: any) => void;
    deleteOrderMutation: any;
    setDisputingOrder: (order: any) => void;
    setDisputeData: (data: any) => void;
    setReviewingProduct: (product: any) => void;
}

const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/400';
    if (url.startsWith('http')) return url;
    return `${IMAGE_BASE_URL}${url}`;
};

const OrdersTab: React.FC<OrdersTabProps> = ({
    ordersLoading,
    orders,
    formatPrice,
    setSearchParams,
    setViewingReceipt,
    setEditingOrderId,
    setEditFormData,
    deleteOrderMutation,
    setDisputingOrder,
    setDisputeData,
    setReviewingProduct
}) => {
    return (
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

                                <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
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
    );
};

export default OrdersTab;
