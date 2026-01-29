import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    cnic: z.string().min(13, 'CNIC must be at least 13 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    role: z.enum(['USER', 'ADMIN']),
    paymentMethod: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,

        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'USER',
            paymentMethod: 'Cash on Shop'
        }
    });



    const onSubmit = async (data: RegisterFormValues) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/register', data);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-main)] p-4">
            <div className="w-full max-w-md bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border)] p-8 rounded-2xl shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[var(--accent-glow)]">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">Join MyShop</h1>
                    <p className="text-[var(--text-muted)] mt-2 text-center text-sm">
                        Create an account to start shopping
                    </p>
                </div>

                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                        {error}
                    </div>
                )}



                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5" htmlFor="name">
                            Full Name
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50">
                                <User className="w-4 h-4" />
                            </span>
                            <input
                                {...register('name')}
                                disabled={loading}
                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg py-2.5 pl-10 pr-4 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all disabled:opacity-50"
                                placeholder="John Doe"
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>
                        )}
                    </div>

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

                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                                CNIC Number
                            </label>
                            <input
                                {...register('cnic')}
                                disabled={loading}
                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg py-2.5 px-4 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all disabled:opacity-50"
                                placeholder="42101-XXXXXXX-X"
                            />
                            {errors.cnic && (
                                <p className="mt-1 text-xs text-red-500 font-medium">{errors.cnic.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                                Delivery Address
                            </label>
                            <textarea
                                {...register('address')}
                                disabled={loading}
                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg py-2.5 px-4 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all disabled:opacity-50 h-20"
                                placeholder="Your complete address"
                            />
                            {errors.address && (
                                <p className="mt-1 text-xs text-red-500 font-medium">{errors.address.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                                Contact Number
                            </label>
                            <input
                                {...register('phone')}
                                disabled={loading}
                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg py-2.5 px-4 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all disabled:opacity-50"
                                placeholder="+92 3XX XXXXXXX"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                                Preferred Payment Method
                            </label>
                            <select
                                {...register('paymentMethod')}
                                disabled={loading}
                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg py-2.5 px-4 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <option value="Cash on Shop">Cash on Shop</option>
                                <option value="Online">Online</option>
                            </select>
                        </div>
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
                                Create account
                                <UserPlus className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[var(--primary)] hover:underline font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
