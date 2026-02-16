import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { User, Palette, Menu, X, ShoppingCart, LogOut, Banknote, Calculator, Scale } from 'lucide-react';
import GoldCalculator from './GoldCalculator';
import { useThemeStore } from '../store/useThemeStore';
import type { ThemeType } from '../store/useThemeStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useState, useEffect } from 'react';
import { useSearchStore } from '../store/useSearchStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useWeightStore } from '../store/useWeightStore';
import { Search, SlidersHorizontal, ChevronDown, Heart } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const { theme, setTheme } = useThemeStore();
    const { items } = useCartStore();
    const { currency, setCurrency } = useCurrencyStore() as any; // Type assertion to bypass strict check if store is partial
    const wishlistItems = useWishlistStore((state) => state.items);
    const wishlistCount = wishlistItems.length;
    const navigate = useNavigate();
    const [isCalcOpen, setIsCalcOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showThemes, setShowThemes] = useState(false);
    const { unit, toggleUnit } = useWeightStore();

    // Destructure search store
    const {
        q, setQ,
        sort, setSort,
        minPrice, setMinPrice,
        maxPrice, setMaxPrice,
        metalCategory, setMetalCategory,
        occasion, setOccasion
    } = useSearchStore();

    // const { data: notices } = useQuery({
    //     queryKey: ['notices-me', user?.id],
    //     queryFn: async () => (await api.get('/users/my-notices')).data,
    //     enabled: !!user?.id,
    //     refetchInterval: 30000, // Every 30s is enough for Navbar
    // });

    // const noticeCount = notices?.length || 0;

    useEffect(() => {
        if (isMenuOpen || isCalcOpen || showSearch || showFilters || showThemes) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen, isCalcOpen, showSearch, showFilters, showThemes]);

    const themes: { id: ThemeType; label: string; color: string }[] = [
        { id: 'light', label: 'Light', color: '#ffffff' },
        { id: 'emerald', label: 'Emerald', color: '#10b981' },
        { id: 'sunset', label: 'Sunset', color: '#f59e0b' },
        { id: 'ocean', label: 'Ocean', color: '#06b6d4' },
        { id: 'rosegold', label: 'Rose Gold', color: '#fb7185' },
        { id: 'system', label: 'System', color: '#64748b' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const cartCount = items.reduce((sum: number, item) => sum + item.quantity, 0);

    return (
        <nav className="bg-[var(--bg-card)]/80 border-b border-[var(--border)] sticky top-0 z-[100] backdrop-blur-md w-full">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Left Section: Logo & Mobile Menu Toggle */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-lg transition-all"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <Link to={
                            user?.role === 'ADMIN' ? "/admin/dashboard" :
                                "/user/dashboard"
                        } className="flex items-center gap-3 text-[var(--primary)] font-bold text-xl hover:opacity-80 transition-opacity shrink-0">
                            <img src="/logo_az.png?v=2" alt="" className="w-9 h-9 object-cover rounded-full border border-[var(--primary)]/30 shadow-lg" />
                            <span className="hidden lg:inline uppercase tracking-tight font-serif whitespace-nowrap pr-1">AZ<span className="text-[var(--text-main)]"> Shop</span></span>
                        </Link>

                        {/* Navigation Links - Desktop */}
                        <div className="hidden md:flex items-center gap-0.5 lg:gap-1 ml-1 lg:ml-2">
                            {user?.role === 'ADMIN' ? (
                                <Link
                                    to="/admin/dashboard"
                                    className="text-[10px] lg:text-sm font-bold uppercase tracking-widest text-[var(--primary)] hover:opacity-80 transition-opacity"
                                >
                                    Admin Panel
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/user/dashboard?tab=shop"
                                        className="px-1 py-1 text-[10px] lg:text-sm font-bold uppercase tracking-widest text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        Shop
                                    </Link>
                                    <Link
                                        to="/user/dashboard?tab=orders"
                                        className="px-1 py-1 text-[10px] lg:text-sm font-bold uppercase tracking-widest text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        Orders
                                    </Link>
                                    <Link
                                        to="/user/dashboard?tab=complaints"
                                        className="hidden lg:block px-1 py-1 text-[10px] lg:text-sm font-bold uppercase tracking-widest text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        Queries
                                    </Link>
                                    <Link
                                        to="/contact"
                                        className="px-1 py-1 text-[10px] lg:text-sm font-bold uppercase tracking-widest text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        Contact
                                    </Link>
                                    <Link
                                        to="/user/dashboard?tab=policy"
                                        className="px-1 py-1 text-[9px] lg:text-sm font-bold uppercase tracking-tighter lg:tracking-widest text-[var(--text-main)] hover:text-[var(--primary)] transition-colors shrink-0"
                                    >
                                        Policy
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Spacer to push utilities to the right */}
                    <div className="flex-1 md:flex-none" />

                    {/* Right Section: Utilities & User Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 ml-1">
                        {/* Utilities Group */}
                        <div className="flex items-center gap-0.5 sm:gap-1">
                            {/* Desktop-only utilities */}
                            <div className="hidden sm:flex items-center gap-0.5 sm:gap-1">
                                {/* Calculator Button (Web Only) */}
                                <button
                                    onClick={() => setIsCalcOpen(true)}
                                    className="p-1.5 sm:p-2 flex items-center justify-center text-[var(--text-muted)] hover:text-yellow-500 hover:bg-[var(--bg-input)] rounded-full transition-all"
                                    title="Gold Calculator"
                                >
                                    <Calculator className="w-4 h-4 sm:w-5 h-5" />
                                </button>

                                {/* Currency Toggle */}
                                <button
                                    onClick={() => setCurrency(currency === 'PKR' ? 'USD' : 'PKR')}
                                    className="p-1.5 sm:p-2 flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-input)] rounded-full transition-all"
                                    title={`Switch Currency (Current: ${currency})`}
                                >
                                    <Banknote className="w-4 h-4 sm:w-5 h-5" />
                                    <span className="text-[10px] font-black hidden lg:inline">{currency}</span>
                                </button>

                                {/* Weight Unit Toggle */}
                                <button
                                    onClick={() => {
                                        toggleUnit();
                                        setShowThemes(false);
                                        setShowFilters(false);
                                        setShowSearch(false);
                                    }}
                                    className={`transition-all duration-300 rounded-full hover:bg-[var(--bg-input)]/50 flex items-center gap-1.5 px-3 py-1.5 sm:py-2 ${unit === 'GRAMS' ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                >
                                    <Scale className={`w-4 h-4 sm:w-5 h-5 ${unit === 'GRAMS' ? 'animate-pulse' : ''}`} />
                                    <span className="text-[10px] font-black hidden lg:inline">{unit === 'GRAMS' ? 'GRAMS' : 'TOLA'}</span>
                                </button>

                                {/* Theme Picker */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowThemes(!showThemes);
                                            setShowFilters(false);
                                            setShowSearch(false);
                                        }}
                                        className={`p-1.5 sm:p-2 transition-all duration-300 rounded-full hover:bg-[var(--bg-input)]/50 ${showThemes ? 'text-[var(--primary)] scale-110' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                        title="Switch Theme"
                                    >
                                        <Palette className="w-4 h-4 sm:w-5 h-5" />
                                    </button>
                                    {showThemes && (
                                        <div className="absolute right-0 mt-2 w-64 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-3 z-[110] animate-in fade-in slide-in-from-top-2">
                                            <div className="grid grid-cols-3 gap-2">
                                                {themes.map((t) => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => {
                                                            setTheme(t.id);
                                                            setShowThemes(false);
                                                        }}
                                                        className={`w-full aspect-square rounded-xl border-2 transition-all ${theme === t.id ? 'border-[var(--primary)] scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                                                            }`}
                                                        style={{ backgroundColor: t.color }}
                                                        title={t.label}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Filters Popover - Desktop Only */}
                            <div className="relative hidden md:block">
                                <button
                                    onClick={() => {
                                        setShowFilters(!showFilters);
                                        setShowThemes(false);
                                        setShowSearch(false);
                                    }}
                                    className={`p-1.5 sm:p-2 transition-all duration-300 rounded-full hover:bg-[var(--bg-input)]/50 ${showFilters ? 'text-[var(--primary)] scale-110' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                    title="Advanced Filters"
                                >
                                    <SlidersHorizontal className="w-4 h-4 sm:w-5 h-5" />
                                </button>
                                {showFilters && (
                                    <div className="fixed md:absolute inset-x-4 md:inset-auto md:-right-2 top-20 md:top-full md:mt-3 w-auto md:w-80 bg-[var(--bg-card)]/95 backdrop-blur-xl border-2 border-[var(--border)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 z-[110] animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between mb-4 mt-1">
                                            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] px-1">Advanced Filters</h4>
                                            <button
                                                onClick={() => setShowFilters(false)}
                                                className="p-1 px-1.5 hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 rounded-lg transition-all"
                                                title="Close Filters"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="space-y-5">
                                            {/* Sort Option */}
                                            <div>
                                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-2">Order By</label>
                                                <div className="relative">
                                                    <select
                                                        value={sort}
                                                        onChange={(e) => setSort(e.target.value as any)}
                                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs font-bold text-white outline-none appearance-none cursor-pointer"
                                                    >
                                                        <option value="newest">Newest First</option>
                                                        <option value="price_asc">Price: Low to High</option>
                                                        <option value="price_desc">Price: High to Low</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* Price Range */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block px-1">Min {currency}</label>
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={minPrice}
                                                        onChange={(e) => setMinPrice(e.target.value)}
                                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none placeholder:text-[var(--text-muted)]/50"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block px-1">Max {currency}</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Any"
                                                        value={maxPrice}
                                                        onChange={(e) => setMaxPrice(e.target.value)}
                                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none placeholder:text-[var(--text-muted)]/50"
                                                    />
                                                </div>
                                            </div>

                                            {/* Occasion Filter */}
                                            <div className="space-y-2 mt-4">
                                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block px-1">Occasion</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { id: 'All', name: 'All' },
                                                        { id: 'Wedding', name: 'Wedding' },
                                                        { id: 'Engagement', name: 'Engagement' },
                                                        { id: 'Gift', name: 'Gifts' },
                                                        { id: 'Party', name: 'Party' },
                                                    ].map((occ) => (
                                                        <button
                                                            key={occ.id}
                                                            onClick={() => setOccasion(occ.id)}
                                                            className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${occasion === occ.id
                                                                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md'
                                                                : 'bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]'
                                                                }`}
                                                        >
                                                            {occ.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Search Popover - Mobile & Tablet Friendly Trigger */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowSearch(!showSearch);
                                        setShowFilters(false);
                                        setShowThemes(false);
                                    }}
                                    className={`p-1.5 sm:p-2 transition-all duration-300 rounded-full hover:bg-[var(--bg-input)]/50 ${showSearch ? 'text-[var(--primary)] scale-110' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                    title="Quick Search"
                                >
                                    <Search className="w-4 h-4 sm:w-5 h-5" />
                                </button>
                                {showSearch && (
                                    <div className="fixed md:absolute inset-x-4 md:inset-auto md:-right-2 top-20 md:top-full md:mt-3 w-auto md:w-80 bg-[var(--bg-card)]/95 backdrop-blur-xl border-2 border-[var(--border)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 z-[110] animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between mb-4 mt-1">
                                            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] px-1">Quick Search</h4>
                                            <button
                                                onClick={() => setShowSearch(false)}
                                                className="p-1 px-1.5 hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 rounded-lg transition-all"
                                                title="Close Search"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder={`Search items...`}
                                                value={q}
                                                onChange={(e) => setQ(e.target.value)}
                                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)]/40 outline-none transition-all text-white placeholder:text-[var(--text-muted)]/50"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Wishlist */}
                            {user?.role !== 'ADMIN' && (
                                <Link
                                    to="/wishlist"
                                    className="relative p-1.5 sm:p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--bg-input)] rounded-full transition-all"
                                    title="Wishlist"
                                >
                                    <Heart className={`w-4 h-4 sm:w-5 h-5 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-[var(--bg-card)]">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {/* Cart */}
                            {user?.role !== 'ADMIN' && (
                                <Link
                                    to="/cart"
                                    className="relative p-1.5 sm:p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-full transition-all"
                                    title="Shopping Bag"
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
                        <div className="h-8 w-px bg-[var(--border)] hidden md:block mx-1"></div>

                        {/* User Profile & Logout - Desktop Only */}
                        <div className="hidden md:flex items-center gap-3 pl-2">
                            <Link
                                to="/profile"
                                className="flex items-center gap-3 group"
                            >
                                <div className="w-9 h-9 rounded-full overflow-hidden border border-[var(--primary)]/30 group-hover:border-[var(--primary)] shadow-lg transition-all">
                                    {user?.image ? (
                                        <img src={user.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary-hover)]/20 flex items-center justify-center">
                                            <User className="w-5 h-5 text-[var(--primary)]" />
                                        </div>
                                    )}
                                </div>
                                <div className="hidden lg:flex flex-col justify-center">
                                    <p className="font-bold leading-[1.1] text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">{user?.name?.split(' ')[0]}</p>
                                    <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-black opacity-60">Account</p>
                                </div>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="p-2.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-[var(--border)] bg-[var(--bg-card)] overflow-hidden"
                    >
                        <div className="px-3 py-3 space-y-3 max-h-[calc(100vh-64px)] overflow-y-auto no-scrollbar">

                            {/* Mobile User Profiles & Quick Actions */}
                            <div className="grid grid-cols-3 gap-1.5 mb-2">
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex flex-col items-center justify-center p-2 bg-[var(--bg-input)] rounded-xl border border-[var(--border)] active:scale-95 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[var(--primary)] mb-1.5 border border-[var(--border)] group-hover:border-[var(--primary)] overflow-hidden">
                                        {user?.image ? (
                                            <img src={user.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                                <User className="w-4 h-4" />
                                        )}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-tight text-[var(--text-main)]">Profile</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        setCurrency(currency === 'PKR' ? 'USD' : 'PKR');
                                    }}
                                    className="flex flex-col items-center justify-center p-2 bg-[var(--bg-input)] rounded-xl border border-[var(--border)] active:scale-95 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[var(--primary)] mb-1.5 border border-[var(--border)]">
                                        <Banknote className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-tight text-[var(--text-main)]">{currency}</span>
                                </button>
                                <button
                                    onClick={() => {
                                        toggleUnit();
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex flex-col items-center justify-center p-2 bg-[var(--bg-input)] rounded-xl border border-[var(--border)] active:scale-95 transition-all text-[var(--text-muted)] hover:text-[var(--primary)]"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 border border-[var(--border)] transition-colors ${unit === 'GRAMS' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--primary)]'}`}>
                                        <Scale className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-tight text-[var(--text-main)]">{unit === 'TMR' ? 'Tola' : 'Grams'}</span>
                                </button>
                            </div>

                            {/* Mobile Nav Links */}
                            <div className="grid grid-cols-2 gap-1.5">
                                {user?.role === 'ADMIN' ? (
                                    <Link
                                        to="/admin/dashboard"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="col-span-2 text-center py-2.5 bg-[var(--primary)] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-lg"
                                    >
                                        Admin Panel
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/user/dashboard?tab=shop"
                                            onClick={() => setIsMenuOpen(false)}
                                                className="py-2.5 bg-[var(--bg-input)] rounded-xl text-center font-bold text-[var(--text-main)] text-[13px] active:scale-95 transition-all border border-[var(--border)]"
                                        >
                                            Shop
                                        </Link>
                                        <Link
                                            to="/user/dashboard?tab=orders"
                                            onClick={() => setIsMenuOpen(false)}
                                                className="py-2.5 bg-[var(--bg-input)] rounded-xl text-center font-bold text-[var(--text-main)] text-[13px] active:scale-95 transition-all border border-[var(--border)]"
                                        >
                                            Orders
                                        </Link>
                                        <Link
                                            to="/user/dashboard?tab=complaints"
                                            onClick={() => setIsMenuOpen(false)}
                                                className="py-2.5 bg-[var(--bg-input)] rounded-xl text-center font-bold text-[var(--text-main)] text-[13px] active:scale-95 transition-all border border-[var(--border)]"
                                        >
                                            Queries
                                        </Link>
                                        <Link
                                            to="/contact"
                                            onClick={() => setIsMenuOpen(false)}
                                                className="py-2.5 bg-[var(--bg-input)] rounded-xl text-center font-bold text-[var(--text-main)] text-[13px] active:scale-95 transition-all border border-[var(--border)]"
                                        >
                                            Contact
                                        </Link>
                                        <Link
                                            to="/user/dashboard?tab=policy"
                                            onClick={() => setIsMenuOpen(false)}
                                                className="py-2.5 bg-[var(--bg-input)] rounded-xl text-center font-bold text-[var(--text-main)] text-[13px] active:scale-95 transition-all border border-[var(--border)]"
                                        >
                                            Policy
                                        </Link>
                                        <Link
                                            to="/wishlist"
                                            onClick={() => setIsMenuOpen(false)}
                                                className="py-2.5 bg-[var(--bg-input)] rounded-xl text-center font-bold text-[var(--text-main)] text-[13px] active:scale-95 transition-all border border-[var(--border)] flex items-center justify-center gap-2"
                                        >
                                                <Heart className="w-3.5 h-3.5 text-red-500" /> Wishlist
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Mobile Theme Selection */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 flex items-center gap-2">
                                    <Palette className="w-3 h-3" /> Appearance
                                </label>
                                <div className="grid grid-cols-6 gap-1.5 bg-[var(--bg-input)] p-1.5 rounded-xl border border-[var(--border)]">
                                    {themes.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`aspect-square rounded-lg border-2 transition-all ${theme === t.id ? 'border-[var(--primary)] scale-105 shadow-md' : 'border-transparent opacity-60'}`}
                                            style={{ backgroundColor: t.color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Search & Filters */}
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] px-1">Search & Filters</h4>
                                </div>

                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => { setMetalCategory('Gold'); setIsMenuOpen(false); }}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border ${metalCategory === 'Gold' ? 'bg-yellow-600 border-yellow-500 text-white' : 'bg-[var(--bg-input)] border-[var(--border)] text-[var(--text-muted)]'}`}
                                    >
                                        Gold
                                    </button>
                                    <button
                                        onClick={() => { setMetalCategory('Silver'); setIsMenuOpen(false); }}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border ${metalCategory === 'Silver' ? 'bg-slate-500 border-slate-400 text-white' : 'bg-[var(--bg-input)] border-[var(--border)] text-[var(--text-muted)]'}`}
                                    >
                                        Silver
                                    </button>
                                </div>



                                <div className="grid grid-cols-2 gap-1.5">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Min Price</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-2 text-[13px] font-black outline-none focus:ring-1 focus:ring-[var(--primary)]/30"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Max Price</label>
                                        <input
                                            type="number"
                                            placeholder="Any"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-2 text-[13px] font-black outline-none focus:ring-1 focus:ring-[var(--primary)]/30"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Sort By</label>
                                    <div className="relative">
                                        <select
                                            value={sort}
                                            onChange={(e) => setSort(e.target.value as any)}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-2 text-[13px] font-black appearance-none outline-none focus:ring-1 focus:ring-[var(--primary)]/30"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="price_asc">Price: Low to High</option>
                                            <option value="price_desc">Price: High to Low</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] mt-0.5" />
                                    </div>
                                </div>

                                {/* Mobile Occasion Filter */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Occasion</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            { id: 'All', name: 'All' },
                                            { id: 'Wedding', name: 'Wedding' },
                                            { id: 'Engagement', name: 'Engagement' },
                                            { id: 'Gift', name: 'Gifts' },
                                            { id: 'Party', name: 'Party' },
                                        ].map((occ) => (
                                            <button
                                                key={occ.id}
                                                onClick={() => { setOccasion(occ.id); setIsMenuOpen(false); }}
                                                className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${occasion === occ.id
                                                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                                                    : 'bg-[var(--bg-input)] border-[var(--border)] text-[var(--text-muted)]'
                                                    }`}
                                            >
                                                {occ.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Logout */}
                            <div className="pt-4 border-t border-[var(--border)]">
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <GoldCalculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />
        </nav>
    );
}
