import React from 'react';
import { History, Trash2, ShieldCheck, User, ShoppingBag, Terminal } from 'lucide-react';

interface AuditLogsSubTabProps {
    logs: any[];
    logsLoading: boolean;
    deleteAllLogs: any;
    formatDate: (date: string) => string;
}

const AuditLogsSubTab: React.FC<AuditLogsSubTabProps> = ({
    logs,
    logsLoading,
    deleteAllLogs,
    formatDate,
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                    <History className="w-5 h-5 text-[var(--primary)]" />
                    System Audit Logs
                </h2>
                <button
                    onClick={() => confirm('Are you sure you want to clear all system logs?') && deleteAllLogs.mutate()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/10 active:scale-95 border border-red-500/20"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All Logs
                </button>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--bg-input)] text-[var(--text-muted)] font-black uppercase tracking-widest text-[10px]">
                            <tr>
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">Entity type</th>
                                <th className="p-4">Action Event</th>
                                <th className="p-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]/50">
                            {logsLoading ? (
                                <tr><td colSpan={4} className="p-12 text-center opacity-50 font-bold uppercase tracking-widest italic">Indexing Logs...</td></tr>
                            ) : (logs || []).length === 0 ? (
                                <tr><td colSpan={4} className="p-12 text-center opacity-30 font-bold uppercase tracking-widest italic">No System Activity Recorded</td></tr>
                            ) : (logs || []).map((l: any) => (
                                <tr key={l.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                    <td className="p-4 font-mono text-[10px] text-[var(--text-muted)] font-bold">
                                        {formatDate(l.createdAt)}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {l.entityType === 'Order' ? (
                                                <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                                            ) : l.entityType === 'User' ? (
                                                <User className="w-3.5 h-3.5 text-purple-500" />
                                            ) : (
                                                <Terminal className="w-3.5 h-3.5 text-[var(--primary)]" />
                                            )}
                                            <span className="font-black text-[10px] uppercase tracking-widest text-[var(--text-main)]">{l.entityType}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-[var(--text-main)] text-xs">{l.action}</td>
                                    <td className="p-4">
                                        <span className="text-[10px] font-bold text-[var(--text-muted)] leading-relaxed">{l.details}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogsSubTab;
