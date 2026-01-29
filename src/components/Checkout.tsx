import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, Loader2, ShieldAlert, AlertCircle } from 'lucide-react';
import Navbar from './Navbar';
import PolicyModal from './PolicyModal';
import api, { IMAGE_BASE_URL } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { toast } from '../store/useToastStore';

export default function Checkout() {
  const { user } = useAuthStore();
  const { items, total: getSubtotal, clearCart } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const [checkoutDetails, setCheckoutDetails] = useState({
    customerName: user?.name || '',
    customerCnic: user?.cnic || '',
    customerAddress: user?.address || '',
    customerPhone: user?.phone || '',
    paymentMethod: user?.paymentMethod || 'cash_on_shop',
    transactionId: '',
    paymentReceipt: '',
  });

  const subtotal = useMemo(() => getSubtotal(), [getSubtotal, items]);
  const userFee = subtotal * 0.02;
  const shippingFee = 1000;
  const grandTotal = subtotal + userFee + shippingFee;

  useEffect(() => {
    // Backend user route is /user/orders/payment-methods
    api
      .get('/user/orders/payment-methods')
      .then((res) => setPaymentMethods(res.data))
      .catch(() => toast.error('Failed to load payment methods'));
  }, []);

  useEffect(() => {
    // Keep in sync if user store hydrates later
    setCheckoutDetails((prev) => ({
      ...prev,
      customerName: prev.customerName || user?.name || '',
      customerCnic: prev.customerCnic || user?.cnic || '',
      customerAddress: prev.customerAddress || user?.address || '',
      customerPhone: prev.customerPhone || user?.phone || '',
      paymentMethod: prev.paymentMethod || user?.paymentMethod || 'cash_on_shop',
    }));
  }, [user?.name, user?.cnic, user?.address, user?.phone, user?.paymentMethod]);

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
      setCheckoutDetails((prev) => ({ ...prev, paymentReceipt: response.data.url }));
      toast.success('Receipt uploaded');
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    if (!checkoutDetails.customerName || !checkoutDetails.customerCnic || !checkoutDetails.customerAddress || !checkoutDetails.customerPhone) {
      toast.error('Please fill delivery details in your profile first');
      return;
    }

    const selectedMethod = paymentMethods.find((m) => m.id === checkoutDetails.paymentMethod);
    if (selectedMethod?.type === 'online') {
      if (!checkoutDetails.transactionId || !checkoutDetails.paymentReceipt) {
        toast.error('Please provide transaction ID and receipt');
        return;
      }
    }

    setShowPolicy(true);
  };

  const completeCheckout = async () => {
    setShowPolicy(false);
    setLoading(true);
    try {
      await api.post('/user/orders', {
        items,
        total: grandTotal,
        ...checkoutDetails,
        paymentDetails: checkoutDetails.transactionId ? { transactionId: checkoutDetails.transactionId } : null,
        paymentReceipt: checkoutDetails.paymentReceipt,
      });
      clearCart();
      toast.success('Order placed! Redirecting to orders…');
      navigate('/user/dashboard?tab=orders');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedMethod = paymentMethods.find((m) => m.id === checkoutDetails.paymentMethod);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-['Outfit']">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/cart" className="p-2 hover:bg-[var(--bg-card)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-main)]">Checkout</h1>
            <p className="text-sm text-[var(--text-muted)]">Review details and place your order.</p>
          </div>
        </div>

        {user?.isBlocked && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-500">
            <AlertCircle className="w-8 h-8" />
            <div>
              <h3 className="font-bold">Account Restricted</h3>
              <p className="text-sm">You cannot place orders because your account is blocked.</p>
            </div>
          </div>
        )}

        {user?.isFrozen && (
          <div className="mb-8 bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl flex items-center gap-4 text-orange-500">
            <ShieldAlert className="w-8 h-8" />
            <div>
              <h3 className="font-bold">Financial Activities Frozen</h3>
              <p className="text-sm">New orders are temporarily disabled for your account.</p>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-10 rounded-3xl text-center text-[var(--text-muted)]">
            Your cart is empty. <Link className="text-[var(--primary)] font-bold hover:underline" to="/user/dashboard?tab=shop">Go shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Delivery Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Full Name</label>
                    <input
                      value={checkoutDetails.customerName}
                      onChange={(e) => setCheckoutDetails({ ...checkoutDetails, customerName: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/50"
                      placeholder="Recipient Name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">CNIC Number</label>
                    <input
                      value={checkoutDetails.customerCnic}
                      onChange={(e) => setCheckoutDetails({ ...checkoutDetails, customerCnic: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/50"
                      placeholder="42101-XXXXXXX-X"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Address</label>
                    <input
                      value={checkoutDetails.customerAddress}
                      onChange={(e) => setCheckoutDetails({ ...checkoutDetails, customerAddress: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/50"
                      placeholder="Delivery address"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Phone</label>
                    <input
                      value={checkoutDetails.customerPhone}
                      onChange={(e) => setCheckoutDetails({ ...checkoutDetails, customerPhone: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/50"
                      placeholder="03xx-xxxxxxx"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Payment</h2>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Payment Method</label>
                <select
                  value={checkoutDetails.paymentMethod}
                  onChange={(e) => setCheckoutDetails({ ...checkoutDetails, paymentMethod: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[var(--primary)]/50 cursor-pointer"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>

                {selectedMethod?.type === 'online' && (
                  <div className="mt-4 bg-gradient-to-br from-[var(--primary)]/5 to-transparent p-4 rounded-xl border border-[var(--primary)]/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[var(--primary)]" />
                      <span className="text-xs font-bold uppercase text-[var(--primary)]">Online Payment</span>
                    </div>
                    <div className="text-[11px] space-y-1 text-[var(--text-muted)]">
                      <div className="flex justify-between">
                        <span>Bank / Wallet:</span>
                        <span className="text-[var(--text-main)] font-bold">{selectedMethod.details.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Account Title:</span>
                        <span className="text-[var(--text-main)] font-bold">{selectedMethod.details.accountTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Account No:</span>
                        <span className="text-[var(--text-main)] font-mono font-bold">{selectedMethod.details.accountNumber}</span>
                      </div>
                    </div>
                    <input
                      value={checkoutDetails.transactionId}
                      onChange={(e) => setCheckoutDetails({ ...checkoutDetails, transactionId: e.target.value })}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 text-sm"
                      placeholder="Transaction ID"
                    />
                    <label className="flex items-center justify-center aspect-video rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)]/50 cursor-pointer overflow-hidden">
                      {checkoutDetails.paymentReceipt ? (
                        <img src={getImageUrl(checkoutDetails.paymentReceipt)} alt="Receipt" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs uppercase font-bold text-[var(--text-muted)]">{uploading ? 'Uploading…' : 'Upload Receipt'}</span>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-2xl lg:sticky lg:top-28 shadow-2xl">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Subtotal</span>
                    <span className="font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Platform Fee (2%)</span>
                    <span className="font-bold">{formatPrice(userFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Shipping Fee</span>
                    <span className="font-bold">{formatPrice(shippingFee)}</span>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex justify-between text-lg font-black">
                    <span>Total</span>
                    <span className="text-[var(--primary)]">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutClick}
                  disabled={loading || uploading || user?.isFrozen || user?.isBlocked}
                  className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</> : 'Verify & Place Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showPolicy && <PolicyModal onAccepted={completeCheckout} onClose={() => setShowPolicy(false)} />}
    </div>
  );
}

