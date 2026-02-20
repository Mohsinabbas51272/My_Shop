import React from 'react';
import { ShieldAlert, X, Loader2 } from 'lucide-react';
import { toast } from '../../store/useToastStore';

interface FirRegistryModalProps {
    firModalUser: any;
    setFirModalUser: (user: any) => void;
    firData: { violation: string, details: string };
    setFirData: (data: any) => void;
    registerFIR: any;
}

const FirRegistryModal: React.FC<FirRegistryModalProps> = ({
    firModalUser,
    setFirModalUser,
    firData,
    setFirData,
    registerFIR,
}) => {
    if (!firModalUser) return null;
    const user = firModalUser;
    const onClose = () => setFirModalUser(null);
    const isPending = registerFIR.isPending;

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-[var(--border)] bg-red-500/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-[var(--bg-input)] rounded-xl transition-colors">
                            <X className="w-6 h-6 text-[var(--text-main)]" />
                        </button>
                    </div>
                    <h2 className="text-2xl font-black text-[var(--text-main)]">Register FIR / Legal Action</h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Initiating formal legal proceedings for <span className="text-red-500 font-bold">{user.name}</span>
                    </p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Violation Type</label>
                        <input
                            type="text"
                            value={firData.violation}
                            onChange={(e) => setFirData({ ...firData, violation: e.target.value })}
                            placeholder="e.g. Payment Fraud, Identity Theft, Policy Breach"
                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-bold focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 outline-none transition-all placeholder:opacity-30 text-[var(--text-main)]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Detailed Description</label>
                        <textarea
                            value={firData.details}
                            onChange={(e) => setFirData({ ...firData, details: e.target.value })}
                            placeholder="Provide complete details and evidence references..."
                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-bold focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 outline-none h-32 resize-none transition-all placeholder:opacity-30 text-[var(--text-main)]"
                        />
                    </div>

                    <button
                        onClick={() => {
                            if (!firData.violation || !firData.details) {
                                toast.error('All fields are required');
                                return;
                            }
                            registerFIR.mutate({
                                userId: user.id,
                                violation: firData.violation,
                                details: firData.details
                            });
                        }}
                        disabled={isPending}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
                        Register Legal FIR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FirRegistryModal;
