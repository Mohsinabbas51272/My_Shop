import React from 'react';
import { Plus, Pencil, X, Trash2, Loader2, Package } from 'lucide-react';

interface ProductsTabProps {
    editingProduct: any;
    setEditingProduct: (product: any) => void;
    newProduct: any;
    setNewProduct: (product: any) => void;
    uploading: boolean;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    addProductMutation: any;
    updateProductMutation: any;
    deleteProductMutation: any;
    products: any;
    productsLoading: boolean;
    q: string;
    occasion: string;
    currency: string;
    unit: string;
    goldRate: any;
    goldLoading: boolean;
    silverRate: any;
    silverLoading: boolean;
    formatPrice: (price: number) => string;
    calculateDynamicPrice: (product: any, rate: any) => number;
    getImageUrl: (url: string) => string;
    convertTolaToGrams: (tola: number, masha: number, rati: number) => number;
}

const ProductsTab: React.FC<ProductsTabProps> = ({
    editingProduct,
    setEditingProduct,
    newProduct,
    setNewProduct,
    uploading,
    handleFileUpload,
    addProductMutation,
    updateProductMutation,
    deleteProductMutation,
    products,
    productsLoading,
    q,
    occasion,
    currency,
    unit,
    goldRate,
    goldLoading,
    silverRate,
    silverLoading,
    formatPrice,
    calculateDynamicPrice,
    getImageUrl,
    convertTolaToGrams,
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full">
            {/* Add Product Form */}
            <section className="lg:col-span-1">
                <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-2xl md:sticky md:top-24 shadow-xl">
                    <h2 className="text-lg font-bold mb-4 flex items-center justify-between text-[var(--text-main)]">
                        <div className="flex items-center gap-2">
                            {editingProduct ? <Pencil className="w-4 h-4 text-[var(--primary)]" /> : <Plus className="w-4 h-4 text-[var(--primary)]" />}
                            {editingProduct ? 'Edit Product' : 'Add Product'}
                        </div>
                        {editingProduct && (
                            <button
                                onClick={() => {
                                    setEditingProduct(null);
                                    setNewProduct({
                                        name: '',
                                        price: '',
                                        description: '',
                                        image: '',
                                        category: 'Gold',
                                        weightTola: '0',
                                        weightMasha: '0',
                                        weightRati: '0',
                                        occasion: 'Other'
                                    });
                                }}
                                className="p-1 hover:bg-[var(--bg-input)] rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-[var(--text-muted)]" />
                            </button>
                        )}
                    </h2>
                    <div className="space-y-3">
                        {/* Category & Occasion Row */}
                        <div className="flex flex-col sm:flex-row gap-2.5">
                            <div className="flex flex-1 bg-[var(--bg-input)] p-0.5 rounded-lg border border-[var(--border)]">
                                <button
                                    onClick={() => setNewProduct({ ...newProduct, category: 'Gold' })}
                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${newProduct.category === 'Gold' ? 'bg-yellow-600 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                >
                                    Gold
                                </button>
                                <button
                                    onClick={() => setNewProduct({ ...newProduct, category: 'Silver' })}
                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${newProduct.category === 'Silver' ? 'bg-slate-500 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                >
                                    Silver
                                </button>
                            </div>
                            <select
                                className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-2.5 py-2.5 sm:py-0 text-xs font-medium text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--primary)]/50"
                                value={newProduct.occasion}
                                onChange={(e) => setNewProduct({ ...newProduct, occasion: e.target.value })}
                            >
                                <option value="Other">General / Other</option>
                                <option value="Wedding">Wedding</option>
                                <option value="Engagement">Engagement</option>
                                <option value="Gift">Gift</option>
                                <option value="Party">Party</option>
                            </select>
                        </div>

                        {/* Name Input */}
                        <input
                            placeholder="Product Name"
                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2.5 text-xs font-bold text-[var(--text-main)] focus:ring-1 focus:ring-[var(--primary)]/50 outline-none"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        />

                        {/* Weights Grid */}
                        <div className="bg-[var(--bg-input)]/30 p-2.5 rounded-lg border border-[var(--border)] space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Weight Details</label>
                                <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-tighter">
                                    {unit === 'GRAMS' ? `Total: ${convertTolaToGrams(
                                        parseFloat(newProduct.weightTola || '0'),
                                        parseFloat(newProduct.weightMasha || '0'),
                                        parseFloat(newProduct.weightRati || '0')
                                    ).toFixed(3)}g` : `Input: T/M/R`}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-bold uppercase text-[var(--text-muted)] pl-1">Tola</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-md p-2 text-xs text-[var(--text-main)] outline-none text-center font-mono"
                                        value={newProduct.weightTola}
                                        onChange={(e) => setNewProduct({ ...newProduct, weightTola: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-bold uppercase text-[var(--text-muted)] pl-1">Masha</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-md p-2 text-xs text-[var(--text-main)] outline-none text-center font-mono"
                                        value={newProduct.weightMasha}
                                        onChange={(e) => setNewProduct({ ...newProduct, weightMasha: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-bold uppercase text-[var(--text-muted)] pl-1">Rati</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-md p-2 text-xs text-[var(--text-main)] outline-none text-center font-mono"
                                        value={newProduct.weightRati}
                                        onChange={(e) => setNewProduct({ ...newProduct, weightRati: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Making Charges */}
                        <div className="relative">
                            <input
                                placeholder={`Making Charges`}
                                type="number"
                                step="any"
                                min="0"
                                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2.5 text-xs font-bold text-[var(--text-main)] focus:ring-1 focus:ring-[var(--primary)]/50 outline-none pr-8"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest pointer-events-none">
                                {currency}
                            </div>
                        </div>

                        <textarea
                            placeholder="Description (Optional)"
                            rows={3}
                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2.5 text-xs text-[var(--text-main)] focus:ring-1 focus:ring-[var(--primary)]/50 outline-none resize-none"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        />

                        {/* Compact Image Upload */}
                        <div className="flex flex-col sm:flex-row gap-2.5 sm:h-[4.5rem]">
                            <div className="flex-1 min-w-0">
                                <input
                                    placeholder="Image URL"
                                    className="w-full h-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-2.5 text-xs text-[var(--text-main)] focus:ring-1 focus:ring-[var(--primary)]/50 outline-none"
                                    value={newProduct.image}
                                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                                />
                            </div>
                            <div className="shrink-0 w-full sm:w-[4.5rem] h-[4.5rem] relative">
                                {newProduct.image && (newProduct.image.startsWith('/') || newProduct.image.startsWith('http')) ? (
                                    <div className="w-full h-full rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg-input)] relative group">
                                        <img src={getImageUrl(newProduct.image)} alt="Priv" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setNewProduct({ ...newProduct, image: '' })}
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-input)]/50 hover:bg-[var(--bg-input)] hover:border-[var(--primary)]/50 transition-all cursor-pointer">
                                        {uploading ? (
                                            <Loader2 className="w-5 h-5 text-[var(--primary)] animate-spin" />
                                        ) : (
                                            <Plus className="w-5 h-5 text-[var(--text-muted)]" />
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                
                                const productData = {
                                    ...newProduct,
                                    price: Math.round(parseFloat(newProduct.price) || 0),
                                    weightTola: parseFloat(newProduct.weightTola || '0'),
                                    weightMasha: parseFloat(newProduct.weightMasha || '0'),
                                    weightRati: parseFloat(newProduct.weightRati || '0')
                                };
                                if (editingProduct) {
                                    updateProductMutation.mutate({ id: editingProduct.id, ...productData });
                                } else {
                                    addProductMutation.mutate(productData);
                                }
                            }}
                            disabled={addProductMutation.isPending || updateProductMutation.isPending || uploading || !newProduct.image}
                            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-glow)] disabled:opacity-50 text-xs uppercase tracking-widest"
                        >
                            {(addProductMutation.isPending || updateProductMutation.isPending) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                editingProduct ? 'Update Product' : 'Create Product'
                            )}
                        </button>
                    </div>
                </div>
            </section>

            {/* Inventory Management */}
            <section className="lg:col-span-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                        <Package className="w-5 h-5 text-[var(--primary)]" />
                        Inventory Management
                    </h2>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-x-auto text-sm uppercase font-bold tracking-widest text-[var(--text-muted)] shadow-xl">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-[var(--bg-input)] text-[var(--text-muted)]">
                            <tr>
                                <th className="p-4">Image</th>
                                <th className="p-4">Product</th>
                                <th className="p-4">Weight</th>
                                <th className="p-4">Price ({currency})</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {productsLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center uppercase tracking-widest opacity-50">Loading...</td></tr>
                            ) : (products?.items || [])
                                .filter((p: any) => {
                                    const matchesSearch = !q || p.name?.toLowerCase().includes(q.toLowerCase()) || p.category?.toLowerCase().includes(q.toLowerCase());
                                    const matchesOccasion = occasion === 'All' || p.occasion === occasion;
                                    return matchesSearch && matchesOccasion;
                                })
                                .map((p: any) => (
                                    <tr key={p.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                        <td className="p-4">
                                            <div className="w-12 h-12 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] overflow-hidden">
                                                <img src={getImageUrl(p.image)} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="p-4 text-[var(--text-main)] normal-case tracking-normal font-semibold">{p.name}</td>
                                        <td className="p-4 text-[var(--text-muted)] text-[10px] whitespace-nowrap">
                                            <div className="flex flex-col">
                                                {unit === 'GRAMS' ? (
                                                    <span className="text-[10px] font-black text-[var(--primary)]">
                                                        {convertTolaToGrams(p.weightTola, p.weightMasha, p.weightRati).toFixed(3)}g
                                                    </span>
                                                ) : (
                                                    <div>
                                                        {p.weightTola > 0 && <span>{p.weightTola}T </span>}
                                                        {p.weightMasha > 0 && <span>{p.weightMasha}M </span>}
                                                        {p.weightRati > 0 && <span>{p.weightRati}R</span>}
                                                        {(!p.weightTola && !p.weightMasha && !p.weightRati) && '-'}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-[var(--primary)] font-black">
                                            {p.category === 'Silver'
                                                ? (silverLoading ? '---' : formatPrice(calculateDynamicPrice(p, silverRate)))
                                                : (goldLoading ? '---' : formatPrice(calculateDynamicPrice(p, goldRate)))
                                            }
                                            {((p.weightTola || 0) + (p.weightMasha || 0) + (p.weightRati || 0) > 0) && (
                                                <span className="block text-[8px] text-[var(--text-muted)] uppercase tracking-tighter opacity-70">
                                                    Market Based
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingProduct(p);
                                                        setNewProduct({
                                                            name: p.name || '',
                                                            price: p.price?.toString() || '',
                                                            description: p.description || '',
                                                            image: p.image || '',
                                                            category: p.category || 'Gold',
                                                            occasion: p.occasion || 'Other',
                                                            weightTola: p.weightTola?.toString() || '0',
                                                            weightMasha: p.weightMasha?.toString() || '0',
                                                            weightRati: p.weightRati?.toString() || '0'
                                                        });
                                                    }}
                                                    className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                                                    title="Edit Product"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => deleteProductMutation.mutate(p.id)}
                                                    className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {productsLoading ? (
                        <div className="p-12 text-center text-[var(--text-muted)] uppercase tracking-widest text-xs">Loading Inventory...</div>
                    ) : (products?.items || [])
                        .filter((p: any) => {
                            const matchesSearch = !q || p.name?.toLowerCase().includes(q.toLowerCase()) || p.category?.toLowerCase().includes(q.toLowerCase());
                            const matchesOccasion = occasion === 'All' || p.occasion === occasion;
                            return matchesSearch && matchesOccasion;
                        })
                        .map((p: any) => (
                            <div key={p.id} className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-2xl shadow-lg relative h-full">
                                <div className="flex gap-4 mb-4">
                                    <img src={getImageUrl(p.image)} alt="" className="w-20 h-20 rounded-xl object-cover bg-[var(--bg-input)]" />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-[var(--text-main)] mb-1">{p.name}</h3>
                                        <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold text-[var(--text-muted)]">
                                            {unit === 'GRAMS' ? (
                                                <span className="px-1.5 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded border border-[var(--primary)]/20">
                                                    {convertTolaToGrams(p.weightTola, p.weightMasha, p.weightRati).toFixed(3)}g
                                                </span>
                                            ) : (
                                                <>
                                                    {p.weightTola > 0 && <span className="px-1.5 py-0.5 bg-[var(--bg-input)] rounded border border-[var(--border)]">{p.weightTola} Tola</span>}
                                                    {p.weightMasha > 0 && <span className="px-1.5 py-0.5 bg-[var(--bg-input)] rounded border border-[var(--border)]">{p.weightMasha} Masha</span>}
                                                    {p.weightRati > 0 && <span className="px-1.5 py-0.5 bg-[var(--bg-input)] rounded border border-[var(--border)]">{p.weightRati} Rati</span>}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]/50">
                                    <div>
                                        <div className="text-[var(--primary)] font-black text-lg leading-none">
                                            {p.category === 'Silver'
                                                ? (silverLoading ? '---' : formatPrice(calculateDynamicPrice(p, silverRate)))
                                                : (goldLoading ? '---' : formatPrice(calculateDynamicPrice(p, goldRate)))
                                            }
                                        </div>
                                        {((p.weightTola || 0) + (p.weightMasha || 0) + (p.weightRati || 0) > 0) && (
                                            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-tight font-bold opacity-60">Market Based</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingProduct(p);
                                                setNewProduct({
                                                    name: p.name || '',
                                                    price: p.price?.toString() || '',
                                                    description: p.description || '',
                                                    image: p.image || '',
                                                    category: p.category || 'Gold',
                                                    occasion: p.occasion || 'Other',
                                                    weightTola: p.weightTola?.toString() || '0',
                                                    weightMasha: p.weightMasha?.toString() || '0',
                                                    weightRati: p.weightRati?.toString() || '0'
                                                });
                                            }}
                                            className="p-2.5 bg-[var(--bg-input)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] border border-[var(--border)] transition-all active:scale-95"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => deleteProductMutation.mutate(p.id)}
                                            className="p-2.5 bg-red-500/5 rounded-xl text-red-500 hover:bg-red-500 hover:text-white border border-red-500/10 transition-all active:scale-95"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </section>
        </div>
    );
};

export default ProductsTab;
