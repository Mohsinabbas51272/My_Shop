import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import { toast } from '../../store/useToastStore';

export default function ResetPassword() {
    const location = useLocation();
    const email = location.state?.email || '';
    const otp = location.state?.otp || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            toast.success('Password reset successfully! Please login.');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!email || !otp) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="mb-4">Invalid session. Please start over.</p>
                    <Link to="/forgot-password" className="text-violet-400 hover:text-violet-300">Go back</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
            <div className="bg-neutral-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-neutral-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                        Reset Password
                    </h2>
                    <p className="text-neutral-400 mt-2">
                        Create a new secure password
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-10 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-10 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
