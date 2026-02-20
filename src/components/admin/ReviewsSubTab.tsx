import React from 'react';
import { Star, CheckCircle, Trash2 } from 'lucide-react';

interface ReviewsSubTabProps {
    adminReviews: any[];
    reviewsLoading: boolean;
    q: string;
    approveReviewMutation: any;
    deleteReviewMutation: any;
}

const ReviewsSubTab: React.FC<ReviewsSubTabProps> = ({
    adminReviews,
    reviewsLoading,
    q,
    approveReviewMutation,
    deleteReviewMutation,
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                <Star className="w-5 h-5 text-[var(--primary)]" />
                Review Moderation
            </h2>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-x-auto shadow-xl">
                <table className="w-full text-left text-sm min-w-[800px]">
                    <thead className="bg-[var(--bg-input)] text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px]">
                        <tr>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Product</th>
                            <th className="p-4">Rating</th>
                            <th className="p-4">Comment</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {reviewsLoading ? (
                            <tr><td colSpan={6} className="p-8 text-center uppercase tracking-widest opacity-50 font-bold">Loading Reviews...</td></tr>
                        ) : (adminReviews || [])
                            .filter((r: any) =>
                                !q ||
                                r.user?.name?.toLowerCase().includes(q.toLowerCase()) ||
                                r.product?.name?.toLowerCase().includes(q.toLowerCase()) ||
                                r.comment?.toLowerCase().includes(q.toLowerCase())
                            )
                            .length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-[var(--text-muted)] font-bold opacity-50 italic">No reviews found.</td></tr>
                            ) : (adminReviews || [])
                                .filter((r: any) =>
                                    !q ||
                                    r.user?.name?.toLowerCase().includes(q.toLowerCase()) ||
                                    r.product?.name?.toLowerCase().includes(q.toLowerCase()) ||
                                    r.comment?.toLowerCase().includes(q.toLowerCase())
                                )
                                .map((r: any) => (
                            <tr key={r.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                <td className="p-4">
                                    <p className="font-bold text-[var(--text-main)]">{r.user?.name}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-mono">{r.user?.email}</p>
                                </td>
                                <td className="p-4">
                                    <p className="font-bold text-[var(--text-main)]">{r.product?.name}</p>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-yellow-500 text-yellow-500' : 'text-[var(--text-muted)] opacity-30'}`} />
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 max-w-sm">
                                    <p className="text-[var(--text-muted)] line-clamp-2 italic text-xs leading-relaxed">"{r.comment}"</p>
                                </td>
                                <td className="p-4">
                                    {r.isApproved ? (
                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-black rounded-full uppercase border border-green-500/20">Live</span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[9px] font-black rounded-full uppercase border border-yellow-500/20">Moderation</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {!r.isApproved && (
                                            <button
                                                onClick={() => approveReviewMutation.mutate(r.id)}
                                                className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all flex items-center gap-1 shadow-lg shadow-green-500/10 active:scale-95"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Approve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => confirm('Delete this review permanently?') && deleteReviewMutation.mutate(r.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Delete Review"
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

export default ReviewsSubTab;
