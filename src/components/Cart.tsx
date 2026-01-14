import { useCartStore } from '../store/useCartStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import Navbar from './Navbar';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../lib/api';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export default function Cart() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const { formatPrice } = useCurrencyStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [checkoutDetails, setCheckoutDetails] = useState({
        customerName: user?.name || '',
        customerCnic: user?.cnic || '',
        customerAddress: user?.address || '',
        customerPhone: user?.phone || '',
        paymentMethod: user?.paymentMethod || 'cash_on_shop', // Default to ID
        transactionId: '',
        paymentReceipt: '',
    });
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        api.get('/orders/payment-methods')
            .then(res => setPaymentMethods(res.data))
            .catch(err => console.error('Failed to fetch payment methods', err));
    }, []);

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${IMAGE_BASE_URL}${url}`;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setCheckoutDetails({ ...checkoutDetails, paymentReceipt: response.data.url });
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleCheckout = async () => {
        if (items.length === 0) return;
        if (!checkoutDetails.customerName || !checkoutDetails.customerCnic || !checkoutDetails.customerAddress || !checkoutDetails.customerPhone) {
            alert('Please fill in all delivery details');
            return;
        }

        const selectedMethod = paymentMethods.find(m => m.id === checkoutDetails.paymentMethod);
        if (selectedMethod?.type === 'online') {
            if (!checkoutDetails.transactionId) {
                alert('Please enter Transaction ID');
                return;
            }
            if (!checkoutDetails.paymentReceipt) {
                alert('Please upload payment receipt');
                return;
            }
        }

        setLoading(true);
        try {
            await api.post('/orders', {
                items: JSON.stringify(items),
                total: total(),
                userId: user?.id,
                ...checkoutDetails,
                paymentDetails: checkoutDetails.transactionId ? { transactionId: checkoutDetails.transactionId } : null,
                paymentReceipt: checkoutDetails.paymentReceipt,
            });
            clearCart();
            alert('Order placed successfully!');
            navigate('/dashboard');
        } catch (err) {
            alert('Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/dashboard" className="p-2 hover:bg-[var(--bg-card)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold text-[var(--text-main)]">Your Cart</h1>
                </div>

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
                                    className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-2xl flex items-center gap-6"
                                >
                                    <img
                                        src={getImageUrl(item.image)}
                                        alt={item.name}
                                        className="w-24 h-24 object-cover rounded-xl bg-[var(--bg-input)]"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-[var(--text-main)]">{item.name}</h3>
                                        <p className="text-[var(--primary)] font-bold">{formatPrice(item.price)}</p>

                                        <div className="flex items-center gap-4 mt-4">
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
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-[var(--text-main)]">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-5">
                            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-2xl sticky top-28 shadow-2xl shadow-black/20">
                                <h2 className="text-xl font-bold mb-6 text-[var(--text-main)]">Order Summary</h2>

                                <div className="space-y-4 mb-8">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Full Name</label>
                                        <input
                                            value={checkoutDetails.customerName}
                                            onChange={(e) => setCheckoutDetails({ ...checkoutDetails, customerName: e.target.value })}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                                            placeholder="Recipient Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">CNIC Number</label>
                                        <input
                                            value={checkoutDetails.customerCnic}
                                            onChange={(e) => setCheckoutDetails({ ...checkoutDetails, customerCnic: e.target.value })}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                                            placeholder="42101-XXXXXXX-X"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Contact Number</label>
                                        <input
                                            value={checkoutDetails.customerPhone}
                                            onChange={(e) => setCheckoutDetails({ ...checkoutDetails, customerPhone: e.target.value })}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                                            placeholder="+92 3XX XXXXXXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Delivery Address</label>
                                        <textarea
                                            value={checkoutDetails.customerAddress}
                                            onChange={(e) => setCheckoutDetails({ ...checkoutDetails, customerAddress: e.target.value })}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/50 h-20"
                                            placeholder="House #, Street, City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Payment Method</label>
                                        <select
                                            value={checkoutDetails.paymentMethod}
                                            onChange={(e) => setCheckoutDetails({ ...checkoutDetails, paymentMethod: e.target.value })}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/50 cursor-pointer"
                                        >
                                            {paymentMethods.map(method => (
                                                <option key={method.id} value={method.id}>{method.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Payment Details Section */}
                                    {(() => {
                                        const selectedMethod = paymentMethods.find(m => m.id === checkoutDetails.paymentMethod);
                                        if (selectedMethod?.type === 'online' && selectedMethod.details) {
                                            return (
                                                <div className="bg-[var(--bg-input)]/50 p-4 rounded-lg border border-[var(--border)] space-y-3">
                                                    <p className="text-sm font-bold text-[var(--primary)]">Send Payment Details:</p>
                                                    <div className="text-sm space-y-1 text-[var(--text-muted)]">
                                                        {selectedMethod.details.bankName && (
                                                            <div className="flex justify-between">
                                                                <span>Bank:</span>
                                                                <span className="font-medium text-[var(--text-main)]">{selectedMethod.details.bankName}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between">
                                                            <span>Account Title:</span>
                                                            <span className="font-medium text-[var(--text-main)]">{selectedMethod.details.accountTitle}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Account No:</span>
                                                            <span className="font-medium text-[var(--text-main)] font-mono">{selectedMethod.details.accountNumber}</span>
                                                        </div>
                                                    </div>

                                                    <div className="pt-2">
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Transaction ID</label>
                                                        <input
                                                            value={checkoutDetails.transactionId}
                                                            onChange={(e) => setCheckoutDetails({ ...checkoutDetails, transactionId: e.target.value })}
                                                            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/50 placeholder:text-[var(--text-muted)]/50"
                                                            placeholder="Enter TRX ID from SMS/App"
                                                        />
                                                    </div>

                                                    <div className="pt-2">
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Upload Receipt</label>
                                                        {checkoutDetails.paymentReceipt ? (
                                                            <div className="relative aspect-video rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] cursor-pointer group" onClick={() => setCheckoutDetails({ ...checkoutDetails, paymentReceipt: '' })}>
                                                                <img src={getImageUrl(checkoutDetails.paymentReceipt)} alt="Receipt" className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Trash2 className="w-6 h-6 text-white" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)]/50 hover:bg-[var(--bg-card)] hover:border-[var(--primary)]/50 transition-all cursor-pointer">
                                                                {uploading ? (
                                                                    <p className="text-xs font-bold animate-pulse text-[var(--primary)]">Uploading...</p>
                                                                ) : (
                                                                    <>
                                                                        <Upload className="w-6 h-6 text-[var(--text-muted)] mb-2" />
                                                                        <span className="text-xs text-[var(--text-muted)]">Click to upload screenshot</span>
                                                                    </>
                                                                )}
                                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>

                                <div className="space-y-4 mb-8 pt-6 border-t border-[var(--border)]/50">
                                    <div className="flex justify-between text-[var(--text-muted)]">
                                        <span>Subtotal</span>
                                        <span className="text-[var(--text-main)]">{formatPrice(total())}</span>
                                    </div>
                                    <div className="flex justify-between text-[var(--text-muted)] text-sm">
                                        <span>Shipping</span>
                                        <span className="text-green-500 font-medium">Free</span>
                                    </div>
                                    <div className="pt-4 border-t border-[var(--border)] flex justify-between text-xl font-bold">
                                        <span className="text-[var(--text-main)]">Total</span>
                                        <span className="text-[var(--primary)]">{formatPrice(total())}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={loading || uploading}
                                    className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[var(--accent-glow)] flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    {loading ? 'Processing...' : 'Checkout Now'}
                                </button>
                                <p className="text-center text-[10px] text-[var(--text-muted)] mt-6 uppercase tracking-widest font-bold opacity-50">
                                    Secure Encryption
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
