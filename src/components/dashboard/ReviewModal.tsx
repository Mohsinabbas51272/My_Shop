import React from 'react';
import { motion } from 'framer-motion';
import { X, Star, Plus, Loader2 } from 'lucide-react';
import { IMAGE_BASE_URL } from '../../lib/api';

interface ReviewModalProps {
    reviewingProduct: any;
    reviewData: any;
    setReviewData: (data: any) => void;
    submitReviewMutation: any;
    onClose: () => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/400';
    if (url.startsWith('http')) return url;
    return `${IMAGE_BASE_URL}${url}`;
};

const ReviewModal: React.FC<ReviewModalProps> = ({
    reviewingProduct,
    reviewData,
    setReviewData,
    submitReviewMutation,
    onClose,
    handleImageUpload
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
                className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl p-8"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight">Rate this Masterpiece</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-input)] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-8 p-4 bg-[var(--bg-input)]/50 rounded-2xl border border-[var(--border)]">
                    <img src={getImageUrl(reviewingProduct.image)} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                        <h3 className="font-bold text-[13px] text-[var(--text-main)]">{reviewingProduct.name}</h3>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Share your experience with us</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button
                                key={s}
                                onClick={() => setReviewData({ ...reviewData, rating: s })}
                                className="p-1 transition-transform hover:scale-125 active:scale-95"
                            >
                                <Star className={`w-8 h-8 ${s <= reviewData.rating ? 'fill-yellow-500 text-yellow-500' : 'text-[var(--text-muted)] opacity-30'}`} />
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Your Thoughts</label>
                        <textarea
                            value={reviewData.comment}
                            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                            placeholder="Craft your story about this piece..."
                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[1.5rem] p-5 text-sm font-medium focus:border-[var(--primary)]/50 focus:ring-4 focus:ring-[var(--primary)]/5 outline-none transition-all h-32 resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Gallery (Optional)</label>
                        <div className="flex flex-wrap gap-2">
                            {reviewData.images.map((img: string, idx: number) => (
                                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[var(--border)]">
                                    <img src={getImageUrl(img)} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setReviewData({ ...reviewData, images: reviewData.images.filter((_: any, i: number) => i !== idx) })}
                                        className="absolute top-0.5 right-0.5 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {reviewData.images.length < 3 && (
                                <label className="w-16 h-16 rounded-xl border border-dashed border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-input)] transition-all">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <Plus className="w-5 h-5 text-[var(--text-muted)]" />
                                </label>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => submitReviewMutation.mutate({
                            productId: reviewingProduct.id,
                            ...reviewData
                        })}
                        disabled={submitReviewMutation.isPending || !reviewData.comment.trim()}
                        className="w-full py-4 bg-[var(--primary)] text-white font-black rounded-[1.5rem] uppercase tracking-widest text-xs shadow-xl shadow-[var(--primary)]/20 hover:bg-[var(--primary-hover)] transition-all active:scale-95 disabled:opacity-50"
                    >
                        {submitReviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                        Publish Review
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ReviewModal;
