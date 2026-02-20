import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';

interface QueriesSubTabProps {
    complaints: any[];
    complaintsLoading: boolean;
    setSelectedComplaint: (complaint: any) => void;
    setRespondText: (text: string) => void;
    deleteComplaint: any;
}

const QueriesSubTab: React.FC<QueriesSubTabProps> = ({
    complaints,
    complaintsLoading,
    setSelectedComplaint,
    setRespondText,
    deleteComplaint,
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
                Customer Queries
            </h2>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-x-auto shadow-xl">
                <table className="w-full text-left text-sm min-w-[800px]">
                    <thead className="bg-[var(--bg-input)] text-[var(--text-muted)] font-black uppercase tracking-widest text-[10px]">
                        <tr>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Subject/Order</th>
                            <th className="p-4">Message</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]/50">
                        {complaintsLoading ? (
                            <tr><td colSpan={5} className="p-12 text-center opacity-50 font-bold uppercase tracking-widest">Accessing Queries...</td></tr>
                        ) : (complaints || []).map((c: any) => (
                            <tr key={c.id} className="hover:bg-[var(--bg-input)]/30 transition-colors group">
                                <td className="p-4 font-bold text-[var(--text-main)]">{c.user?.name || 'Guest'}</td>
                                <td className="p-4 text-xs">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[var(--primary)]">#{c.orderId || 'General'}</span>
                                        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">{new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-xs text-[var(--text-muted)] max-w-md truncate">{c.message}</td>
                                 <td className="p-4">
                                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${c.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                        {c.status}
                                    </span>
                                </td>
                                 <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {c.status !== 'Resolved' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedComplaint(c);
                                                    setRespondText('');
                                                }}
                                                className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                                            >
                                                Respond
                                            </button>
                                        )}
                                        <button
                                            onClick={() => confirm('Delete this query permanently?') && deleteComplaint.mutate(c.id)}
                                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                            title="Delete Query"
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

export default QueriesSubTab;
