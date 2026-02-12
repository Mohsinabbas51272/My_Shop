import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', data);
            const user = response.data.user;
            const token = response.data.access_token;
            localStorage.setItem('token', token);
            setAuth(user, token);

            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            let displayMessage = 'Failed to login';
            const responseMessage = err.response?.data?.message;

            if (typeof responseMessage === 'string') {
                displayMessage = responseMessage;
            } else if (Array.isArray(responseMessage)) {
                displayMessage = responseMessage.join(', ');
            } else if (typeof responseMessage === 'object' && responseMessage !== null) {
                displayMessage = (responseMessage as any).message || JSON.stringify(responseMessage);
            }

            setError(displayMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-main)] p-4 overflow-hidden">
            <div className="w-full max-w-[360px] bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border)] p-5 sm:p-8 rounded-[2rem] shadow-2xl flex flex-col justify-center my-auto transition-all duration-500">
                <div className="flex flex-col items-center mb-5 sm:mb-8">
                    <div className="flex items-center justify-center mb-3 sm:mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[var(--primary)] blur-2xl opacity-20 rounded-full animate-pulse" />
                            <img src="/logo_az.png?v=2" alt="Alamgir Jewellers" className="w-20 h-20 sm:w-24 sm:h-24 object-cover relative z-10 rounded-full shadow-2xl border border-[var(--primary)]/20" />
                        </div>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-main)] text-center leading-tight">Welcome Back</h1>
                    <p className="text-[var(--text-muted)] mt-1.5 text-center text-[10px] sm:text-xs font-medium opacity-70">
                        Sign in to explore our exquisite collection
                    </p>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[11px] sm:text-xs">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1" htmlFor="email">
                            Email Address
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50">
                                <Mail className="w-4 h-4" />
                            </span>
                            <input
                                {...register('email')}
                                disabled={loading}
                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all disabled:opacity-50"
                                placeholder="name@example.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-[10px] text-red-500 font-medium ml-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50">
                                <Lock className="w-4 h-4" />
                            </span>
                            <input
                                {...register('password')}
                                type="password"
                                disabled={loading}
                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all disabled:opacity-50"
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-[10px] text-red-500 font-medium ml-1">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end pr-1">
                        <Link to="/forgot-password" className="text-[11px] font-bold text-[var(--primary)] hover:underline opacity-80 hover:opacity-100 transition-opacity">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-[var(--accent-glow)] flex items-center justify-center gap-2 group disabled:opacity-50 active:scale-98"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Sign in
                                <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-[var(--primary)] hover:underline font-bold">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}
