import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, X, ShieldCheck } from 'lucide-react';

interface FirReceiptModalProps {
    viewingFir: any;
    user: any;
    onClose: () => void;
}

const FirReceiptModal: React.FC<FirReceiptModalProps> = ({
    viewingFir,
    user,
    onClose
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
                className="relative w-full max-w-2xl bg-white text-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
                <div className="bg-red-600 w-full md:w-32 flex flex-row md:flex-col items-center justify-between p-6 md:py-10 text-white shrink-0">
                    <ShieldAlert className="w-10 h-10" />
                    <div className="md:rotate-180 md:[writing-mode:vertical-lr] font-black text-lg uppercase tracking-[0.3em] opacity-40">
                        Official Legal Notice
                    </div>
                    <div className="bg-white/10 p-3 rounded-full border border-white/20">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                </div>

                <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar-light">
                    <div className="flex justify-between items-start mb-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Digital FIR Record</p>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Case Registry</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-2xl transition-colors"
                        >
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-8 border-y border-slate-100 py-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case ID</p>
                                <p className="font-mono font-black text-slate-900">#{viewingFir.id.toString().padStart(6, '0')}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</p>
                                <p className="font-bold text-slate-900">{new Date(viewingFir.createdAt).toLocaleDateString('en-PK', { dateStyle: 'long' })}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Defendant</p>
                                <p className="font-black text-slate-900">{user?.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Violation Type</p>
                                <p className="font-black text-red-600">{viewingFir.metadata?.violation}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description of Violation</p>
                            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                                    "{typeof viewingFir.metadata?.details === 'string' ? viewingFir.metadata.details : JSON.stringify(viewingFir.metadata?.details)}"
                                    </p>
                            </div>
                        </div>

                        <div className="pt-8 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center rotate-3 border-2 border-slate-200/50">
                                <ShieldCheck className="w-12 h-12 text-slate-300 -rotate-3" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authenticated System Record</p>
                                <p className="text-[9px] text-slate-300 font-bold mt-1">This is a system generated legal notice. No physical signature required.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FirReceiptModal;
