import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, X, Minus, Plus, Trash2, PackageX, Check, Loader2 } from 'lucide-react';
import { IMAGE_BASE_URL } from '../../lib/api';

interface OrderEditModalProps {
    editingOrderId: number;
    editFormData: any;
    setEditFormData: (data: any) => void;
    updateItemQuantity: (id: string, delta: number) => void;
    removeItemFromEdit: (id: string) => void;
    formatPrice: (price: number) => string;
    editOrderMutation: any;
    onClose: () => void;
}

const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/400';
    if (url.startsWith('http')) return url;
    return `${IMAGE_BASE_URL}${url}`;
};

const OrderEditModal: React.FC<OrderEditModalProps> = ({
    editingOrderId,
    editFormData,
    setEditFormData,
    updateItemQuantity,
    removeItemFromEdit,
    formatPrice,
    editOrderMutation,
    onClose
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
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
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-input)] rounded-xl transition-colors">
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
                                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-[var(--bg-input)]/50 border border-[var(--border)] rounded-2xl">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--bg-input)] border border-[var(--border)] shrink-0">
                                            <img src={getImageUrl(item.image)} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-sm font-bold text-[var(--text-main)] truncate">{item.name}</h5>
                                            <p className="text-xs text-[var(--primary)] font-medium">{formatPrice(item.price)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 bg-[var(--bg-card)] sm:bg-transparent p-2 sm:p-0 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateItemQuantity(item.id, -1)}
                                                className="w-8 h-8 flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border)] hover:border-red-500 hover:text-red-500 rounded-lg transition-all active:scale-90">
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                            <button onClick={() => updateItemQuantity(item.id, 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] rounded-lg transition-all active:scale-90">
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
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
                <div className="p-4 sm:p-6 border-t border-[var(--border)] bg-[var(--bg-input)]/20 flex flex-col sm:flex-row gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full sm:flex-1 px-6 py-3 bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-main)] font-bold rounded-xl text-sm hover:opacity-80 transition-all order-2 sm:order-1"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (!editFormData.customerName || !editFormData.customerAddress || !editFormData.customerPhone) {
                                return; // Validation handled in parent
                            }
                            if (editFormData.items.length === 0) {
                                return; // Validation handled in parent
                            }
                            editOrderMutation.mutate({ orderId: editingOrderId, data: editFormData });
                        }}
                        disabled={editOrderMutation.isPending}
                        className="w-full sm:flex-1 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl text-sm hover:bg-[var(--primary-hover)] transition-all shadow-lg shadow-[var(--accent-glow)] disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
                    >
                        {editOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default OrderEditModal;
