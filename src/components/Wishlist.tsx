import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import Navbar from './Navbar';
import { ShoppingBag, ArrowLeft, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../lib/api';
import { toast } from '../store/useToastStore';
import { motion } from 'framer-motion';

export default function Wishlist() {
    const { items, toggleItem } = useWishlistStore();
    const { addItem } = useCartStore();
    const { formatPrice } = useCurrencyStore();

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${IMAGE_BASE_URL}${url}`;
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-['Outfit']">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/user/dashboard" className="p-2 hover:bg-[var(--bg-card)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold text-[var(--text-main)]">Your Wishlist</h1>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)] bg-[var(--bg-card)]/10 border-2 border-dashed border-[var(--border)] rounded-[2.5rem] animate-in fade-in zoom-in duration-500">
                        <div className="p-8 bg-[var(--bg-input)]/50 rounded-full mb-6 relative">
                            <Heart className="w-16 h-16 opacity-20" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -z-10" />
                        </div>
                        <h2 className="text-2xl font-black mb-2 text-[var(--text-main)]">Your heart is empty</h2>
                        <p className="mb-8 font-medium opacity-60">Looks like you haven't saved any treasures to your wishlist yet.</p>
                        <Link
                            to="/dashboard"
                            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black px-10 py-4 rounded-2xl transition-all shadow-lg shadow-[var(--primary)]/20 active:scale-95 uppercase tracking-widest text-xs"
                        >
                            Explore Collection
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((product) => (
                            <motion.div
                                layout
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] overflow-hidden transition-all hover:border-[var(--primary)]/30 hover:shadow-2xl flex flex-col h-full relative"
                            >
                                <div className="aspect-[4/5] overflow-hidden relative group-hover:after:opacity-100 after:opacity-0 after:absolute after:inset-0 after:bg-black/5 after:transition-opacity">
                                    <img
                                        src={getImageUrl(product.image)}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <button
                                        className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-red-500 shadow-lg active:scale-90 transition-all z-10"
                                        onClick={() => {
                                            toggleItem(product);
                                            toast.success('Removed from Wishlist');
                                        }}
                                    >
                                        <Heart className="w-5 h-5 fill-current" />
                                    </button>
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex-1 mb-6">
                                        <h3 className="text-lg font-black text-[var(--text-main)] tracking-tight line-clamp-1 mb-1">{product.name}</h3>
                                        <div className="text-xl font-black text-[var(--primary)] tracking-tight">
                                            {formatPrice(product.price)}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <button
                                            onClick={() => {
                                                addItem(product);
                                                toast.success('Added to Bag');
                                            }}
                                            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-[var(--primary)]/10 flex items-center justify-center gap-2 active:scale-[0.98] uppercase tracking-[0.1em] text-[10px]"
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            Transfer to Bag
                                        </button>

                                        <button
                                            onClick={() => {
                                                toggleItem(product);
                                                toast.success('Removed from Wishlist');
                                            }}
                                            className="w-full py-3 text-[var(--text-muted)] hover:text-red-500 font-black text-[9px] uppercase tracking-[0.2em] transition-all"
                                        >
                                            Delete Archetype
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
