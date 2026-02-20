import React from 'react';
import { Menu, Gavel } from 'lucide-react';

interface AdminHeaderProps {
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    goldRate: any;
    goldLoading: boolean;
    silverRate: any;
    silverLoading: boolean;
    formatPrice: (price: number) => string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
    setIsMobileMenuOpen,
    goldRate,
    goldLoading,
    silverRate,
    silverLoading,
    formatPrice,
}) => {
    return (
        <div className="sticky top-14 z-[70] bg-[var(--bg-main)]/80 backdrop-blur-xl border-b border-[var(--border)]/30 px-4 sm:px-8 py-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-[var(--bg-input)] shrink-0 transition-colors"
                    >
                        <Menu className="w-5 h-5 text-[var(--text-main)]" />
                    </button>
                    <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto w-full no-scrollbar">
                        {/* Gold Pill */}
                        {goldRate && !goldLoading && (
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0 bg-[var(--bg-card)]/50 border border-yellow-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-sm">
                                <div className="hidden sm:block p-1.5 bg-yellow-500/10 rounded-lg">
                                    <Gavel className="w-4 h-4 text-yellow-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-yellow-600 uppercase tracking-widest leading-none">GOLD {goldRate.purity}</span>
                                    <span className="text-sm font-black text-[var(--text-main)]">{formatPrice(goldRate.price)}</span>
                                </div>
                            </div>
                        )}
                        {/* Silver Pill */}
                        {silverRate && !silverLoading && (
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0 bg-[var(--bg-card)]/50 border border-slate-400/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-sm">
                                <div className="hidden sm:block p-1.5 bg-slate-400/10 rounded-lg">
                                    <Gavel className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">SILVER {silverRate.purity}</span>
                                    <span className="text-sm font-black text-[var(--text-main)]">{formatPrice(silverRate.price)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Live System Active</span>
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;
