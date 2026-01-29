import React from 'react';
import { ShieldCheck, RotateCcw, Scale, Info, Truck, CreditCard, HelpCircle } from 'lucide-react';

export default function Policy() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-[var(--primary)]/10 rounded-3xl mb-4">
                    <ShieldCheck className="w-10 h-10 text-[var(--primary)]" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-[var(--text-main)] tracking-tight">Our Shop Policies</h2>
                <p className="max-w-2xl mx-auto text-[var(--text-muted)] font-medium">
                    Transparency is our priority. Please review our terms regarding returns, weight deductions, and service standards.
                </p>
            </div>

            {/* Main Policy Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Gold Return Policy - CRITICAL PART */}
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-xl hover:shadow-[var(--accent-glow)] transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <RotateCcw className="w-32 h-32 text-[var(--primary)]" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/10 rounded-2xl">
                                <RotateCcw className="w-6 h-6 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--text-main)]">Gold Return Policy</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-yellow-500/5 border border-yellow-500/20 p-5 rounded-3xl">
                                <div className="flex items-start gap-3">
                                    <Scale className="w-5 h-5 text-yellow-600 shrink-0 mt-1" />
                                    <div>
                                        <p className="font-bold text-yellow-700 leading-tight">3 Masha Deduction Rule</p>
                                        <p className="text-sm text-yellow-800/70 mt-1">
                                            On return/sale back to us, a deduction (Kat) of **3 Masha per 1 Tola** will be applied on the current market gold rate.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <ul className="space-y-3 px-2">
                                <li className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                                    <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full" />
                                    Making charges (Labour) are non-refundable.
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                                    <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full" />
                                    Original receipt is mandatory for all returns.
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                                    <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full" />
                                    Cash back or Exchange options available.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Delivery Policy */}
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-xl hover:shadow-blue-500/5 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <Truck className="w-32 h-32 text-blue-500" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl">
                                <Truck className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--text-main)]">Shipping & Delivery</h3>
                        </div>

                        <div className="space-y-4">
                            <ul className="space-y-4">
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 bg-[var(--bg-input)] rounded-lg flex items-center justify-center shrink-0 text-xs font-bold">01</div>
                                    <p className="text-sm text-[var(--text-muted)]">Orders are processed within 24-48 hours of payment confirmation.</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 bg-[var(--bg-input)] rounded-lg flex items-center justify-center shrink-0 text-xs font-bold">02</div>
                                    <p className="text-sm text-[var(--text-muted)]">Nationwide shipping via insured courier partners for security.</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 bg-[var(--bg-input)] rounded-lg flex items-center justify-center shrink-0 text-xs font-bold">03</div>
                                    <p className="text-sm text-[var(--text-muted)]">Delivery takes 3-5 business days depending on your location.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Secure Payments */}
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-xl hover:shadow-green-500/5 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <CreditCard className="w-32 h-32 text-green-500" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-2xl">
                                <CreditCard className="w-6 h-6 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--text-main)]">Payment Security</h3>
                        </div>

                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                            We accept Bank Transfers, EasyPaisa, and JazzCash. Every transaction is monitored for safety. Please upload your payment receipt in the orders section for manual verification by our Super Admin.
                        </p>
                    </div>
                </div>

                {/* Support Policy */}
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-xl hover:shadow-purple-500/5 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <HelpCircle className="w-32 h-32 text-purple-500" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-2xl">
                                <HelpCircle className="w-6 h-6 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--text-main)]">Customer Support</h3>
                        </div>

                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                            Our support team is available 10AM - 8PM. Use the **Queries** tab to open a support ticket. We aim to respond within 12 hours. For urgent matters, visit our physical store location.
                        </p>
                    </div>
                </div>
            </div>

            {/* Final Note */}
            <div className="bg-[var(--bg-input)]/50 rounded-3xl p-6 text-center border border-[var(--border)] flex items-center justify-center gap-3">
                <Info className="w-5 h-5 text-[var(--primary)]" />
                <p className="text-sm font-bold text-[var(--text-muted)] italic">
                    By shopping with us, you agree to these terms. Prices are updated live based on global gold markets.
                </p>
            </div>
        </div>
    );
}
