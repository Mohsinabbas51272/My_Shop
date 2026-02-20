import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Plus, Gavel, Loader2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ComplaintsTabProps {
    complaintsLoading: boolean;
    complaints: any[];
    disputesUserLoading: boolean;
    disputes: any[];
    setDisputingOrder: (order: any) => void;
    setDisputeData: (data: any) => void;
}

const ComplaintsTab: React.FC<ComplaintsTabProps> = ({
    complaintsLoading,
    complaints,
    disputesUserLoading,
    disputes,
    setDisputingOrder: _setDisputingOrder,
    setDisputeData: _setDisputeData
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-2">
                        <div className="p-2 bg-[var(--primary)]/10 rounded-xl border border-[var(--primary)]/20 shadow-lg">
                            <MessageCircle className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <span className="text-gradient-primary">Support & Disputes</span>
                    </h2>
                    <p className="text-[var(--text-muted)] mt-1 font-medium opacity-80 text-sm">Track your order disputes and ongoing support consultations.</p>
                </div>
                <Link
                    to="/contact"
                    className="group flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-[var(--primary-hover)] transition-all shadow-lg hover:shadow-[var(--accent-glow)] w-fit text-sm"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    Submit New Query
                </Link>
            </div>

            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] flex items-center gap-2 opacity-60">
                    <MessageCircle className="w-3.5 h-3.5" /> Support Queries
                </h3>
                {complaintsLoading ? (
                    <div className="p-8 text-center animate-pulse bg-[var(--bg-card)]/20 rounded-2xl border border-[var(--border)]/50 backdrop-blur-sm">
                        <p className="font-bold text-[var(--text-muted)] text-sm">Retrieving support threads...</p>
                    </div>
                ) : !complaints || complaints.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)] bg-[var(--bg-card)]/10 rounded-2xl border border-dashed border-[var(--border)]/50">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-10" />
                        <p className="text-sm font-bold">No general support queries</p>
                        <p className="text-[10px] mt-0.5 opacity-60">Need help? We're just a message away.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {complaints.map((c: any) => (
                            <motion.div
                                key={c.id}
                                whileHover={{ y: -3 }}
                                className="glass-card bg-[var(--bg-card)]/30 border border-[var(--border)]/50 rounded-xl p-4 shadow-lg hover:border-[var(--primary)]/30 transition-all duration-300 group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-black text-base text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">{c.subject}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border shadow-sm ${c.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                        {c.status}
                                    </span>
                                </div>
                                {c.orderId && (
                                    <span className="text-[8px] font-black text-[var(--primary)] uppercase tracking-widest block mb-2">
                                        Linked Order: #{c.order?.displayId || c.orderId}
                                    </span>
                                )}
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3 opacity-80 line-clamp-2">{c.message}</p>
                                {c.adminResponse && (
                                    <div className="bg-[var(--bg-input)]/40 border border-[var(--border)]/50 p-2.5 rounded-lg">
                                        <div className="font-black text-[8px] text-[var(--primary)] uppercase tracking-widest mb-1 opacity-60">Official Response</div>
                                        <p className="text-xs text-[var(--text-main)] italic font-medium">"{c.adminResponse}"</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] flex items-center gap-2 opacity-60">
                    <Gavel className="w-3.5 h-3.5" /> Order Disputes
                </h3>
                {disputesUserLoading ? (
                    <div className="p-8 text-center animate-pulse bg-[var(--bg-card)]/20 rounded-2xl border border-[var(--border)]/50 backdrop-blur-sm">
                        <Loader2 className="w-5 h-5 mx-auto animate-spin text-[var(--primary)] mb-2" />
                        <p className="font-bold text-[var(--text-muted)] text-sm">Checking records...</p>
                    </div>
                ) : !disputes || disputes.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)] bg-[var(--bg-card)]/10 rounded-2xl border border-dashed border-[var(--border)]/50">
                        <Gavel className="w-8 h-8 mx-auto mb-2 opacity-10" />
                        <p className="text-sm font-bold">No active disputes</p>
                        <p className="text-[10px] mt-0.5 opacity-60">Everything is in order.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {disputes.map((d: any) => (
                            <motion.div
                                key={d.id}
                                whileHover={{ y: -3 }}
                                className="glass-card bg-[var(--bg-card)]/30 border border-[var(--border)]/50 rounded-xl p-4 shadow-lg hover:border-[var(--primary)]/30 transition-all duration-300 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-1 px-2 bg-[var(--primary)]/5 rounded-bl-lg border-l border-b border-[var(--border)]/30">
                                    <span className="text-[7px] font-black text-[var(--primary)] uppercase tracking-tighter">Case #{d.id}</span>
                                </div>
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-black text-base text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">{d.subject}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border shadow-sm ${d.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        d.status === 'Under Investigation' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                        }`}>
                                        {d.status}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3 opacity-80 line-clamp-2">{d.message}</p>

                                {d.adminResponse && (
                                    <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 p-2.5 rounded-lg relative">
                                        <div className="flex items-center gap-1.5 text-[8px] font-black text-[var(--primary)] uppercase tracking-widest mb-1">
                                            <ShieldCheck className="w-3 h-3" />
                                            Response
                                        </div>
                                        <p className="text-xs text-[var(--text-main)] italic font-medium">"{d.adminResponse}"</p>
                                        <div className="text-[8px] text-[var(--text-muted)] text-right mt-1 font-bold opacity-50">
                                            {new Date(d.adminRespondedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 pt-2 flex items-center justify-between border-t border-[var(--border)]/50 text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                                    <span>Order: <span className="text-[var(--primary)]">#{d.order?.displayId || d.orderId}</span></span>
                                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ComplaintsTab;
