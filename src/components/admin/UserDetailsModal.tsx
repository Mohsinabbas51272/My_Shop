import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Briefcase, 
    MapPin, 
    Phone, 
    Info, 
    Clock, 
    ShoppingBag, 
    ShieldAlert, 
    ShieldCheck 
} from 'lucide-react';

interface UserDetailsModalProps {
    selectedUser: any;
    setSelectedUser: (user: any) => void;
    blockUser: any;
    formatPrice: (price: number) => string;
    getImageUrl: (url: string) => string;
    formatDate?: (date: any) => string;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
    selectedUser,
    setSelectedUser,
    blockUser,
    formatPrice,
    getImageUrl,
    formatDate = (date) => new Date(date).toLocaleDateString(),
}) => {
    if (!selectedUser) return null;
    const user = selectedUser;
    const onClose = () => setSelectedUser(null);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-[var(--bg-card)] rounded-[2.5rem] overflow-hidden shadow-2xl border border-[var(--border)]"
                >
                    {/* Header with Background Pattern */}
                    <div className="h-32 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] relative">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="px-8 pb-8 -mt-16 relative">
                        {/* Profile Info */}
                        <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
                            <div className="w-32 h-32 rounded-3xl bg-[var(--bg-card)] border-4 border-[var(--bg-card)] shadow-2xl overflow-hidden shrink-0">
                                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                                    <span className="text-4xl font-black text-[var(--primary)]">{user.name?.[0]}</span>
                                </div>
                            </div>
                            <div className="flex-1 pb-2">
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight">{user.name}</h2>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${user.isBlocked ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                                        {user.isBlocked ? 'Blocked' : 'Active'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-[var(--text-muted)] font-bold text-xs uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-[var(--primary)]" /> Citizen #{user.id}</span>
                                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[var(--primary)]" /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Contact & Security */}
                            <div className="space-y-6">
                                <section>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 flex items-center gap-2">
                                        <Info className="w-3.5 h-3.5" /> Contact Credentials
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-[var(--bg-input)] rounded-2xl border border-[var(--border)] group hover:border-[var(--primary)]/30 transition-all">
                                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-1">Mobile Line</p>
                                            <p className="font-mono text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-[var(--primary)]" /> {user.phone}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-[var(--bg-input)] rounded-2xl border border-[var(--border)] group hover:border-[var(--primary)]/30 transition-all">
                                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-1">Registered Address</p>
                                            <p className="text-xs font-bold text-[var(--text-main)] leading-relaxed flex items-start gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-[var(--primary)] shrink-0 mt-0.5" />
                                                {user.address || 'Physical address not updated.'}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Account Control</h3>
                                    <button
                                        onClick={() => blockUser.mutate(user.id)}
                                        disabled={blockUser.isPending}
                                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${user.isBlocked
                                            ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20'
                                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'}`}
                                    >
                                        {user.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                        {user.isBlocked ? 'Restore Citizenship' : 'Execute Order 66 (Block)'}
                                    </button>
                                </section>
                            </div>

                            {/* Right Column: Order Activity */}
                            <div className="space-y-6">
                                <section>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4" /> Recent Acquisitions
                                    </h3>
                                    <div className="bg-[var(--bg-input)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
                                        {user.orders?.length > 0 ? (
                                            user.orders.slice(0, 4).map((order: any) => (
                                                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-card)] transition-colors">
                                                    <div>
                                                        <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-tighter">ORDER #{order.displayId}</p>
                                                        <p className="text-[9px] text-[var(--text-muted)] font-bold">{new Date(order.createdAt).toDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-[var(--text-main)]">{formatPrice(order.total)}</p>
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-green-500">{order.status}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center">
                                                <ShoppingBag className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-20" />
                                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">No transaction history</p>
                                            </div>
                                        )}
                                    </div>
                                    {user.orders?.length > 4 && (
                                        <p className="text-center text-[10px] font-bold text-[var(--text-muted)] mt-4 uppercase tracking-widest">+ {user.orders.length - 4} more transactions</p>
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UserDetailsModal;
