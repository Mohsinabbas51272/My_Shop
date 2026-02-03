import { useCartStore } from '../store/useCartStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import Navbar from './Navbar';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, AlertCircle, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from '../store/useToastStore';

export default function Cart() {
    const { items, removeItem, updateQuantity, total: getSubtotal } = useCartStore();
    const { user } = useAuthStore();
    const { formatPrice } = useCurrencyStore();
    const navigate = useNavigate();

    const subtotal = getSubtotal();
    const userFee = subtotal * 0.02;
    const shippingFee = 1000;
    const grandTotal = subtotal + userFee + shippingFee;

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${IMAGE_BASE_URL}${url}`;
    };

    const handleCheckoutClick = () => {
        if (items.length === 0) return;
        if (!user?.name || !user?.cnic || !user?.address || !user?.phone) {
            toast.error('Please fill delivery details in your profile first');
            return;
        }
        navigate('/checkout');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-['Outfit']">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/dashboard" className="p-2 hover:bg-[var(--bg-card)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold text-[var(--text-main)]">Your Cart</h1>
                </div>

                {user?.isBlocked && (
                    <div className="mb-12 bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-500">
                        <AlertCircle className="w-8 h-8" />
                        <div>
                            <h3 className="font-bold">Account Restricted</h3>
                            <p className="text-sm">You cannot place orders because your account is blocked.</p>
                        </div>
                    </div>
                )}

                {user?.isFrozen && (
                    <div className="mb-12 bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl flex items-center gap-4 text-orange-500">
                        <ShieldAlert className="w-8 h-8" />
                        <div>
                            <h3 className="font-bold">Financial Activities Frozen</h3>
                            <p className="text-sm">New orders are temporarily disabled for your account.</p>
                        </div>
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)] bg-[var(--bg-card)]/10 border-2 border-dashed border-[var(--border)] rounded-[2.5rem] animate-in fade-in zoom-in duration-500">
                        <div className="p-8 bg-[var(--bg-input)]/50 rounded-full mb-6 relative">
                            <ShoppingBag className="w-16 h-16 opacity-20" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[var(--primary)]/10 rounded-full blur-2xl -z-10" />
                        </div>
                        <h2 className="text-2xl font-black mb-2 text-[var(--text-main)]">Your vault is empty</h2>
                        <p className="mb-8 font-medium opacity-60">Looks like you haven't added any treasures yet.</p>
                        <Link
                            to="/dashboard"
                            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black px-10 py-4 rounded-2xl transition-all shadow-lg shadow-[var(--primary)]/20 active:scale-95 uppercase tracking-widest text-xs"
                        >
                            Explore Collection
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
                        <div className="lg:col-span-7 space-y-6">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="group bg-[var(--bg-card)] border border-[var(--border)] p-4 md:p-6 rounded-[2rem] flex flex-col sm:flex-row items-center gap-6 transition-all hover:border-[var(--primary)]/30 hover:shadow-xl relative overflow-hidden"
                                >
                                    <div className="w-full sm:w-32 h-32 aspect-square bg-[var(--bg-input)]/50 rounded-2xl overflow-hidden shrink-0 border border-[var(--border)]/50 p-2">
                                        <img
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                            <h3 className="text-xl font-black text-[var(--text-main)] tracking-tight line-clamp-1">{item.name}</h3>
                                            <p className="text-xl font-black text-[var(--primary)]">{formatPrice(item.price * item.quantity)}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
                                            <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest px-2 py-0.5 bg-[var(--primary)]/10 rounded-md border border-[var(--primary)]/20">
                                                {formatPrice(item.price)} / unit
                                            </span>
                                            {((item.weightTola || 0) > 0 || (item.weightMasha || 0) > 0 || (item.weightRati || 0) > 0) && (
                                                <div className="flex gap-1.5">
                                                    {(item.weightTola || 0) > 0 && <span className="text-[9px] font-black text-[var(--text-muted)] uppercase border border-[var(--border)] px-1.5 py-0.5 rounded bg-[var(--bg-input)]">{item.weightTola}T</span>}
                                                    {(item.weightMasha || 0) > 0 && <span className="text-[9px] font-black text-[var(--text-muted)] uppercase border border-[var(--border)] px-1.5 py-0.5 rounded bg-[var(--bg-input)]">{item.weightMasha}M</span>}
                                                    {(item.weightRati || 0) > 0 && <span className="text-[9px] font-black text-[var(--text-muted)] uppercase border border-[var(--border)] px-1.5 py-0.5 rounded bg-[var(--bg-input)]">{item.weightRati}R</span>}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-center sm:justify-between gap-6 pt-4 border-t border-[var(--border)]/20">
                                            <div className="flex items-center bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-1 shadow-inner">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-2 hover:bg-[var(--bg-card)] text-[var(--text-muted)] transition-all active:scale-90"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-10 text-center text-sm font-black text-[var(--text-main)]">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-2 hover:bg-[var(--bg-card)] text-[var(--text-muted)] transition-all active:scale-90"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    removeItem(item.id);
                                                    toast.success('Removed from Bag');
                                                }}
                                                className="p-2.5 bg-red-500/5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-95 border border-transparent hover:border-red-500/20"
                                                title="Remove Item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-5">
                            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[2.5rem] lg:sticky lg:top-28 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <ShoppingBag className="w-32 h-32" />
                                </div>

                                <h2 className="text-2xl font-black mb-8 text-[var(--text-main)] tracking-tight">Order Summary</h2>

                                <div className="space-y-4 mb-10">
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Subtotal</span>
                                        <span className="font-bold text-[var(--text-main)]">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Platform Fee (2%)</span>
                                        <span className="font-bold text-[var(--text-main)]">{formatPrice(userFee)}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Global Logistics</span>
                                        <span className="font-bold text-[var(--text-main)]">{formatPrice(shippingFee)}</span>
                                    </div>

                                    <div className="my-8 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

                                    <div className="flex justify-between items-end px-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Amount</span>
                                            <span className="text-3xl font-black text-[var(--primary)]">{formatPrice(grandTotal)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={handleCheckoutClick}
                                        disabled={user?.isFrozen || user?.isBlocked}
                                        className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-[var(--primary)]/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
                                    >
                                        Proceed to Checkout
                                    </button>

                                    <div className="p-4 bg-[var(--bg-input)]/30 rounded-2xl border border-[var(--border)] flex items-center gap-3">
                                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                                            <ArrowLeft className="w-4 h-4 text-yellow-500 rotate-180" />
                                        </div>
                                        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-relaxed">
                                            Final payment details will be <span className="text-[var(--text-main)]">confirmed</span> on the next step.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
