import React from 'react';
import { MessageSquare, Gavel, Star, History, MessageCircle } from 'lucide-react';
import QueriesSubTab from './QueriesSubTab';
import DisputesSubTab from './DisputesSubTab';
import ReviewsSubTab from './ReviewsSubTab';
import AuditLogsSubTab from './AuditLogsSubTab';
import AdminChat from '../AdminChat';

interface SupportTabProps {
    supportSubTab: 'queries' | 'disputes' | 'chats' | 'reviews' | 'audit';
    setSupportSubTab: (sub: string) => void;
    dashboardCounts: any;
    adminReviews: any[];
    unreadChatCount: any;
    complaints: any[];
    complaintsLoading: boolean;
    setSelectedComplaint: (complaint: any) => void;
    setRespondText: (text: string) => void;
    disputes: any[];
    disputesLoading: boolean;
    setSelectedDispute: (dispute: any) => void;
    deleteDispute: any;
    reviewsLoading: boolean;
    q: string;
    approveReviewMutation: any;
    deleteReviewMutation: any;
    logs: any[];
    logsLoading: boolean;
    deleteAllLogs: any;
    deleteLogMutation: any;
    setViewingFirLog?: (log: any) => void;
    deleteComplaint: any;
}

const SupportTab: React.FC<SupportTabProps> = ({
    supportSubTab,
    setSupportSubTab,
    dashboardCounts,
    adminReviews,
    unreadChatCount,
    complaints,
    complaintsLoading,
    setSelectedComplaint,
    setRespondText,
    disputes,
    disputesLoading,
    setSelectedDispute,
    deleteDispute,
    reviewsLoading,
    q,
    approveReviewMutation,
    deleteReviewMutation,
    logs,
    logsLoading,
    deleteAllLogs,
    deleteLogMutation,
    setViewingFirLog,
    deleteComplaint,
}) => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--bg-card)] p-2 rounded-2xl border border-[var(--border)]/50">
                <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    {[
                        { id: 'queries', name: 'Queries', icon: MessageSquare, count: dashboardCounts?.complaints },
                        { id: 'disputes', name: 'Disputes', icon: Gavel, count: dashboardCounts?.disputes },
                        { id: 'reviews', name: 'Reviews', icon: Star, count: adminReviews?.filter((r: any) => !r.isApproved).length },
                        { id: 'audit', name: 'Logs', icon: History },
                        { id: 'chats', name: 'Live Chat', icon: MessageCircle, count: unreadChatCount?.count }
                    ].map(sub => (
                        <button
                            key={sub.id}
                            onClick={() => setSupportSubTab(sub.id)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${supportSubTab === sub.id
                                ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-main)]'}`}
                        >
                            <sub.icon className="w-4 h-4" />
                            {sub.name}
                            {sub.count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${supportSubTab === sub.id ? 'bg-white text-[var(--primary)]' : 'bg-red-500 text-white'}`}>
                                    {sub.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {supportSubTab === 'queries' && (
                <QueriesSubTab
                    complaints={complaints}
                    complaintsLoading={complaintsLoading}
                    setSelectedComplaint={setSelectedComplaint}
                    setRespondText={setRespondText}
                    deleteComplaint={deleteComplaint}
                />
            )}

            {supportSubTab === 'disputes' && (
                <DisputesSubTab
                    disputes={disputes}
                    disputesLoading={disputesLoading}
                    setSelectedDispute={setSelectedDispute}
                    setRespondText={setRespondText}
                    deleteDispute={deleteDispute}
                />
            )}

            {supportSubTab === 'reviews' && (
                <ReviewsSubTab
                    adminReviews={adminReviews}
                    reviewsLoading={reviewsLoading}
                    q={q}
                    approveReviewMutation={approveReviewMutation}
                    deleteReviewMutation={deleteReviewMutation}
                />
            )}

            {supportSubTab === 'audit' && (
                <AuditLogsSubTab
                    logs={logs}
                    logsLoading={logsLoading}
                    deleteAllLogs={deleteAllLogs}
                    deleteLogMutation={deleteLogMutation}
                    formatDate={(date: any) => new Date(date).toLocaleString()}
                    setViewingFirLog={setViewingFirLog}
                />
            )}

            {supportSubTab === 'chats' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <AdminChat />
                </div>
            )}
        </div>
    );
};

export default SupportTab;
