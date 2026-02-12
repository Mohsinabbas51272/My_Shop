import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, Loader2, ShieldAlert, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import PolicyModal from './PolicyModal';
import api from '../lib/api';
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
    paymentMethod: 'cash_on_shop',
    transactionId: '',
    paymentReceipt: '',
  });

  const subtotal = useMemo(() => getSubtotal(), [getSubtotal, items]);
  const userFee = Math.round(subtotal * 0.02);
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
      paymentMethod: prev.paymentMethod || 'cash_on_shop',
    }));
  }, [user?.name, user?.cnic, user?.address, user?.phone]);



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
    // Normalize payment method to handle technical IDs or legacy display strings
    let normalizedMethodId = checkoutDetails.paymentMethod;
    if (normalizedMethodId === 'Cash on Shop' || normalizedMethodId === 'offline') {
      normalizedMethodId = 'cash_on_shop';
    } else if (normalizedMethodId === 'online' && !paymentMethods.find(m => m.id === 'online')) {
      // If it's just "online" but no method with ID "online" exists, default to cash_on_shop or first online method
      const firstOnline = paymentMethods.find(m => m.type === 'online');
      normalizedMethodId = firstOnline ? firstOnline.id : 'cash_on_shop';
    }

    const selectedMethod = paymentMethods.find((m) => m.id === normalizedMethodId);

    // Improve label formatting: e.g. "Cash on Shop (Offline)"
    const methodDesc = selectedMethod
      ? `${selectedMethod.name} (${selectedMethod.type.charAt(0).toUpperCase() + selectedMethod.type.slice(1)})`
      : (normalizedMethodId === 'cash_on_shop' ? 'Cash on Shop (Offline)' : normalizedMethodId);

    try {
      await api.post('/user/orders', {
        items,
        total: grandTotal,
        ...checkoutDetails,
        paymentMethod: methodDesc,
        paymentDetails: checkoutDetails.transactionId ? { transactionId: checkoutDetails.transactionId } : null,
        paymentReceipt: checkoutDetails.paymentReceipt,
      });
      clearCart();
      setIsSuccess(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-['Outfit'] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-[3rem] p-10 text-center shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] shadow-[0_0_20px_var(--primary)]" />

            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-[var(--primary)]/40"
            >
              <ShieldCheck className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-4xl font-black text-[var(--text-main)] mb-4 tracking-tight uppercase">Masterpiece Secured</h1>
            <p className="text-[var(--text-muted)] font-medium mb-10 leading-relaxed uppercase tracking-[0.1em] text-[10px]">Your order has been authorized and is now being processed in our vault. You will receive a certification shortly.</p>

            <div className="bg-[var(--bg-input)]/50 border border-[var(--border)] rounded-3xl p-6 mb-10 space-y-4">
              <div className="flex justify-between items-center px-2">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Settlement Total</span>
                <span className="text-xl font-black text-[var(--primary)]">{formatPrice(grandTotal)}</span>
              </div>
              <div className="h-px bg-[var(--border)] mx-2" />
              <div className="flex justify-between items-center px-2">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Recipient</span>
                <span className="text-xs font-bold">{checkoutDetails.customerName}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigate('/user/dashboard?tab=orders')}
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-[var(--primary)]/20 uppercase tracking-[0.2em] text-xs active:scale-95"
              >
                View My Vault
              </button>
              <Link
                to="/user/dashboard?tab=shop"
                className="w-full bg-[var(--bg-input)] text-[var(--text-main)] hover:bg-[var(--border)] font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] text-xs"
              >
                Continue Discovery
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  const selectedMethod = paymentMethods.find((m) => m.id === checkoutDetails.paymentMethod);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-['Outfit']">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)] bg-[var(--bg-card)]/10 border-2 border-dashed border-[var(--border)] rounded-[2.5rem] animate-in fade-in zoom-in">
            <div className="p-8 bg-[var(--bg-input)]/50 rounded-full mb-6 relative">
              <ShoppingBag className="w-16 h-16 opacity-20" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-[var(--text-main)]">Your collection is empty</h2>
            <p className="mb-8 font-medium opacity-60">Add items to your cart before checking out.</p>
            <Link
              to="/dashboard"
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black px-10 py-4 rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs"
            >
              Back to Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 lg:items-start">
            {/* Delivery Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-5 shadow-xl h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                    <ShieldAlert className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <h2 className="text-sm font-black text-[var(--text-main)] tracking-tight">Delivery Identity</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Full Name</label>
                      {user?.name && <span className="text-[7px] font-bold text-green-500 uppercase tracking-tighter">Verified</span>}
                    </div>
                    <input
                      value={checkoutDetails.customerName}
                      onChange={(e) => setCheckoutDetails({ ...checkoutDetails, customerName: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-3 text-[13px] font-bold focus:ring-4 focus:ring-[var(--primary)]/5 outline-none transition-all"
                      placeholder="Recipient Name"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">CNIC</label>
                      {user?.cnic && <span className="text-[7px] font-bold text-green-500 uppercase tracking-tighter">Verified</span>}
                    </div>
                    <input
                      value={checkoutDetails.customerCnic}
                      onChange={(e) => setCheckoutDetails({ ...checkoutDetails, customerCnic: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-3 text-[13px] font-bold focus:ring-4 focus:ring-[var(--primary)]/5 outline-none transition-all"
                      placeholder="42101-XXXXXXX-X"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Phone</label>
                      {user?.phone && <span className="text-[7px] font-bold text-green-500 uppercase tracking-tighter">Verified</span>}
                    </div>
                    <input
                      value={checkoutDetails.customerPhone}
                      onChange={(e) => setCheckoutDetails({ ...checkoutDetails, customerPhone: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-3 text-[13px] font-bold focus:ring-4 focus:ring-[var(--primary)]/5 outline-none transition-all"
                      placeholder="03xx-xxxxxxx"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Address</label>
                      {user?.address && <span className="text-[7px] font-bold text-green-500 uppercase tracking-tighter">Verified</span>}
                    </div>
                    <textarea
                      rows={3}
                      value={checkoutDetails.customerAddress}
                      onChange={(e) => setCheckoutDetails({ ...checkoutDetails, customerAddress: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-3 text-[13px] font-bold focus:ring-4 focus:ring-[var(--primary)]/5 outline-none transition-all resize-none"
                      placeholder="Verified delivery location"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-6 md:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                    <CreditCard className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <h2 className="text-lg font-black text-[var(--text-main)] tracking-tight">Payment Settlement</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Settlement Method</label>
                    <select
                      value={checkoutDetails.paymentMethod}
                      onChange={(e) => setCheckoutDetails({ ...checkoutDetails, paymentMethod: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-4 text-sm font-black appearance-none outline-none focus:ring-4 focus:ring-[var(--primary)]/5 transition-all cursor-pointer"
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>{method.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedMethod?.type === 'online' && (
                    <div className="p-6 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4">
                      <div className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] space-y-4">
                        <div className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-1 opacity-60 text-center">Merchant Credentials</div>
                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-6 text-center">
                          <div>
                            <span className="block text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Institution</span>
                            <span className="text-xs font-bold text-[var(--text-main)]">{selectedMethod.details.bankName}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Title</span>
                            <span className="text-xs font-bold text-[var(--text-main)]">{selectedMethod.details.accountTitle}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="block text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Account Code</span>
                            <span className="text-sm font-mono font-black text-[var(--primary)] tracking-wider selection:bg-[var(--primary)] selection:text-white">{selectedMethod.details.accountNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          value={checkoutDetails.transactionId}
                          onChange={(e) => setCheckoutDetails({ ...checkoutDetails, transactionId: e.target.value })}
                          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 text-sm font-bold focus:ring-4 focus:ring-[var(--primary)]/5 outline-none transition-all placeholder:opacity-30"
                          placeholder="Transaction Identification ID"
                        />
                        <label className="relative flex items-center justify-center h-14 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl cursor-pointer hover:border-[var(--primary)]/50 transition-all overflow-hidden group">
                          {checkoutDetails.paymentReceipt ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-green-500 uppercase tracking-widest">Receipt Linked</span>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Replace</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-tight text-center px-1">{uploading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Attach Receipt'}</span>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Collection Summary Section */}
            <div className="lg:col-span-3">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldAlert className="w-24 h-24" />
                </div>

                <h2 className="text-2xl font-black mb-6 text-[var(--text-main)] tracking-tight">Collection Summary</h2>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="flex flex-col text-center p-3 bg-[var(--bg-input)]/30 rounded-2xl border border-[var(--border)]/50">
                    <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Subtotal</span>
                    <span className="text-[11px] font-bold text-[var(--text-main)]">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex flex-col text-center p-3 bg-[var(--bg-input)]/30 rounded-2xl border border-[var(--border)]/50">
                    <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Fee (2%)</span>
                    <span className="text-[11px] font-bold text-[var(--text-main)]">{formatPrice(userFee)}</span>
                  </div>
                  <div className="flex flex-col text-center p-3 bg-[var(--bg-input)]/30 rounded-2xl border border-[var(--border)]/50">
                    <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Shipping</span>
                    <span className="text-[11px] font-bold text-[var(--text-main)]">{formatPrice(shippingFee)}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end bg-[var(--bg-input)]/20 p-5 rounded-3xl border border-[var(--border)]/30">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Settlement</span>
                      <span className="text-3xl font-black text-[var(--primary)]">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handleCheckoutClick}
                      disabled={loading || uploading || user?.isFrozen || user?.isBlocked}
                      className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-[var(--primary)]/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                      {loading ? 'Processing…' : 'Finalize & Place Order'}
                    </button>

                    <p className="text-[9px] font-bold text-[var(--text-muted)] text-center uppercase tracking-widest leading-relaxed">
                      By proceeding, you agree to our <span className="text-[var(--primary)]">Collection Transmission</span> policies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showPolicy && <PolicyModal onAccepted={completeCheckout} onClose={() => setShowPolicy(false)} />}
    </div>
  );
}

