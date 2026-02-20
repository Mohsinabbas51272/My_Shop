import React from 'react';

interface MarketRatePillProps {
    rates: any;
    ratesLoading: boolean;
    formatPrice: (price: number) => string;
}

const MarketRatePill: React.FC<MarketRatePillProps> = ({ rates, ratesLoading, formatPrice }) => {
    return (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[var(--bg-card)]/50 backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-xl">
            <div className="flex -space-x-2">
                <div className="p-1 px-1.5 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                </div>
            </div>
            <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">Live Market</span>
                    <span className="text-[7px] font-bold text-[var(--text-muted)] opacity-60 tabular-nums">
                        {ratesLoading ? '--:-- --' : new Date(rates?.goldRaw?.sourceUpdatedAt || rates?.goldRaw?.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-[10px] font-bold text-amber-500">AU</span>
                            <span className="text-xs font-black text-[var(--text-main)] min-w-[60px] text-right">
                                {ratesLoading ? (
                                    <div className="h-4 w-16 bg-[var(--text-muted)]/20 animate-pulse rounded" />
                                ) : (
                                    rates?.gold && rates.gold !== 0 ? formatPrice(rates.gold) : 'Unavailable'
                                )}
                            </span>
                        </div>
                    </div>
                    <div className="w-px h-4 bg-[var(--border)]" />
                    <div className="flex flex-col items-end">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400">AG</span>
                            <span className="text-xs font-black text-[var(--text-main)] min-w-[50px] text-right">
                                {ratesLoading ? (
                                    <div className="h-4 w-14 bg-[var(--text-muted)]/20 animate-pulse rounded" />
                                ) : (
                                    formatPrice(rates?.silver || 0)
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketRatePill;
