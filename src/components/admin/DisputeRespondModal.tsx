import React from 'react';
import { Gavel, Receipt, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from '../../store/useToastStore';

interface DisputeRespondModalProps {
    selectedDispute: any;
    setSelectedDispute: (dispute: any) => void;
    respondText: string;
    setRespondText: (text: string) => void;
    updateDispute: any;
    getImageUrl: (url: string) => string;
}

const DisputeRespondModal: React.FC<DisputeRespondModalProps> = ({
    selectedDispute,
    setSelectedDispute,
    respondText,
    setRespondText,
    updateDispute,
    getImageUrl,
}) => {
    if (!selectedDispute) return null;
    const dispute = selectedDispute;
    const onClose = () => setSelectedDispute(null);
    const isPending = updateDispute.isPending;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[var(--bg-main)]/80 backdrop-blur-sm">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-input)]/50">
                    <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-[var(--primary)]" />
                        Respond to Dispute
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Case #{dispute.id} • Order #{dispute.orderId || dispute.order?.displayId || 'N/A'}
                    </p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Dispute Case</label>
                        <div className="bg-[var(--bg-input)]/50 border border-[var(--border)] rounded-lg p-4 space-y-2">
                            <p className="text-sm font-black text-[var(--text-main)]">{dispute.subject}</p>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                {dispute.message}
                            </p>
                        </div>
                    </div>
                    {dispute.evidence && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Evidence / Proof</label>
                            <a
                                href={getImageUrl(dispute.evidence)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl hover:bg-blue-500/10 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Receipt className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-blue-600 group-hover:underline">View Proof Archive</p>
                                    <p className="text-[10px] text-blue-500 font-medium opacity-70 uppercase tracking-widest">Click to open attachment</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-blue-500 opacity-40 group-hover:opacity-100 transition-opacity mr-2" />
                            </a>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Admin Resolution / Response</label>
                        <textarea
                            value={respondText}
                            onChange={(e) => setRespondText(e.target.value)}
                            placeholder="Enter your official response or resolution details here to notify the user..."
                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/50 outline-none h-32 resize-none font-medium placeholder:opacity-40"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (!respondText.trim()) {
                                    toast.error('Please enter a response');
                                    return;
                                }
                                updateDispute.mutate({
                                    id: dispute.id,
                                    response: respondText
                                });
                            }}
                            disabled={isPending}
                            className="flex-1 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Resolve Dispute
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-muted)] font-bold rounded-lg transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisputeRespondModal;
