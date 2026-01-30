import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';
import Navbar from './Navbar';
import { User, Mail, CreditCard, MapPin, BadgeCheck, Loader2, Save, Phone, X, ShieldAlert, ShieldCheck, AlertOctagon } from 'lucide-react';
import { toast } from '../store/useToastStore';

export default function Profile() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        cnic: user?.cnic || '',
        address: user?.address || '',
        phone: user?.phone || '',
        paymentMethod: user?.paymentMethod || 'Cash on Shop',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/profile');
                const latestUser = response.data;
                updateUser(latestUser);
                setFormData({
                    name: latestUser.name || '',
                    cnic: latestUser.cnic || '',
                    address: latestUser.address || '',
                    phone: latestUser.phone || '',
                    paymentMethod: latestUser.paymentMethod || 'Cash on Shop',
                });
            } catch (err) {
                console.error('Failed to sync profile:', err);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        setLoading(true);
        try {
            const response = await api.patch(`/users/${user.id}`, formData);
            updateUser(response.data);
            toast.success('Profile updated successfully!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
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

                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-xl relative">
                    <div className="p-6 md:p-10 border-b border-[var(--border)] bg-[var(--bg-input)]/30 relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 p-10 opacity-5 -mr-8 -mt-8">
                            <User className="w-40 h-40" />
                        </div>

                        <button
                            onClick={() => {
                                if (user?.role === 'SUPER_ADMIN') navigate('/super-admin/dashboard');
                                else if (user?.role === 'ADMIN') navigate('/admin/dashboard');
                                else navigate('/user/dashboard');
                            }}
                            className="absolute top-6 right-6 p-2.5 bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-red-500 rounded-xl border border-[var(--border)] transition-all active:scale-90 z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                            <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] rounded-3xl flex items-center justify-center shadow-xl shadow-[var(--primary)]/20 shrink-0">
                                <User className="w-12 h-12 text-white" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex flex-col md:flex-row items-center gap-3">
                                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Identity Profile</h1>
                                    {user?.isVerified ? (
                                        <span className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Verified Citizen
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">
                                            <ShieldAlert className="w-3.5 h-3.5" /> Identity Pending
                                        </span>
                                    )}
                                </div>
                                <p className="text-[var(--text-muted)] text-sm font-medium opacity-70 max-w-md mx-auto md:mx-0">Manage your secure identity and transmission preferences to maintain verification status.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                                    <User className="w-3 h-3 text-[var(--primary)]" /> Real Name
                                </label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-4 text-sm font-bold focus:ring-4 focus:ring-[var(--primary)]/5 outline-none transition-all placeholder:opacity-30"
                                    placeholder="Enter your legal name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                                    <Mail className="w-3 h-3 text-[var(--primary)]" /> Digital Mail
                                </label>
                                <div className="relative group">
                                    <input
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full bg-[var(--bg-input)]/50 border border-[var(--border)] rounded-xl p-4 text-sm font-bold opacity-60 cursor-not-allowed outline-none"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <ShieldCheck className="w-4 h-4 text-green-500/50" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                                    <BadgeCheck className="w-3 h-3 text-[var(--primary)]" /> Government ID
                                </label>
                                <input
                                    value={formData.cnic}
                                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-4 text-sm font-bold focus:ring-4 focus:ring-[var(--primary)]/5 outline-none transition-all placeholder:opacity-30"
                                    placeholder="42101-XXXXXXX-X"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                                    <Phone className="w-3 h-3 text-[var(--primary)]" /> Secure Line
                                </label>
                                <input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-4 text-sm font-bold focus:ring-4 focus:ring-[var(--primary)]/5 outline-none transition-all placeholder:opacity-30"
                                    placeholder="+92 3XX XXXXXXX"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                                    <CreditCard className="w-3 h-3 text-[var(--primary)]" /> Preferred Settlement
                                </label>
                                <select
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-4 text-sm font-black appearance-none outline-none focus:ring-4 focus:ring-[var(--primary)]/5 transition-all cursor-pointer"
                                >
                                    <option value="Cash on Shop">Physical Collection (Shop)</option>
                                    <option value="Online">Digital Transmission (Online)</option>
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                                    <MapPin className="w-3 h-3 text-[var(--primary)]" /> Logistics Protocol (Address)
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-[var(--primary)]/5 outline-none h-32 resize-none transition-all placeholder:opacity-30"
                                    placeholder="Your verified delivery location for artifacts..."
                                />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-[var(--border)]/30">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-[var(--primary)]/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {loading ? 'Synchronizing Profile…' : 'Update Identity Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
