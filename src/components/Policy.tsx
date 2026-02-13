
import { ShieldCheck, RotateCcw, Scale, Info, Truck, CreditCard, HelpCircle } from 'lucide-react';

export default function Policy() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-[var(--primary)]/10 rounded-2xl mb-2">
                    <ShieldCheck className="w-8 h-8 text-[var(--primary)]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tight">A.Z Shop Official Policies</h2>
                <p className="max-w-xl mx-auto text-[var(--text-muted)] font-medium text-sm">
                    Review our terms regarding returns, gold weight deductions, and jewellery standards.
                </p>
            </div>

            {/* Main Policy Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gold Return Policy - CRITICAL PART */}
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 shadow-lg hover:shadow-[var(--accent-glow)] transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <RotateCcw className="w-20 h-20 text-[var(--primary)]" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/10 rounded-xl">
                                <RotateCcw className="w-5 h-5 text-yellow-600" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-main)]">Gold Return Policy</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-yellow-500/5 border border-yellow-500/20 p-3 rounded-xl">
                                <div className="flex items-start gap-2">
                                    <Scale className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-yellow-700 leading-tight text-sm">3 Masha Deduction Rule</p>
                                        <p className="text-xs text-yellow-800/70 mt-1">
                                            On return/sale back to us, a deduction (Kat) of **3 Masha per 1 Tola** will be applied on the current market gold rate.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <ul className="space-y-2 px-1">
                                <li className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                    <div className="w-1 h-1 bg-[var(--primary)] rounded-full" />
                                    Making charges (Labour) are non-refundable.
                                </li>
                                <li className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                    <div className="w-1 h-1 bg-[var(--primary)] rounded-full" />
                                    Original receipt is mandatory for all returns.
                                </li>
                                <li className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                    <div className="w-1 h-1 bg-[var(--primary)] rounded-full" />
                                    Cash back or Exchange options available.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Delivery Policy */}
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 shadow-lg hover:shadow-blue-500/5 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Truck className="w-20 h-20 text-blue-500" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <Truck className="w-5 h-5 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-main)]">Shipping & Delivery</h3>
                        </div>

                        <div className="space-y-3">
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="w-6 h-6 bg-[var(--bg-input)] rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold">01</div>
                                    <p className="text-xs text-[var(--text-muted)]">Orders are processed within 24-48 hours of payment confirmation.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-6 h-6 bg-[var(--bg-input)] rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold">02</div>
                                    <p className="text-xs text-[var(--text-muted)]">Nationwide shipping via insured courier partners for security.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-6 h-6 bg-[var(--bg-input)] rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold">03</div>
                                    <p className="text-xs text-[var(--text-muted)]">Delivery takes 3-5 business days depending on your location.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Secure Payments */}
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 shadow-lg hover:shadow-green-500/5 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <CreditCard className="w-20 h-20 text-green-500" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-xl">
                                <CreditCard className="w-5 h-5 text-green-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-main)]">Payment Security</h3>
                        </div>

                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            We accept Bank Transfers, EasyPaisa, and JazzCash. Every transaction is monitored for safety. Please upload your payment receipt in the orders section for manual verification by our Super Admin.
                        </p>
                    </div>
                </div>

                {/* Support Policy */}
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 shadow-lg hover:shadow-purple-500/5 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <HelpCircle className="w-20 h-20 text-purple-500" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-xl">
                                <HelpCircle className="w-5 h-5 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-main)]">Customer Support</h3>
                        </div>

                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            Our support team is available 10AM - 8PM. Use the **Queries** tab to open a support ticket. We aim to respond within 12 hours. For urgent matters, visit our physical store location.
                        </p>
                    </div>
                </div>
            </div>

            {/* Final Note */}
            <div className="bg-[var(--bg-input)]/50 rounded-2xl p-4 text-center border border-[var(--border)] flex items-center justify-center gap-2">
                <Info className="w-4 h-4 text-[var(--primary)]" />
                <p className="text-xs font-bold text-[var(--text-muted)] italic">
                    By choosing A.Z Shop, you agree to these terms. Prices are synchronized live with global gold markets.
                </p>
            </div>
        </div>
    );
}
