import React from 'react';
import { TrendingUp, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

interface RateControlTabProps {
    rateSettings: any;
    updateRateSettingsMutation: any;
    formatPrice: (price: number) => string;
}

const RateControlTab: React.FC<RateControlTabProps> = ({
    rateSettings,
    updateRateSettingsMutation,
    formatPrice,
}) => {
    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            <header className="text-center space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-[var(--text-main)]">Live Rate Controller</h2>
                <p className="text-[var(--text-muted)]">Set permanent adjustments or manual rates for all users.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gold Control */}
                <div className="bg-[var(--bg-card)] border border-yellow-500/20 p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
                    {!rateSettings?.useCustomGoldRate && (
                        <button
                            onClick={() => {
                                if (confirm('Reset Gold adjustment to 0?')) {
                                    updateRateSettingsMutation.mutate({ goldAdjustment: 0 });
                                    const el = document.getElementById('gold-adjust-input') as HTMLInputElement;
                                    if (el) el.value = '0';
                                }
                            }}
                            className="absolute top-4 right-4 p-1.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-600 hover:text-white rounded-lg transition-all border border-yellow-500/20 z-20"
                            title="Reset Gold Rate"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-500/10 rounded-2xl">
                                <TrendingUp className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-yellow-600 text-lg">Gold Control</h3>
                                <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Pricing Strategy</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[var(--bg-input)] rounded-2xl border border-[var(--border)]">
                            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Manual Price Control</span>
                            <button
                                onClick={() => updateRateSettingsMutation.mutate({ useCustomGoldRate: !rateSettings?.useCustomGoldRate })}
                                className={`w-12 h-6 rounded-full transition-all relative ${rateSettings?.useCustomGoldRate ? 'bg-yellow-500' : 'bg-[var(--bg-main)] border border-[var(--border)]'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${rateSettings?.useCustomGoldRate ? 'right-1 bg-white' : 'left-1 bg-[var(--text-muted)]'}`} />
                            </button>
                        </div>

                        {rateSettings?.useCustomGoldRate ? (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-black uppercase tracking-widest text-yellow-600 ml-1">Fixed Gold Rate (PKR)</label>
                                <input
                                    type="number"
                                    defaultValue={rateSettings?.customGoldRate}
                                    onBlur={(e) => updateRateSettingsMutation.mutate({ customGoldRate: parseFloat(e.target.value) })}
                                    className="w-full bg-[var(--bg-input)] border-2 border-yellow-500/30 rounded-2xl px-6 py-4 text-xl font-black focus:border-yellow-500 outline-none transition-all"
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Market Adjustment (+/-)</label>
                                <div className="relative">
                                    <input
                                        id="gold-adjust-input"
                                        type="number"
                                        defaultValue={rateSettings?.goldAdjustment}
                                        onBlur={(e) => updateRateSettingsMutation.mutate({ goldAdjustment: parseFloat(e.target.value) })}
                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl px-6 py-4 text-xl font-black focus:border-yellow-500 outline-none transition-all"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">PKR</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10">
                        <div className="flex items-center gap-2 text-[10px] font-black text-yellow-700 uppercase tracking-widest">
                            <Zap className="w-3 h-3" /> System Logic
                        </div>
                        <p className="text-[11px] text-yellow-600/70 mt-1 leading-relaxed capitalize">
                            {rateSettings?.useCustomGoldRate
                                ? `System is ignoring market and using fixed rate: ${formatPrice(rateSettings.customGoldRate)}`
                                : `Adding ${formatPrice(rateSettings?.goldAdjustment || 0)} spread to live market price.`}
                        </p>
                    </div>
                </div>

                {/* Silver Control */}
                <div className="bg-[var(--bg-card)] border border-slate-400/20 p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
                    {!rateSettings?.useCustomSilverRate && (
                        <button
                            onClick={() => {
                                if (confirm('Reset Silver adjustment to 0?')) {
                                    updateRateSettingsMutation.mutate({ silverAdjustment: 0 });
                                    const el = document.getElementById('silver-adjust-input') as HTMLInputElement;
                                    if (el) el.value = '0';
                                }
                            }}
                            className="absolute top-4 right-4 p-1.5 bg-slate-400/10 hover:bg-slate-500 text-slate-600 hover:text-white rounded-lg transition-all border border-slate-400/20 z-20"
                            title="Reset Silver Rate"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-400/10 rounded-2xl">
                                <TrendingUp className="w-6 h-6 text-slate-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-600 text-lg">Silver Control</h3>
                                <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Pricing Strategy</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[var(--bg-input)] rounded-2xl border border-[var(--border)]">
                            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Manual Price Control</span>
                            <button
                                onClick={() => updateRateSettingsMutation.mutate({ useCustomSilverRate: !rateSettings?.useCustomSilverRate })}
                                className={`w-12 h-6 rounded-full transition-all relative ${rateSettings?.useCustomSilverRate ? 'bg-slate-500' : 'bg-[var(--bg-main)] border border-[var(--border)]'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${rateSettings?.useCustomSilverRate ? 'right-1 bg-white' : 'left-1 bg-[var(--text-muted)]'}`} />
                            </button>
                        </div>

                        {rateSettings?.useCustomSilverRate ? (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Fixed Silver Rate (PKR)</label>
                                <input
                                    type="number"
                                    defaultValue={rateSettings?.customSilverRate}
                                    onBlur={(e) => updateRateSettingsMutation.mutate({ customSilverRate: parseFloat(e.target.value) })}
                                    className="w-full bg-[var(--bg-input)] border-2 border-slate-400/30 rounded-2xl px-6 py-4 text-xl font-black focus:border-slate-500 outline-none transition-all"
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Market Adjustment (+/-)</label>
                                <div className="relative">
                                    <input
                                        id="silver-adjust-input"
                                        type="number"
                                        defaultValue={rateSettings?.silverAdjustment}
                                        onBlur={(e) => updateRateSettingsMutation.mutate({ silverAdjustment: parseFloat(e.target.value) })}
                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl px-6 py-4 text-xl font-black focus:border-slate-500 outline-none transition-all"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">PKR</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-400/5 rounded-2xl border border-slate-400/10">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                            <Zap className="w-3 h-3" /> System Logic
                        </div>
                        <p className="text-[11px] text-slate-600/70 mt-1 leading-relaxed capitalize">
                            {rateSettings?.useCustomSilverRate
                                ? `System is ignoring market and using fixed rate: ${formatPrice(rateSettings.customSilverRate)}`
                                : `Adding ${formatPrice(rateSettings?.silverAdjustment || 0)} spread to live market price.`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 p-6 rounded-[2.5rem] flex items-center gap-4 text-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Changes are broadcasted to all active user sessions instantly.</p>
            </div>
        </div>
    );
};

export default RateControlTab;
