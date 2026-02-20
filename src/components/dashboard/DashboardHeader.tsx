import React from 'react';
import { ShieldCheck } from 'lucide-react';
import MarketRatePill from './MarketRatePill';

interface DashboardHeaderProps {
    metalCategory: string;
    setMetalCategory: (category: 'Gold' | 'Silver') => void;
    rates: any;
    ratesLoading: boolean;
    formatPrice: (price: number) => string;
    user: any;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    metalCategory,
    setMetalCategory,
    rates,
    ratesLoading,
    formatPrice,
    user
}) => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-black text-[var(--text-main)] tracking-tight">
                    Our <span className="text-[var(--primary)]">Collection</span>
                </h1>
                <p className="text-sm md:text-base text-[var(--text-muted)] font-medium">Manage your assets and explore the market.</p>
            </div>

            {/* Market Rate Pill & Metal Toggle */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Gold/Silver Toggle - Web View Only */}
                <div className="hidden md:flex items-center p-1 bg-[var(--bg-card)]/50 backdrop-blur-xl border border-[var(--border)] rounded-full">
                    <button
                        onClick={() => setMetalCategory('Gold')}
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${metalCategory === 'Gold' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                        Gold
                    </button>
                    <button
                        onClick={() => setMetalCategory('Silver')}
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${metalCategory === 'Silver' ? 'bg-slate-400 text-black shadow-lg shadow-slate-400/20' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                        Silver
                    </button>
                </div>

                <MarketRatePill 
                    rates={rates} 
                    ratesLoading={ratesLoading} 
                    formatPrice={formatPrice} 
                />

                {/* Admin Badge */}
                {user?.role === 'ADMIN' && (
                    <div className="px-4 py-3 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-2xl flex items-center gap-2 shadow-lg shadow-[var(--primary)]/5">
                        <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
                        <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">Operator Access</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardHeader;
