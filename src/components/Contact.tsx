import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Mail, Phone, MapPin, Send, Loader2, ShoppingBag } from 'lucide-react';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

export default function Contact() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        orderId: null as number | null
    });

    const { data: orders } = useQuery({
        queryKey: ['orders-for-complaint', user?.id],
        queryFn: async () => (await api.get(`/orders?userId=${user?.id}`)).data,
        enabled: !!user?.id,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/complaints', {
                subject: formData.subject,
                description: formData.description,
                orderId: formData.orderId
            });
            alert('Query submitted successfully! We will get back to you soon.');
            setFormData({ subject: '', description: '', orderId: null });
        } catch (error) {
            console.error('Failed to send message', error);
            alert('Failed to submit query. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
                    <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
                        Have questions about our products or need assistance? We're here to help.
                        Reach out to us through any of the channels below.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-8"
                    >
                        <div className="bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border)] shadow-xl">
                            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1">Our Location</h3>
                                        <p className="text-[var(--text-muted)]">
                                            123 Commerce Avenue, Tech District<br />
                                            Lahore, Pakistan 54000
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1">Phone Number</h3>
                                        <p className="text-[var(--text-muted)]">+92 300 1234567</p>
                                        <p className="text-[var(--text-muted)] text-sm mt-1">Mon-Fri, 9am - 6pm</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1">Email Address</h3>
                                        <p className="text-[var(--text-muted)]">support@myshop.com</p>
                                        <p className="text-[var(--text-muted)] text-sm mt-1">We reply within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-64 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg relative group">
                            {/* Placeholder for map - using an image or just a styled div */}
                            <div className="absolute inset-0 bg-[var(--bg-input)] flex items-center justify-center">
                                <p className="text-[var(--text-muted)] font-bold flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Map Integration Coming Soon
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border)] shadow-xl"
                    >
                        <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {user && (
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">Related Order (Optional)</label>
                                    <select
                                        value={formData.orderId || ''}
                                        onChange={(e) => setFormData({ ...formData, orderId: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all"
                                    >
                                        <option value="">Select an order (if applicable)</option>
                                        {orders?.map((order: any) => (
                                            <option key={order.id} value={order.id}>
                                                Order #{order.id} - {new Date(order.createdAt).toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all"
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all resize-none"
                                    placeholder="Tell us more about your inquiry..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[var(--accent-glow)] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
