import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, FileText } from 'lucide-react';

interface AdminLegalBannerProps {
    notices: any[];
    activeTab: string;
    setActiveTab: (tab: any) => void;
    setSupportSubTab: (tab: any) => void;
    user: any;
}

const AdminLegalBanner: React.FC<AdminLegalBannerProps> = ({
    notices,
    activeTab,
    setActiveTab,
    setSupportSubTab,
    user,
}) => {
    return (
        <AnimatePresence>
            {notices?.length > 0 && activeTab !== 'local' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="max-w-7xl mx-auto px-4 sm:px-8 mb-4 overflow-hidden"
                >
                    <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 rounded-2xl px-5 py-4 shadow-sm group border border-amber-200/60 dark:border-amber-700/30">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/40 dark:via-amber-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s] ease-in-out" />
                        <div className="absolute top-0 right-0 p-4 opacity-[0.04]">
                            <ShieldAlert className="w-28 h-28" />
                        </div>

                        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl border border-amber-200/80 dark:border-amber-700/40">
                                        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="px-2 py-0.5 bg-amber-200/60 dark:bg-amber-800/40 rounded-md text-[8px] font-black uppercase tracking-[0.15em] text-amber-700 dark:text-amber-300 border border-amber-300/50 dark:border-amber-600/30">
                                            Legal Notice
                                        </span>
                                        <span className="text-[9px] font-bold text-amber-500/70 dark:text-amber-400/60 uppercase tracking-wider">
                                            Ref #FIR-{user?.id}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100 leading-tight">
                                        {notices.length} Legal {notices.length > 1 ? 'Actions' : 'Action'} Recorded
                                    </h3>
                                    <p className="text-xs text-amber-700/70 dark:text-amber-300/60 mt-0.5 leading-relaxed max-w-lg">
                                        Review your records to maintain account standing.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 sm:ml-4">
                                <button
                                    onClick={() => {
                                        setActiveTab('support');
                                        setSupportSubTab('audit');
                                    }}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm shadow-amber-600/20 flex items-center gap-1.5"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    Case Records
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AdminLegalBanner;
