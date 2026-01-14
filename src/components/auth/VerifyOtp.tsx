import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';

export default function VerifyOtp() {
    const location = useLocation();
    const email = location.state?.email || '';
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/verify-otp', { email, otp });
            navigate('/reset-password', { state: { email, otp } });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="mb-4">No email provided.</p>
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
                        Verify OTP
                    </h2>
                    <p className="text-neutral-400 mt-2">
                        Enter the 6-digit code sent to {email}
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
                            One-Time Password
                        </label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-10 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors tracking-widest text-lg"
                                placeholder="123456"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify Code'}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => navigate(-1)} className="text-neutral-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors mx-auto">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
