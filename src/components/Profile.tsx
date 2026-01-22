import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';
import Navbar from './Navbar';
import { User, Mail, CreditCard, MapPin, BadgeCheck, Loader2, Save, Phone, X, ShieldAlert, ShieldCheck, AlertOctagon } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        cnic: user?.cnic || '',
        address: user?.address || '',
        phone: user?.phone || '',
        paymentMethod: user?.paymentMethod || 'Cash on Shop',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        setLoading(true);
        setMessage(null);
        try {
            const response = await api.patch(`/users/${user.id}`, formData);
            updateUser(response.data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-['Outfit']">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 py-12">
                {user?.isBlocked && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/50 p-4 rounded-2xl flex items-center gap-4 text-red-500 animate-pulse">
                        <AlertOctagon className="w-8 h-8 shrink-0" />
                        <div>
                            <h3 className="font-bold">Account Blocked</h3>
                            <p className="text-sm">Your account has been blocked due to policy violations. Please contact support.</p>
                        </div>
                    </div>
                )}

                {user?.isFrozen && (
                    <div className="mb-6 bg-orange-500/20 border border-orange-500/50 p-4 rounded-2xl flex items-center gap-4 text-orange-500">
                        <ShieldAlert className="w-8 h-8 shrink-0" />
                        <div>
                            <h3 className="font-bold">Account Frozen</h3>
                            <p className="text-sm">Your financial activities are temporarily frozen. Withdrawals and new orders are restricted.</p>
                        </div>
                    </div>
                )}

                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
                    <div className="p-8 border-b border-[var(--border)] bg-[var(--bg-input)]/30 relative">
                        <button
                            onClick={() => {
                                if (user?.role === 'SUPER_ADMIN') navigate('/super-admin/dashboard');
                                else if (user?.role === 'ADMIN') navigate('/admin/dashboard');
                                else navigate('/user/dashboard');
                            }}
                            className="absolute top-6 right-6 p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--bg-card)] rounded-full transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]">
                                <User className="w-10 h-10 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold">Account Settings</h1>
                                    {user?.isVerified ? (
                                        <span className="flex items-center gap-1 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                                            <ShieldCheck className="w-3 h-3" /> Verified
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">
                                            <ShieldAlert className="w-3 h-3" /> Pending Verification
                                        </span>
                                    )}
                                </div>
                                <p className="text-[var(--text-muted)] text-sm mt-1">Manage your identity and preferences to stay verified.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {message && (
                            <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'success'
                                ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                : 'bg-red-500/10 border-red-500/20 text-red-500'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                    <User className="w-3 h-3" /> Full Name
                                </label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/50 outline-none"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                    <Mail className="w-3 h-3" /> Email Address
                                </label>
                                <input
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full bg-[var(--bg-input)]/50 border border-[var(--border)] rounded-xl p-3 text-sm opacity-60 cursor-not-allowed outline-none"
                                />
                                <p className="text-[10px] text-[var(--text-muted)]">Email cannot be changed.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                    <BadgeCheck className="w-3 h-3" /> CNIC Number
                                </label>
                                <input
                                    value={formData.cnic}
                                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/50 outline-none"
                                    placeholder="42101-XXXXXXX-X"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                    <Phone className="w-3 h-3" /> Contact Number
                                </label>
                                <input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/50 outline-none"
                                    placeholder="+92 3XX XXXXXXX"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                    <CreditCard className="w-3 h-3" /> Payment Method
                                </label>
                                <select
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/50 outline-none cursor-pointer"
                                >
                                    <option value="Cash on Shop">Cash on Shop</option>
                                    <option value="Online">Online</option>
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                    <MapPin className="w-3 h-3" /> Delivery Address
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/50 outline-none h-32 resize-none"
                                    placeholder="Your complete delivery address"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-[var(--border)]">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[var(--accent-glow)] flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Profile Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
