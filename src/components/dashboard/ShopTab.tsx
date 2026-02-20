import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { PackageX } from 'lucide-react';
import ProductCard from './ProductCard';

interface ShopTabProps {
    productsLoading: boolean;
    ratesLoading: boolean;
    productsError: any;
    productsData: any;
    setSelectedProduct: (product: any) => void;
    isInWishlist: (id: number) => boolean;
    toggleItem: (product: any) => void;
    goldRate: any;
    silverRate: any;
    formatPrice: (price: number) => string;
    unit: string;
    toggleUnit: () => void;
    addItem: (product: any) => void;
    navigate: (path: string) => void;
    silverLoading: boolean;
    goldLoading: boolean;
    rates: any;
    page: number;
    setPage: (updater: (p: number) => number) => void;
}

const ShopTab: React.FC<ShopTabProps> = ({
    productsLoading,
    ratesLoading,
    productsError,
    productsData,
    setSelectedProduct,
    isInWishlist,
    toggleItem,
    goldRate,
    silverRate,
    formatPrice,
    unit,
    toggleUnit,
    addItem,
    navigate,
    silverLoading,
    goldLoading,
    rates,
    page,
    setPage
}) => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {(productsLoading || ratesLoading) ? (
                <div className="responsive-grid">
                    {Array.from({ length: 8 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl"
                        >
                            <div className="relative aspect-[4/3] sm:aspect-square bg-[var(--bg-input)]/50 animate-pulse" />
                            <div className="p-5 space-y-3">
                                <div className="h-4 w-3/4 bg-[var(--bg-input)]/70 rounded animate-pulse" />
                                <div className="h-4 w-1/3 bg-[var(--bg-input)]/70 rounded animate-pulse" />
                                <div className="h-10 w-full bg-[var(--bg-input)]/70 rounded-xl animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : productsError ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-8 rounded-2xl text-center">
                    <p>Failed to load products. Please check if the backend is running.</p>
                </div>
            ) : productsData?.items?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)] bg-[var(--bg-card)]/10 border-2 border-dashed border-[var(--border)] rounded-[2.5rem]">
                    <PackageX className="w-16 h-16 mb-4 opacity-10" />
                    <p className="font-bold text-lg">No items found</p>
                    <p className="text-sm">Try adjusting your search or category.</p>
                </div>
            ) : (
                <>
                    <div className="responsive-grid">
                        <AnimatePresence mode='wait'>
                            {productsData?.items?.map((product: any, index: number) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    index={index}
                                    setSelectedProduct={setSelectedProduct}
                                    isInWishlist={isInWishlist}
                                    toggleItem={toggleItem}
                                    goldRate={goldRate}
                                    silverRate={silverRate}
                                    formatPrice={formatPrice}
                                    unit={unit}
                                    toggleUnit={toggleUnit}
                                    addItem={addItem}
                                    navigate={navigate}
                                    silverLoading={silverLoading}
                                    goldLoading={goldLoading}
                                    rates={rates}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-3">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="px-4 py-2 rounded-lg font-bold text-sm bg-[var(--bg-card)] border border-[var(--border)] disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <div className="text-sm text-[var(--text-muted)] font-bold">
                            Page {productsData?.page || page} of {productsData?.totalPages || 1}
                        </div>
                        <button
                            onClick={() => setPage((p) => {
                                const totalPages = productsData?.totalPages || 1;
                                return Math.min(totalPages, p + 1);
                            })}
                            disabled={page >= (productsData?.totalPages || 1)}
                            className="px-4 py-2 rounded-lg font-bold text-sm bg-[var(--bg-card)] border border-[var(--border)] disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShopTab;
