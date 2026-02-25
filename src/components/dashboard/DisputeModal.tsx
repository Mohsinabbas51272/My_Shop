import React from 'react';
import { Gavel, Loader2, Check, Plus, X } from 'lucide-react';
import { IMAGE_BASE_URL } from '../../lib/api';
import { motion } from 'framer-motion';

interface DisputeModalProps {
    disputingOrder: any;
    disputeData: any;
    setDisputeData: (data: any) => void;
    handleEvidenceUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadingEvidence: boolean;
    disputeOrderMutation: any;
    onClose: () => void;
}

const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/400';
    if (url.startsWith('http')) return url;
    return `${IMAGE_BASE_URL}${url}`;
};

const DisputeModal: React.FC<DisputeModalProps> = ({
    disputingOrder,
    disputeData,
    setDisputeData,
    handleEvidenceUpload,
    uploadingEvidence,
    disputeOrderMutation,
    onClose
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[var(--bg-main)]/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
                className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-input)]/50">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-yellow-500" />
                        Dispute Order #{disputingOrder.displayId || disputingOrder.id}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-widest">Submit this to the Super Admin for investigation</p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Subject</label>
                        <input
                            value={disputeData.subject}
                            onChange={(e) => setDisputeData({ ...disputeData, subject: e.target.value })}
                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/40 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Details of Issue</label>
                        <textarea
                            value={disputeData.message}
                            onChange={(e) => setDisputeData({ ...disputeData, message: e.target.value })}
                            placeholder="Explain the problem in detail (e.g., payment sent but not confirmed, wrong items received, etc.)"
                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/40 outline-none h-32 resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Evidence (Optional)</label>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center justify-center px-4 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--bg-input)]/80 transition-all group w-full">
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleEvidenceUpload}
                                    accept="image/*,application/pdf"
                                />
                                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
                                    {uploadingEvidence ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : disputeData.evidence ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                    <span className="font-bold">
                                        {uploadingEvidence ? 'Uploading...' : disputeData.evidence ? 'Evidence Attached' : 'Upload Proof'}
                                    </span>
                                </div>
                            </label>
                            {disputeData.evidence && (
                                <div className="w-12 h-12 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] overflow-hidden shrink-0 relative group">
                                    <img
                                        src={getImageUrl(disputeData.evidence)}
                                        alt="Evidence"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => setDisputeData((prev: any) => ({ ...prev, evidence: '' }))}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => disputeOrderMutation.mutate({
                                orderId: disputingOrder.id,
                                ...disputeData
                            })}
                            disabled={disputeOrderMutation.isPending || !disputeData.message.trim()}
                            className="flex-1 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl text-sm hover:bg-[var(--primary-hover)] transition-all shadow-lg shadow-[var(--accent-glow)] disabled:opacity-50"
                        >
                            {disputeOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                            Submit Case
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-main)] font-bold rounded-xl text-sm hover:opacity-80 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DisputeModal;
