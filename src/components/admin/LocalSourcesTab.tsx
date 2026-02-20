import React from 'react';
import { ExternalLink, TrendingUp, Gavel } from 'lucide-react';

interface LocalSourcesTabProps {
    detailedRates: any;
    detailedLoading: boolean;
    formatPrice: (price: number) => string;
}

const LocalSourcesTab: React.FC<LocalSourcesTabProps> = ({
    detailedRates,
    detailedLoading,
    formatPrice,
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-3 text-[var(--text-main)]">
                        <ExternalLink className="w-6 h-6 text-green-500" />
                        Market Price Transparency
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm mt-1">Direct rates from all sources used for calculation.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-input)] rounded-xl border border-[var(--border)]">
                    <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">USD/PKR:</span>
                    <span className="text-sm font-black text-[var(--text-main)]">{detailedLoading ? '...' : detailedRates?.exchangeRate}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gold Sources */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-yellow-600 flex items-center gap-2">
                        <Gavel className="w-5 h-5" />
                        Gold Sources (24K / Tola)
                    </h3>
                    <div className="bg-[var(--bg-card)] border border-yellow-500/20 rounded-2xl overflow-x-auto shadow-xl">
                        <table className="w-full text-left text-xs uppercase font-bold tracking-widest min-w-[500px]">
                            <thead className="bg-[var(--bg-input)] text-[var(--text-muted)]">
                                <tr>
                                    <th className="p-4">Source</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {detailedLoading ? (
                                    <tr><td colSpan={4} className="p-8 text-center opacity-50">Fetching Rates...</td></tr>
                                ) : (
                                    <>
                                        {detailedRates?.gold.map((s: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-yellow-500/5 transition-colors">
                                                <td className="p-4 text-[var(--text-main)] normal-case tracking-normal font-semibold">{s.name}</td>
                                                <td className="p-4 font-black text-yellow-600">{s.price24k ? formatPrice(s.price24k) : (s.price ? formatPrice(s.price) : 'N/A')}</td>
                                                <td className="p-4 opacity-70 text-[10px]">{s.type}</td>
                                                <td className="p-4 text-right">
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] border ${s.status === 'Success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Highlight Row for Highest Gold */}
                                        {(() => {
                                            const validGold = detailedRates?.gold.filter((s: any) => (s.price24k || s.price) > 0) || [];
                                            if (validGold.length === 0) return null;
                                            const highestGold = [...validGold].sort((a: any, b: any) => (b.price24k || b.price || 0) - (a.price24k || a.price || 0))[0];
                                            return (
                                                <tr className="bg-yellow-500/10 border-t-2 border-yellow-500/30">
                                                    <td className="p-4 text-yellow-700 font-black">🔥 Highest (Gold): {highestGold.name}</td>
                                                    <td className="p-4 text-yellow-700 font-black text-lg">{formatPrice(highestGold.price24k || highestGold.price)}</td>
                                                    <td className="p-4 text-yellow-700 font-bold opacity-70 text-[10px]">Peak Source</td>
                                                    <td className="p-4 text-right">
                                                        <span className="px-2 py-0.5 rounded-full text-[8px] bg-yellow-500 text-white font-black whitespace-nowrap">TOP RATE</span>
                                                    </td>
                                                </tr>
                                            );
                                        })()}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Silver Sources */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-500 flex items-center gap-2">
                        <Gavel className="w-5 h-5" />
                        Silver Sources (Chandi / Tola)
                    </h3>
                    <div className="bg-[var(--bg-card)] border border-slate-400/20 rounded-2xl overflow-x-auto shadow-xl">
                        <table className="w-full text-left text-xs uppercase font-bold tracking-widest min-w-[500px]">
                            <thead className="bg-[var(--bg-input)] text-[var(--text-muted)]">
                                <tr>
                                    <th className="p-4">Source</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {detailedLoading ? (
                                    <tr><td colSpan={4} className="p-8 text-center opacity-50">Fetching Rates...</td></tr>
                                ) : (
                                    <>
                                        {detailedRates?.silver.map((s: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                                                <td className="p-4 text-[var(--text-main)] normal-case tracking-normal font-semibold">{s.name}</td>
                                                <td className="p-4 font-black text-slate-600">{s.price ? formatPrice(s.price) : 'N/A'}</td>
                                                <td className="p-4 opacity-70 text-[10px]">{s.type}</td>
                                                <td className="p-4 text-right">
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] border ${s.status === 'Success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Highlight Row for Highest Silver */}
                                        {(() => {
                                            const validSilver = detailedRates?.silver.filter((s: any) => s.price > 0) || [];
                                            if (validSilver.length === 0) return null;
                                            const highestSilver = [...validSilver].sort((a: any, b: any) => b.price - a.price)[0];
                                            return (
                                                <tr className="bg-slate-500/10 border-t-2 border-slate-500/30">
                                                    <td className="p-4 text-slate-700 font-black">⚡ Highest (Silver): {highestSilver.name}</td>
                                                    <td className="p-4 text-slate-700 font-black text-lg">{formatPrice(highestSilver.price)}</td>
                                                    <td className="p-4 text-slate-700 font-bold opacity-70 text-[10px]">Peak Source</td>
                                                    <td className="p-4 text-right">
                                                        <span className="px-2 py-0.5 rounded-full text-[8px] bg-slate-500 text-white font-black whitespace-nowrap">TOP RATE</span>
                                                    </td>
                                                </tr>
                                            );
                                        })()}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocalSourcesTab;
