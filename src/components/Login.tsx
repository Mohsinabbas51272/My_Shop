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
            setAuth(user, response.data.access_token);

            if (user.role === 'SUPER_ADMIN') {
                navigate('/super-admin/dashboard');
            } else if (user.role === 'ADMIN') {
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
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-main)] p-4">
            <div className="w-full max-w-md bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border)] p-8 rounded-2xl shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[var(--accent-glow)]">
                        <LogIn className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">Welcome back</h1>
                    <p className="text-[var(--text-muted)] mt-2 text-center text-sm">
                        Enter your credentials to access your account
                    </p>
                </div>

                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5" htmlFor="email">
                            Email Address
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50">
                                <Mail className="w-4 h-4" />
                            </span>
                            <input
                                {...register('email')}
                                disabled={loading}
                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg py-2.5 pl-10 pr-4 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all disabled:opacity-50"
                                placeholder="name@example.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5" htmlFor="password">
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
                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg py-2.5 pl-10 pr-4 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all disabled:opacity-50"
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm font-medium text-[var(--primary)] hover:underline opacity-80 hover:opacity-100 transition-opacity">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-[var(--accent-glow)] flex items-center justify-center gap-2 group disabled:opacity-50"
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

                <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-[var(--primary)] hover:underline font-medium">
                        Create an account
                    </Link>
                </p>


            </div>
        </div>
    );
}
