import React from 'react';
import { Gavel, Trash2 } from 'lucide-react';

interface DisputesSubTabProps {
    disputes: any[];
    disputesLoading: boolean;
    setSelectedDispute: (dispute: any) => void;
    setRespondText: (text: string) => void;
    deleteDispute: any;
}

const DisputesSubTab: React.FC<DisputesSubTabProps> = ({
    disputes,
    disputesLoading,
    setSelectedDispute,
    setRespondText,
    deleteDispute,
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                <Gavel className="w-5 h-5 text-[var(--primary)]" />
                Case Disputes
            </h2>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-x-auto shadow-xl">
                <table className="w-full text-left text-sm min-w-[800px]">
                    <thead className="bg-[var(--bg-input)] text-[var(--text-muted)] font-black uppercase tracking-widest text-[10px]">
                        <tr>
                            <th className="p-4">Case ID</th>
                            <th className="p-4">Defendant Name</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]/50">
                        {disputesLoading ? (
                            <tr><td colSpan={4} className="p-12 text-center opacity-50 font-bold uppercase tracking-widest">Accessing Disputes...</td></tr>
                        ) : (disputes || []).map((d: any) => (
                            <tr key={d.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[var(--text-main)] text-sm">#{d.id}</span>
                                        <span className="text-[10px] text-[var(--text-muted)] font-medium">Order #{d.orderId}</span>
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-[var(--text-main)]">{d.user?.name || 'Citizen'}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${d.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                        {d.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedDispute(d);
                                                setRespondText('');
                                            }}
                                            className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                                        >
                                            View Case
                                        </button>
                                        <button
                                            onClick={() => confirm('Delete dispute record permanently?') && deleteDispute.mutate(d.id)}
                                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DisputesSubTab;
