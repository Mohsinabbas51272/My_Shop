import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from '../store/useToastStore';

export default function Contact() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        orderId: null as number | null
    });

    const { data: ordersData } = useQuery({
        queryKey: ['orders-for-complaint', user?.id],
        queryFn: async () => (await api.get(`/orders?userId=${user?.id}`)).data,
        enabled: !!user?.id,
        staleTime: 30000,
    });
    const orders = ordersData?.items || ordersData || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/complaints', {
                subject: formData.subject,
                description: formData.description,
                orderId: formData.orderId
            });
            toast.success('Query submitted! We will get back to you soon.');
            setFormData({ subject: '', description: '', orderId: null });
            navigate('/user/dashboard?tab=shop');
        } catch (error) {
            console.error('Failed to send message', error);
            toast.error('Failed to submit query. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl font-black mb-2">Get in Touch</h1>
                    <p className="text-[var(--text-muted)] max-w-xl mx-auto text-sm">
                        Have questions? We're here to help. Reach out to us below.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                    >
                        <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border)] shadow-xl h-fit">
                            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">Order Center</h3>
                                        <p className="text-[var(--text-muted)] text-xs leading-tight">
                                            Phathi Joyianwali, Piplan<br />
                                            Mianwali, Punjab
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">Phone</h3>
                                        <p className="text-[var(--text-muted)] text-xs">+923078520514</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">Email</h3>
                                        <p className="text-[var(--text-muted)] text-xs">testmyshop3@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-40 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg relative group">
                            {/* Placeholder for map - using an image or just a styled div */}
                            <div className="absolute inset-0 bg-[var(--bg-input)] flex items-center justify-center">
                                <p className="text-[var(--text-muted)] font-bold flex items-center gap-2 text-xs">
                                    <MapPin className="w-4 h-4" />
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
                        className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border)] shadow-xl"
                    >
                        <h2 className="text-xl font-bold mb-4">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {user && (
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wide">Related Order</label>
                                    <select
                                        value={formData.orderId || ''}
                                        onChange={(e) => setFormData({ ...formData, orderId: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all"
                                    >
                                        <option value="">Select Order (Optional)</option>
                                        {orders?.map((order: any) => (
                                            <option key={order.id} value={order.id}>
                                                #{order.displayId || order.id} - {new Date(order.createdAt).toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wide">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all"
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wide">Message</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all resize-none"
                                    placeholder="Tell us more..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-[var(--accent-glow)] flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                            <Send className="w-4 h-4" />
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
