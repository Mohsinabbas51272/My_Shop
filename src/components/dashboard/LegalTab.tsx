import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Loader2, ShieldCheck, File } from 'lucide-react';

interface LegalTabProps {
    noticesLoading: boolean;
    notices: any[];
    setViewingFir: (fir: any) => void;
}

const LegalTab: React.FC<LegalTabProps> = ({
    noticesLoading,
    notices,
    setViewingFir
}) => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black flex items-center gap-3">
                        <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-lg shadow-red-500/5">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                        </div>
                        <span className="text-red-500">Legal Notices & FIRs</span>
                    </h2>
                    <p className="text-[var(--text-muted)] mt-2 font-medium opacity-80">Official legal communications and record of system FIRs issued to your account.</p>
                </div>
            </div>

            <div className="space-y-6">
                {noticesLoading ? (
                    <div className="p-16 text-center animate-pulse bg-[var(--bg-card)]/20 rounded-[2.5rem] border border-[var(--border)]/50 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-red-500 mb-4" />
                        <p className="font-bold text-[var(--text-muted)]">Retrieving legal records...</p>
                    </div>
                ) : !notices || notices.length === 0 ? (
                    <div className="p-16 text-center text-[var(--text-muted)] bg-[var(--bg-card)]/10 rounded-[2.5rem] border border-dashed border-[var(--border)]/50">
                        <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20 text-green-500" />
                        <p className="text-lg font-bold">Your Record is Clean</p>
                        <p className="text-sm mt-1 opacity-60">No legal notices or FIRs have been issued to your account.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {notices.map((n: any) => (
                            <motion.div
                                key={n.id}
                                whileHover={{ y: -5 }}
                                className="glass-card bg-[var(--bg-card)]/30 border border-red-500/20 rounded-[2.5rem] p-8 shadow-xl hover:border-red-500/40 transition-all duration-300 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-1 px-3 bg-red-500 text-white rounded-bl-2xl">
                                    <span className="text-[9px] font-black uppercase tracking-widest">FIR-#{n.id}</span>
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                                        <ShieldAlert className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-xl text-[var(--text-main)] group-hover:text-red-500 transition-colors uppercase tracking-tight">
                                            {n.metadata?.violation || 'General Violation'}
                                        </h4>
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">Registered: {new Date(n.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8 opacity-80 line-clamp-3">
                                    {n.metadata?.details}
                                </p>

                                <button
                                    onClick={() => setViewingFir(n)}
                                    className="w-full py-4 bg-[var(--bg-input)] hover:bg-red-500 hover:text-white border border-[var(--border)] hover:border-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <File className="w-4 h-4" />
                                    View Official Receipt
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LegalTab;
