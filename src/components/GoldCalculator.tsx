import { useState, useEffect } from 'react';
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

    const { data: rates, isLoading: ratesLoading, refetch } = useQuery({
        queryKey: ['calculator-peak-rates'],
        queryFn: async () => {
            try {
                const [goldRes, silverRes] = await Promise.all([
                    api.get('/commodity/gold-rate'),
                    api.get('/commodity/silver-rate'),
                ]);

                const parsePrice = (p: any) => {
                    if (typeof p === 'string') return parseFloat(p.replace(/,/g, ''));
                    return Number(p || 0);
                };

                return {
                    gold: { ...goldRes.data, price: parsePrice(goldRes.data?.price || 0) },
                    silver: { ...silverRes.data, price: parsePrice(silverRes.data?.price || 0) },
                };
            } catch (err) {
                console.error('Calculator rate fetch error:', err);
                return null;
            }
        },
        refetchInterval: 60000,
    });

    const metalRate = metalCategory === 'Gold' ? rates?.gold : rates?.silver;
    const isLoading = ratesLoading || !metalRate;

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

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-sm max-h-[85dvh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative scale-in-center">
                {/* Header */}
                <div className={`p-4 shrink-0 border-b border-[var(--border)] bg-gradient-to-r ${metalCategory === 'Gold' ? 'from-yellow-500/10 via-amber-500/10 to-yellow-500/10' : 'from-slate-400/10 via-slate-500/10 to-slate-400/10'} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 ${metalCategory === 'Gold' ? 'bg-yellow-500/20' : 'bg-slate-500/20'} rounded-xl`}>
                            <Calculator className={`w-5 h-5 ${metalCategory === 'Gold' ? 'text-yellow-600' : 'text-slate-600'}`} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-[var(--text-main)] w-max">{metalCategory} Calculator</h3>
                            <p className={`text-[9px] font-bold ${metalCategory === 'Gold' ? 'text-yellow-600' : 'text-slate-600'} uppercase tracking-[0.2em]`}>Estimate Value</p>
                        </div>
                    </div>
                    <div className="flex bg-[var(--bg-input)] p-1 rounded-lg border border-[var(--border)] mx-2 scale-90 shrink-0">
                        <button
                            onClick={() => setMetalCategory('Gold')}
                            className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${metalCategory === 'Gold' ? 'bg-yellow-600 text-white shadow-sm' : 'text-[var(--text-muted)]'}`}
                        >
                            Gold
                        </button>
                        <button
                            onClick={() => setMetalCategory('Silver')}
                            className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${metalCategory === 'Silver' ? 'bg-slate-500 text-white shadow-sm' : 'text-[var(--text-muted)]'}`}
                        >
                            Silver
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all active:scale-95 shadow-lg border border-white/20"
                        title="Close Calculator"
                    >
                        <Plus className="w-3.5 h-3.5 rotate-45" />
                    </button>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
                    {/* Live Rate Brief */}
                    <div className="bg-[var(--bg-input)]/50 rounded-2xl p-3 border border-[var(--border)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 ${metalCategory === 'Gold' ? 'bg-yellow-500' : 'bg-slate-400'} rounded-full animate-pulse`} />
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{metalCategory === 'Gold' ? '24K' : metalRate?.purity || '99.9%'} Rate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col items-end">
                                <span className={`text-xs font-black ${metalCategory === 'Gold' ? 'text-yellow-600' : 'text-slate-600'}`}>
                                    {isLoading ? '...' : (metalRate?.price ? `${metalRate.currency} ${metalRate.price}` : 'N/A')}
                                </span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase">
                                        {new Date(metalRate?.sourceUpdatedAt || metalRate?.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => refetch()}
                                className={`p-1 ${metalCategory === 'Gold' ? 'hover:bg-yellow-500/10 text-yellow-600' : 'hover:bg-slate-500/10 text-slate-600'} rounded-md transition-all ${ratesLoading ? 'animate-spin' : ''}`}
                            >
                                <RefreshCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Weight Inputs */}
                    <div className="space-y-2">
                        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] px-1">Specify Weight</label>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[8px] font-bold text-[var(--text-muted)] uppercase px-1">Tola</label>
                                <input
                                    type="number"
                                    className={`w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-2.5 text-xs font-bold text-[var(--text-main)] outline-none focus:ring-2 ${metalCategory === 'Gold' ? 'focus:ring-yellow-500/50' : 'focus:ring-slate-400/50'}`}
                                    value={weights.weightTola}
                                    onChange={(e) => setWeights({ ...weights, weightTola: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-bold text-[var(--text-muted)] uppercase px-1">Masha</label>
                                <input
                                    type="number"
                                    className={`w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-2.5 text-xs font-bold text-[var(--text-main)] outline-none focus:ring-2 ${metalCategory === 'Gold' ? 'focus:ring-yellow-500/50' : 'focus:ring-slate-400/50'}`}
                                    value={weights.weightMasha}
                                    onChange={(e) => setWeights({ ...weights, weightMasha: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-bold text-[var(--text-muted)] uppercase px-1">Rati</label>
                                <input
                                    type="number"
                                    className={`w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-2.5 text-xs font-bold text-[var(--text-main)] outline-none focus:ring-2 ${metalCategory === 'Gold' ? 'focus:ring-yellow-500/50' : 'focus:ring-slate-400/50'}`}
                                    value={weights.weightRati}
                                    onChange={(e) => setWeights({ ...weights, weightRati: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Making Charges */}
                    <div className="space-y-1">
                        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] px-1">Labour Charges</label>
                        <div className="relative">
                            <input
                                type="number"
                                className={`w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-2.5 text-xs font-bold text-[var(--text-main)] outline-none focus:ring-2 pr-10 ${metalCategory === 'Gold' ? 'focus:ring-yellow-500/50' : 'focus:ring-slate-400/50'}`}
                                placeholder="Optional"
                                value={weights.price}
                                onChange={(e) => setWeights({ ...weights, price: e.target.value })}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-muted)]">{currency}</span>
                        </div>
                    </div>

                    {/* Result Breakdown */}
                    <div className="pt-2 space-y-4">
                        <div className={`bg-gradient-to-br ${metalCategory === 'Gold' ? 'from-yellow-500 via-amber-600 to-yellow-700' : 'from-slate-400 via-slate-500 to-slate-600'} p-[1px] rounded-2xl`}>
                            <div className="bg-[var(--bg-card)] rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between text-[var(--text-muted)]">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Base {metalCategory} Value</span>
                                        {!isLoading && metalRate && (
                                            <span className="text-[7px] font-black text-[var(--primary)] uppercase tracking-tighter">
                                                @ {formatPrice(metalRate.price)} / Tola
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-bold text-sm">{formatPrice(breakdown.goldValue)}</span>
                                </div>
                                <div className="flex items-center justify-between text-[var(--text-muted)]">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Making Charges</span>
                                    <span className="font-bold text-sm">{formatPrice(breakdown.makingCharges)}</span>
                                </div>
                                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                                    <span className="text-sm font-black text-[var(--text-main)] uppercase tracking-tighter">Estimated Total</span>
                                    <span className={`text-lg font-black ${metalCategory === 'Gold' ? 'text-yellow-600' : 'text-slate-600'}`}>
                                        {formatPrice(breakdown.total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={`flex items-start gap-2 p-3 ${metalCategory === 'Gold' ? 'bg-yellow-500/5 border-yellow-500/10' : 'bg-slate-500/5 border-slate-500/10'} border rounded-xl`}>
                            <Info className={`w-3 h-3 ${metalCategory === 'Gold' ? 'text-yellow-600' : 'text-slate-600'} shrink-0 mt-0.5`} />
                            <p className="text-[9px] leading-relaxed text-[var(--text-muted)] font-medium">
                                * Automated estimation based on current market rates. Actual prices vary by design and wastage (Katt).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
