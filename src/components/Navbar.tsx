import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { Store, User, Palette, Menu, X, ShoppingCart, LogOut } from 'lucide-react';
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <nav className="bg-[var(--bg-card)] border-b border-[var(--border)] sticky top-0 z-[100] backdrop-blur-md w-full">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Section: Logo & Mobile Menu Toggle */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-lg transition-all"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <Link to={
                            user?.role === 'SUPER_ADMIN' ? "/super-admin/dashboard" :
                                user?.role === 'ADMIN' ? "/admin/dashboard" :
                                    "/user/dashboard"
                        } className="flex items-center gap-1.5 sm:gap-2 text-[var(--primary)] font-bold text-lg sm:text-xl hover:opacity-80 transition-opacity shrink-0">
                            <Store className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="truncate max-w-[100px] sm:max-w-none">MyShop</span>
                        </Link>

                        {/* Navigation Links - Desktop */}
                        <div className="hidden md:flex items-center gap-6">
                            {user?.role === 'SUPER_ADMIN' ? (
                                <Link
                                    to="/super-admin/dashboard"
                                    className="text-sm font-bold uppercase tracking-widest text-[var(--primary)] hover:opacity-80 transition-opacity"
                                >
                                    Command Center
                                </Link>
                            ) : user?.role === 'ADMIN' ? (
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
                                    <Link
                                        to="/user/dashboard?tab=policy"
                                        className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        Policy
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Section: Utilities & User Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Utilities Group */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            {/* Currency Toggle */}
                            <button
                                onClick={() => setCurrency(currency === 'PKR' ? 'USD' : 'PKR')}
                                className="px-2 sm:px-3 py-1 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-[10px] sm:text-xs font-bold text-[var(--primary)] transition-all min-w-[40px] sm:min-w-[50px]"
                                title="Switch Currency"
                            >
                                {currency}
                            </button>

                            {/* Theme Picker */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowThemes(!showThemes)}
                                    className="p-1.5 sm:p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors rounded-full hover:bg-[var(--bg-input)]"
                                    title="Switch Theme"
                                >
                                    <Palette className="w-4 h-4 sm:w-5 h-5" />
                                </button>
                                {showThemes && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-2xl p-2 z-[110] md:fixed md:top-14 md:right-auto md:translate-x-[-150px]">
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
                            {user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && (
                                <Link
                                    to="/cart"
                                    className="relative p-1.5 sm:p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-full transition-all"
                                >
                                    <ShoppingCart className="w-4 h-4 sm:w-5 h-5" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 bg-[var(--primary)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-[var(--bg-card)]">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>

                        {/* Separator - Hidden on mobile */}
                        <div className="h-6 w-px bg-[var(--border)] hidden md:block"></div>

                        {/* User Profile & Logout - Desktop Only */}
                        <div className="hidden md:flex items-center gap-3 pl-2">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 group"
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

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-card)] animate-in slide-in-from-top duration-300">
                    <div className="px-4 py-6 space-y-6">
                        {/* Mobile Nav Links */}
                        <div className="flex flex-col gap-4">
                            {user?.role === 'SUPER_ADMIN' ? (
                                <Link
                                    to="/super-admin/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-lg font-bold uppercase tracking-widest text-[var(--primary)]"
                                >
                                    Command Center
                                </Link>
                            ) : user?.role === 'ADMIN' ? (
                                <Link
                                    to="/admin/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-lg font-bold uppercase tracking-widest text-[var(--primary)]"
                                >
                                    Admin Panel
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/user/dashboard?tab=shop"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-lg font-bold uppercase tracking-widest text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        Shop
                                    </Link>
                                    <Link
                                        to="/user/dashboard?tab=orders"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-lg font-bold uppercase tracking-widest text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        My Orders
                                    </Link>
                                    <Link
                                        to="/contact"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-lg font-bold uppercase tracking-widest text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        Contact
                                    </Link>
                                    <Link
                                        to="/user/dashboard?tab=policy"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-lg font-bold uppercase tracking-widest text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        Policy
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile User Section */}
                        <div className="pt-6 border-t border-[var(--border)]">
                            <Link
                                to="/profile"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-4 p-4 bg-[var(--bg-input)] rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] transition-all active:scale-[0.98]"
                            >
                                <div className="w-12 h-12 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[var(--primary)] border border-[var(--border)] shadow-sm">
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-lg text-[var(--text-main)]">{user?.name}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold">Account Settings</p>
                                        <span className="w-1 h-1 bg-[var(--text-muted)] rounded-full opacity-30"></span>
                                        <p className="text-[10px] text-[var(--primary)] font-black uppercase">{user?.role}</p>
                                    </div>
                                </div>
                            </Link>

                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="w-full mt-4 flex items-center justify-center gap-2 p-4 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl font-bold uppercase tracking-widest text-xs border border-red-500/10 hover:border-red-500/20 transition-all active:scale-[0.98]"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out safely
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
