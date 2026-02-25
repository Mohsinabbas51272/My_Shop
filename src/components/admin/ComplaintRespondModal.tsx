import React from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from '../../store/useToastStore';

interface ComplaintRespondModalProps {
    selectedComplaint: any;
    setSelectedComplaint: (complaint: any) => void;
    respondText: string;
    setRespondText: (text: string) => void;
    respondToComplaintMutation: any;
}

const ComplaintRespondModal: React.FC<ComplaintRespondModalProps> = ({
    selectedComplaint,
    setSelectedComplaint,
    respondText,
    setRespondText,
    respondToComplaintMutation,
}) => {
    if (!selectedComplaint) return null;
    const complaint = selectedComplaint;
    const onClose = () => setSelectedComplaint(null);
    const isPending = respondToComplaintMutation.isPending;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[var(--bg-main)]/80 backdrop-blur-sm">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
                <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-input)]/50">
                    <h3 className="text-xl font-bold text-[var(--text-main)]">Respond to Query</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Order #{complaint.orderId || 'N/A'}</p>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Customer Message</label>
                        <p className="bg-[var(--bg-input)]/50 border border-[var(--border)] rounded-lg p-4 text-sm text-[var(--text-main)]">
                            {complaint.message}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Your Response</label>
                        <textarea
                            value={respondText}
                            onChange={(e) => setRespondText(e.target.value)}
                            placeholder="Type your response here... We'll notify the customer that their issue is being worked on."
                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/50 outline-none h-32 resize-none"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <button
                            onClick={() => {
                                if (!respondText.trim()) {
                                    toast.error('Please enter a response');
                                    return;
                                }
                                respondToComplaintMutation.mutate({
                                    id: complaint.id,
                                    response: respondText
                                });
                            }}
                            disabled={isPending}
                            className="w-full sm:flex-1 px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Send Response
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full sm:flex-1 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-muted)] font-bold rounded-xl transition-all order-2 sm:order-1"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintRespondModal;
