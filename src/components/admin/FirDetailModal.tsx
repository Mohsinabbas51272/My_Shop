import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, X, Clock, ShieldCheck } from 'lucide-react';

interface FirDetailModalProps {
    viewingFirLog: any;
    setViewingFirLog: (log: any) => void;
    users: any[];
}

const FirDetailModal: React.FC<FirDetailModalProps> = ({
    viewingFirLog,
    setViewingFirLog,
    users,
}) => {
    if (!viewingFirLog) return null;
    const firLog = viewingFirLog;
    const onClose = () => setViewingFirLog(null);

    const defendant = users?.find((u: any) => u.id === firLog.entityId);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 30 }}
                    className="relative w-full max-w-xl bg-white rounded-3xl sm:rounded-[3rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Gavel className="w-64 h-64 -rotate-12" />
                    </div>

                    <div className="p-6 sm:p-10 relative overflow-y-auto flex-1 custom-scrollbar">
                        <div className="flex justify-between items-start mb-6 sm:mb-10">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-red-500 rounded-lg">
                                        <Gavel className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">Official FIR Record</span>
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Legal Notice</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-2xl transition-all"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case ID</p>
                                    <p className="font-mono font-bold text-slate-900">#FIR-{firLog.id}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</p>
                                    <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        {new Date(firLog.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Defendant</p>
                                    <p className="font-black text-slate-900">
                                        {defendant?.name || `User #${firLog.entityId}`}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Violation Type</p>
                                    <p className="font-black text-red-600">{firLog.metadata?.violation || 'General'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description of Violation</p>
                                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                                        "{typeof firLog.metadata?.details === 'string' ? firLog.metadata.details : JSON.stringify(firLog.metadata?.details)}"
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center rotate-3 border-2 border-slate-200/50">
                                    <ShieldCheck className="w-8 h-8 text-slate-300 -rotate-3" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authenticated System Record</p>
                                    <p className="text-[9px] text-slate-300 font-bold mt-1">This is a system generated legal notice. No physical signature required.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default FirDetailModal;
