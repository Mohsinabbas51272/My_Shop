import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Loader2, ShieldCheck, FileText, CheckCircle } from 'lucide-react';
import { toast } from '../store/useToastStore';

interface PolicyModalProps {
    onAccepted: () => void;
    onClose: () => void;
}

export default function PolicyModal({ onAccepted, onClose }: PolicyModalProps) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [policyVersion, setPolicyVersion] = useState('');

    useEffect(() => {
        api.get('/policies/latest')
            .then(res => {
                setPolicyVersion(res.data.version);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleAccept = async () => {
        if (!agreed) return;
        setSubmitting(true);
        try {
            await api.post('/policies/accept');
            onAccepted();
        } catch (err) {
            toast.error('Failed to accept policy. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-['Outfit']">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-[var(--border)] bg-[var(--bg-input)]/30 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Policy & Terms Update</h2>
                        <p className="text-[var(--text-muted)] text-sm">Version {policyVersion} • Effective immediately</p>
                    </div>
                </div>

                <div className="p-8 max-h-[50vh] overflow-y-auto space-y-4 text-sm text-[var(--text-muted)] leading-relaxed">
                    <div className="flex gap-3">
                        <div className="mt-1"><CheckCircle className="w-4 h-4 text-green-500" /></div>
                        <p><span className="font-bold text-[var(--text-main)]">Fair Price Guarantee:</span> All prices are final and include basic platform fees. Users agree not to engage in off-platform negotiations.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="mt-1"><CheckCircle className="w-4 h-4 text-green-500" /></div>
                        <p><span className="font-bold text-[var(--text-main)]">Dispute Resolution:</span> Any complaints must be filed within 48 hours of delivery. Super Admin decision is final and binding.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="mt-1"><CheckCircle className="w-4 h-4 text-green-500" /></div>
                        <p><span className="font-bold text-[var(--text-main)]">Gold Return Policy:</span> On return (Wapsi), a deduction (Kat) of <span className="text-[var(--primary)] font-black">3 Masha per 1 Tola</span> will be applied based on the current market gold rate.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="mt-1"><CheckCircle className="w-4 h-4 text-green-500" /></div>
                        <p><span className="font-bold text-[var(--text-main)]">Legal Compliance:</span> By proceeding, you verify that your provided CNIC and identity details are accurate. Fraudulent activity will lead to legal action (FIR).</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="mt-1"><CheckCircle className="w-4 h-4 text-green-500" /></div>
                        <p><span className="font-bold text-[var(--text-main)]">Anti-Fraud Measures:</span> The platform reserves the right to freeze accounts or block users suspected of violating these terms.</p>
                    </div>

                    <div className="mt-8 p-4 bg-[var(--bg-input)]/50 rounded-xl border border-[var(--border)]">
                        <p className="text-xs italic italic">Please read the full terms of service available on our main website. By checking the box below, you agree to comply with all platform rules and security protocols.</p>
                    </div>
                </div>

                <div className="p-8 border-t border-[var(--border)] bg-[var(--bg-input)]/20">
                    <label className="flex items-center gap-3 cursor-pointer group mb-6">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="peer hidden"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <div className="w-6 h-6 border-2 border-[var(--border)] rounded-md peer-checked:bg-[var(--primary)] peer-checked:border-[var(--primary)] transition-all"></div>
                            <CheckCircle className="absolute inset-0 w-6 h-6 text-white scale-0 peer-checked:scale-100 transition-all p-1" />
                        </div>
                        <span className="text-sm font-medium group-hover:text-[var(--text-main)] transition-colors">I have read and agree to the platform's security and legal policies.</span>
                    </label>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border border-[var(--border)] hover:bg-[var(--bg-card)] rounded-xl font-bold transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={!agreed || submitting}
                            onClick={handleAccept}
                            className="flex-[2] bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[var(--accent-glow)] flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><FileText className="w-4 h-4" /> Accept & Proceed</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
