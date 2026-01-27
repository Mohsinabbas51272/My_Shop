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
                    <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)] bg-[var(--bg-card)]/30 border border-dashed border-[var(--border)] rounded-3xl">
                        <ShoppingBag className="w-20 h-20 mb-6 opacity-10" />
                        <h2 className="text-2xl font-bold mb-2 text-[var(--text-main)]">Your cart is empty</h2>
                        <p className="mb-8">Looks like you haven't added anything yet.</p>
                        <Link
                            to="/dashboard"
                            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-[var(--accent-glow)]"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-7 space-y-6">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-[var(--bg-card)] border border-[var(--border)] p-4 md:p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4 md:gap-6"
                                >
                                    <img
                                        src={getImageUrl(item.image)}
                                        alt={item.name}
                                        className="w-24 h-24 object-contain rounded-xl bg-[var(--bg-input)] p-2"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-[var(--text-main)]">{item.name}</h3>
                                        <p className="text-[var(--primary)] font-bold">{formatPrice(item.price)}</p>

                                        <div className="flex items-center justify-between sm:justify-start gap-4 mt-4">
                                            <div className="flex items-center bg-[var(--bg-input)] border border-[var(--border)] rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-2 hover:bg-[var(--bg-card)] text-[var(--text-muted)] transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-12 text-center text-sm font-bold text-[var(--text-main)]">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-2 hover:bg-[var(--bg-card)] text-[var(--text-muted)] transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-auto text-right border-t sm:border-t-0 border-[var(--border)]/30 pt-4 sm:pt-0">
                                        <p className="font-bold text-lg text-[var(--text-main)]">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-12 xl:col-span-5">
                            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 md:p-8 rounded-2xl md:sticky md:top-28 shadow-2xl">
                                <h2 className="text-xl font-bold mb-6 text-[var(--text-main)]">Order Summary & Fees</h2>

                                <div className="space-y-4 mb-8">
                                    <div className="p-4 bg-[var(--bg-input)]/30 rounded-xl border border-[var(--border)] space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[var(--text-muted)]">Subtotal</span>
                                            <span className="font-medium text-[var(--text-main)]">{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[var(--text-muted)]">Platform Fee (2%)</span>
                                            <span className="font-medium text-[var(--text-main)]">{formatPrice(userFee)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[var(--text-muted)]">Shipping Fee</span>
                                            <span className="font-medium text-[var(--text-main)]">{formatPrice(shippingFee)}</span>
                                        </div>
                                        <div className="pt-3 border-t border-[var(--border)] flex justify-between text-xl font-bold">
                                            <span className="text-[var(--text-main)]">Grand Total</span>
                                            <span className="text-[var(--primary)]">{formatPrice(grandTotal)}</span>
                                        </div>
                                    </div>

                                    {/* Checkout Prompt */}
                                    <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 p-6 rounded-2xl mb-8">
                                        <p className="text-sm text-[var(--text-muted)] text-center">
                                            Delivery details and payment will be collected on the next step.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckoutClick}
                                    disabled={user?.isFrozen || user?.isBlocked}
                                    className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    Go to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
