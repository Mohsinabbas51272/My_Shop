import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Calculator, RefreshCcw, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { getPriceBreakdown } from '../lib/pricing';
import { useCurrencyStore } from '../store/useCurrencyStore';

interface GoldCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GoldCalculator({ isOpen, onClose }: GoldCalculatorProps) {
    const { formatPrice, currency } = useCurrencyStore();
    const [metalCategory, setMetalCategory] = useState<'Gold' | 'Silver'>('Gold');

    const { data: goldRate, isLoading: goldLoading, refetch: refetchGold, isFetching: isFetchingGold } = useQuery({
        queryKey: ['gold-rate'],
        queryFn: async () => (await api.get('/commodity/gold-rate')).data,
        refetchInterval: 3600000,
    });

    const { data: silverRate, isLoading: silverLoading, refetch: refetchSilver, isFetching: isFetchingSilver } = useQuery({
        queryKey: ['silver-rate'],
        queryFn: async () => (await api.get('/commodity/silver-rate')).data,
        refetchInterval: 3600000,
    });

    const metalRate = metalCategory === 'Gold' ? goldRate : silverRate;
    const isLoading = metalCategory === 'Gold' ? goldLoading : silverLoading;
    const isFetching = metalCategory === 'Gold' ? isFetchingGold : isFetchingSilver;
    const refetch = metalCategory === 'Gold' ? refetchGold : refetchSilver;

    const [weights, setWeights] = useState({
        weightTola: '1',
        weightMasha: '0',
        weightRati: '0',
        price: '0' // Making charges
    });

    const parsedWeights = {
        weightTola: parseFloat(weights.weightTola) || 0,
        weightMasha: parseFloat(weights.weightMasha) || 0,
        weightRati: parseFloat(weights.weightRati) || 0,
        price: parseFloat(weights.price) || 0
    };

    const breakdown = getPriceBreakdown(parsedWeights, metalRate);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[var(--bg-main)]/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-lg max-h-[85dvh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative scale-in-center">
                {/* Header */}
                <div className={`p-5 sm:p-6 shrink-0 border-b border-[var(--border)] bg-gradient-to-r ${metalCategory === 'Gold' ? 'from-yellow-500/10 via-amber-500/10 to-yellow-500/10' : 'from-slate-400/10 via-slate-500/10 to-slate-400/10'} flex items-center justify-between`}>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`p-2.5 sm:p-3 ${metalCategory === 'Gold' ? 'bg-yellow-500/20' : 'bg-slate-500/20'} rounded-2xl`}>
                            <Calculator className={`w-6 h-6 sm:w-8 sm:h-8 ${metalCategory === 'Gold' ? 'text-yellow-600' : 'text-slate-600'}`} />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-black text-[var(--text-main)] w-max">{metalCategory} Calculator</h3>
                            <p className={`text-[10px] font-bold ${metalCategory === 'Gold' ? 'text-yellow-600' : 'text-slate-600'} uppercase tracking-[0.2em]`}>Estimate Value</p>
                        </div>
                    </div>
                    <div className="flex bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border)] mx-2 sm:mx-4 scale-90 shrink-0">
                        <button
                            onClick={() => setMetalCategory('Gold')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${metalCategory === 'Gold' ? 'bg-yellow-600 text-white shadow-sm' : 'text-[var(--text-muted)]'}`}
                        >
                            Gold
                        </button>
                        <button
                            onClick={() => setMetalCategory('Silver')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${metalCategory === 'Silver' ? 'bg-slate-500 text-white shadow-sm' : 'text-[var(--text-muted)]'}`}
                        >
                            Silver
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all active:scale-95 shadow-lg border border-white/20"
                        title="Close Calculator"
                    >
                        <Plus className="w-4 h-4 rotate-45" />
                    </button>
                </div>

                <div className="p-5 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Live Rate Brief */}
                    <div className="bg-[var(--bg-input)]/50 rounded-3xl p-5 border border-[var(--border)] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 ${metalCategory === 'Gold' ? 'bg-yellow-500' : 'bg-slate-400'} rounded-full animate-pulse`} />
                            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Market Rate ({metalCategory === 'Gold' ? '24K' : metalRate?.purity || '99.9%'})</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-black ${metalCategory === 'Gold' ? 'text-yellow-600' : 'text-slate-600'}`}>
                                {isLoading ? '...' : (metalRate?.price ? `${metalRate.currency} ${metalRate.price}` : 'N/A')}
                            </span>
                            <button
                                onClick={() => refetch()}
                                disabled={isFetching}
                                className={`p-1.5 ${metalCategory === 'Gold' ? 'hover:bg-yellow-500/10 text-yellow-600' : 'hover:bg-slate-500/10 text-slate-600'} rounded-lg transition-all ${isFetching ? 'animate-spin' : ''}`}
                            >
                                <RefreshCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Weight Inputs */}
                    <div className="space-y-4">
                        <label className="block text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] px-1">Specify Weight</label>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase px-2">Tola</label>
                                <input
                                    type="number"
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl p-4 text-sm font-bold text-[var(--text-main)] outline-none focus:ring-2 focus:ring-yellow-500/50"
                                    value={weights.weightTola}
                                    onChange={(e) => setWeights({ ...weights, weightTola: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase px-2">Masha</label>
                                <input
                                    type="number"
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl p-4 text-sm font-bold text-[var(--text-main)] outline-none focus:ring-2 focus:ring-yellow-500/50"
                                    value={weights.weightMasha}
                                    onChange={(e) => setWeights({ ...weights, weightMasha: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase px-2">Rati</label>
                                <input
                                    type="number"
                                    className={`w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl p-4 text-sm font-bold text-[var(--text-main)] outline-none focus:ring-2 ${metalCategory === 'Gold' ? 'focus:ring-yellow-500/50' : 'focus:ring-slate-400/50'}`}
                                    value={weights.weightRati}
                                    onChange={(e) => setWeights({ ...weights, weightRati: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Making Charges */}
                    <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] px-1">Labour / Making Charges</label>
                        <div className="relative">
                            <input
                                type="number"
                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl p-4 text-sm font-bold text-[var(--text-main)] outline-none focus:ring-2 focus:ring-yellow-500/50 pr-12"
                                placeholder="Optional"
                                value={weights.price}
                                onChange={(e) => setWeights({ ...weights, price: e.target.value })}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">{currency}</span>
                        </div>
                    </div>

                    {/* Result Breakdown */}
                    <div className="pt-4 space-y-6">
                        <div className="bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-700 p-[1px] rounded-[2rem]">
                            <div className="bg-[var(--bg-card)] rounded-[2rem] p-6 space-y-4">
                                <div className="flex items-center justify-between text-[var(--text-muted)]">
                                    <span className="text-xs font-bold uppercase tracking-widest">Base Gold Value</span>
                                    <span className="font-bold">{formatPrice(breakdown.goldValue)}</span>
                                </div>
                                <div className="flex items-center justify-between text-[var(--text-muted)]">
                                    <span className="text-xs font-bold uppercase tracking-widest">Making Charges</span>
                                    <span className="font-bold">{formatPrice(breakdown.makingCharges)}</span>
                                </div>
                                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                                    <span className="text-lg font-black text-[var(--text-main)] uppercase tracking-tighter">Estimated Total</span>
                                    <span className={`text-2xl font-black ${metalCategory === 'Gold' ? 'text-yellow-600' : 'text-slate-600'}`}>
                                        {formatPrice(breakdown.total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                            <Info className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] leading-relaxed text-[var(--text-muted)] font-medium">
                                * This is an automated estimation based on current market rates. Actual jewelery prices may vary depending on design complexity and wastage (Katt).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
