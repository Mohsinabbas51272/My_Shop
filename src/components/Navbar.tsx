import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, LogOut, Store, User, Palette } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import type { ThemeType } from '../store/useThemeStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const { theme, setTheme } = useThemeStore();
    const { items } = useCartStore();
    const { currency, setCurrency } = useCurrencyStore();
    const navigate = useNavigate();
    const [showThemes, setShowThemes] = useState(false);

    const themes: { id: ThemeType; label: string; color: string }[] = [
        { id: 'midnight', label: 'Midnight', color: '#3b82f6' },
        { id: 'emerald', label: 'Emerald', color: '#10b981' },
        { id: 'sunset', label: 'Sunset', color: '#f59e0b' },
        { id: 'ocean', label: 'Ocean', color: '#06b6d4' },
        { id: 'lavender', label: 'Lavender', color: '#a855f7' },
        { id: 'rosegold', label: 'Rose Gold', color: '#fb7185' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const cartCount = items.reduce((sum: number, item) => sum + item.quantity, 0);

    return (
        <nav className="bg-[var(--bg-card)] border-b border-[var(--border)] sticky top-0 z-[100] backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Section: Logo & Navigation */}
                    <div className="flex items-center gap-8">
                        <Link to={user?.role === 'ADMIN' ? "/admin/dashboard" : "/user/dashboard"} className="flex items-center gap-2 text-[var(--primary)] font-bold text-xl hover:opacity-80 transition-opacity">
                            <Store className="w-6 h-6" />
                            <span>MyShop</span>
                        </Link>

                        {/* Navigation Links - Desktop */}
                        <div className="hidden md:flex items-center gap-6">
                            {user?.role === 'ADMIN' ? (
                                <Link
                                    to="/admin/dashboard"
                                    className="text-sm font-bold uppercase tracking-widest text-[var(--primary)] hover:opacity-80 transition-opacity"
                                >
                                    Admin Panel
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/user/dashboard?tab=shop"
                                        className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        Shop
                                    </Link>
                                    <Link
                                        to="/user/dashboard?tab=orders"
                                        className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        My Orders
                                    </Link>
                                    <Link
                                        to="/contact"
                                        className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        Contact
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Section: Utilities & User Actions */}
                    <div className="flex items-center gap-4">
                        {/* Utilities Group */}
                        <div className="flex items-center gap-2 mr-2">
                            {/* Currency Toggle */}
                            <button
                                onClick={() => setCurrency(currency === 'PKR' ? 'USD' : 'PKR')}
                                className="px-3 py-1 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-xs font-bold text-[var(--primary)] transition-all min-w-[50px]"
                                title="Switch Currency"
                            >
                                {currency}
                            </button>

                            {/* Theme Picker */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowThemes(!showThemes)}
                                    className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors rounded-full hover:bg-[var(--bg-input)]"
                                    title="Switch Theme"
                                >
                                    <Palette className="w-5 h-5" />
                                </button>
                                {showThemes && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-2xl p-2 z-[110]">
                                        <div className="grid grid-cols-3 gap-2">
                                            {themes.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => {
                                                        setTheme(t.id);
                                                        setShowThemes(false);
                                                    }}
                                                    className={`w-full aspect-square rounded-lg border-2 transition-all ${theme === t.id ? 'border-[var(--primary)] scale-110' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                                        }`}
                                                    style={{ backgroundColor: t.color }}
                                                    title={t.label}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cart - Only for customers */}
                            {user?.role !== 'ADMIN' && (
                                <Link
                                    to="/cart"
                                    className="relative p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-full transition-all"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 bg-[var(--primary)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-[var(--bg-card)]">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>

                        {/* Separator */}
                        <div className="h-6 w-px bg-[var(--border)] hidden sm:block"></div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-2">
                            <Link
                                to="/profile"
                                className="hidden sm:flex items-center gap-2 group"
                            >
                                <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--primary)] border border-[var(--border)] group-hover:border-[var(--primary)] transition-all">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="hidden lg:block text-sm">
                                    <p className="font-bold leading-none text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">{user?.name?.split(' ')[0]}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Account</p>
                                </div>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
