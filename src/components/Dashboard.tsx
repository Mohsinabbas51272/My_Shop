import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useWeightStore } from '../store/useWeightStore';
import Navbar from './Navbar';
import ProductDetailsModal from './ProductDetailsModal';
import Policy from './Policy';
import { useCartStore } from '../store/useCartStore';
import OrderReceipt from './OrderReceipt';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useSearchStore } from '../store/useSearchStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { toast } from '../store/useToastStore';

// Dashboard Components
import DashboardHeader from './dashboard/DashboardHeader';
import LegalNoticeBanner from './dashboard/LegalNoticeBanner';
import ShopTab from './dashboard/ShopTab';
import ComplaintsTab from './dashboard/ComplaintsTab';
import OrdersTab from './dashboard/OrdersTab';
import LegalTab from './dashboard/LegalTab';
import DisputeModal from './dashboard/DisputeModal';
import OrderEditModal from './dashboard/OrderEditModal';
import ReviewModal from './dashboard/ReviewModal';
import FirReceiptModal from './dashboard/FirReceiptModal';

export default function Dashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { isInWishlist, toggleItem } = useWishlistStore();
    const { addItem } = useCartStore();
    const { formatPrice } = useCurrencyStore();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'shop';
    const selectedProductId = searchParams.get('product');

    // Shop discovery controls from global store
    const { q, sort, minPrice, maxPrice, metalCategory, setMetalCategory, occasion } = useSearchStore();
    const { unit, toggleUnit } = useWeightStore();
    const [page, setPage] = useState(1);

    const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
        queryKey: ['products', q, sort, page, minPrice, maxPrice, metalCategory, occasion],
        queryFn: async () => (
            await api.get('/products', {
                params: {
                    q: q || undefined,
                    sort,
                    page,
                    limit: 24,
                    category: metalCategory,
                    occasion: occasion !== 'All' ? occasion : undefined,
                    minPrice: minPrice ? Number(minPrice) : undefined,
                    maxPrice: maxPrice ? Number(maxPrice) : undefined,
                }
            })
        ).data,
    });

    // Instead of local state, we get the product from the products data if it matches the ID
    const [selectedProduct, setSelectedProductState] = useState<any>(null);

    const setSelectedProduct = (product: any) => {
        if (product) {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set('product', product.id.toString());
                return newParams;
            });
            setSelectedProductState(product);
        } else {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.delete('product');
                return newParams;
            });
            setSelectedProductState(null);
        }
    };

    // Keep state in sync with URL (for back button support)
    useEffect(() => {
        if (selectedProductId && productsData?.items) {
            const p = productsData.items.find((p: any) => p.id.toString() === selectedProductId);
            if (p) setSelectedProductState(p);
        } else if (!selectedProductId) {
            setSelectedProductState(null);
        }
    }, [selectedProductId, productsData]);

    const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
    const [disputingOrder, setDisputingOrder] = useState<any>(null);
    const [disputeData, setDisputeData] = useState({ subject: '', message: '', evidence: '' });
    const [uploadingEvidence, setUploadingEvidence] = useState(false);
    const [editFormData, setEditFormData] = useState<any>({ items: [] });
    const [viewingReceipt, setViewingReceipt] = useState<any>(null);
    const [viewingFir, setViewingFir] = useState<any>(null);
    const [reviewingProduct, setReviewingProduct] = useState<any>(null);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '', images: [] as string[] });


    const updateItemQuantity = (id: string, delta: number) => {
        setEditFormData((prev: any) => {
            const updatedItems = prev.items.map((item: any) => {
                if (item.id === id) {
                    const newQty = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            });
            return { ...prev, items: updatedItems };
        });
    };

    const removeItemFromEdit = (id: string) => {
        setEditFormData((prev: any) => {
            const updatedItems = prev.items.filter((item: any) => item.id !== id);
            return { ...prev, items: updatedItems };
        });
    };

    useEffect(() => {
        // Reset to first page whenever filters change
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, sort, minPrice, maxPrice, metalCategory, occasion]);

    useEffect(() => {
        if (disputingOrder) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [disputingOrder]);



    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['orders-me', user?.id],
        queryFn: async () => (await api.get(`/orders?userId=${user?.id}`)).data,
        enabled: !!user?.id && activeTab === 'orders',
        staleTime: 15000,
        refetchInterval: 30000,
    });
    const orders = ordersData?.items || [];

    const { data: complaints, isLoading: complaintsLoading } = useQuery({
        queryKey: ['complaints-me', user?.id],
        queryFn: async () => (await api.get(`/complaints?userId=${user?.id}`)).data,
        enabled: !!user?.id && activeTab === 'complaints',
        staleTime: 30000,
        refetchInterval: 60000,
    });

    const { data: disputes, isLoading: disputesUserLoading } = useQuery({
        queryKey: ['disputes-me', user?.id],
        queryFn: async () => (await api.get('/disputes')).data,
        enabled: !!user?.id && activeTab === 'complaints',
        staleTime: 30000,
        refetchInterval: 60000,
    });

    const { data: notices, isLoading: noticesLoading } = useQuery({
        queryKey: ['notices-me', user?.id],
        queryFn: async () => (await api.get('/users/my-notices')).data,
        enabled: !!user?.id,
        staleTime: 60000,
        refetchInterval: 120000,
    });

    const { data: rates, isLoading: ratesLoading } = useQuery({
        queryKey: ['commodity-rates'],
        queryFn: async () => {
            try {
                // Fetch all in parallel
                const [goldRes, silverRes, detailedRes] = await Promise.all([
                    api.get('/commodity/gold-rate'),
                    api.get('/commodity/silver-rate'),
                    api.get('/commodity/detailed-rates')
                ]);

                return {
                    gold: goldRes.data?.price ? parseFloat(goldRes.data.price.toString().replace(/,/g, '')) : 0,
                    silver: silverRes.data?.price ? parseFloat(silverRes.data.price.toString().replace(/,/g, '')) : 0,
                    goldRaw: goldRes.data,
                    silverRaw: silverRes.data,
                    detailedResult: detailedRes.data
                };
            } catch (error) {
                console.error('Failed to fetch rates', error);
                return { gold: 0, silver: 0, goldRaw: { price: 0 }, silverRaw: { price: 0 } };
            }
        },
        refetchInterval: 15000, // 15 seconds - fast rate updates
        staleTime: 10000,
        retry: 3,
    });

    // Keeping separate aliases for compatibility if used elsewhere in the component
    const goldRate = rates?.goldRaw;
    const silverRate = rates?.silverRaw;
    const goldLoading = ratesLoading;
    const silverLoading = ratesLoading;

    const deleteOrderMutation = useMutation({
        mutationFn: (orderId: number) => api.delete(`/orders/${orderId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders-me', user?.id] });
            toast.success('Order deleted successfully');
        },
        onError: () => toast.error('Failed to delete order'),
    });

    const editOrderMutation = useMutation({
        mutationFn: ({ orderId, data }: { orderId: number; data: any }) =>
            api.patch(`/orders/${orderId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders-me', user?.id] });
            setEditingOrderId(null);
            toast.success('Order updated successfully');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update order'),
    });

    const disputeOrderMutation = useMutation({
        mutationFn: (data: any) => api.post('/disputes', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders-me', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['disputes-me', user?.id] });
            setDisputingOrder(null);
            setDisputeData({ subject: '', message: '', evidence: '' });
            toast.success('Dispute submitted successfully. Super Admin will investigate.');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit dispute'),
    });

    const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploadingEvidence(true);
        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setDisputeData(prev => ({ ...prev, evidence: response.data.url }));
            toast.success('Evidence uploaded successfully');
        } catch (error) {
            console.error('Evidence upload failed', error);
            toast.error('Failed to upload evidence');
        } finally {
            setUploadingEvidence(false);
        }
    };

    const submitReviewMutation = useMutation({
        mutationFn: (data: any) => api.post('/reviews', data),
        onSuccess: () => {
            setReviewingProduct(null);
            setReviewData({ rating: 5, comment: '', images: [] });
            toast.success('Review submitted! It will appear after admin approval.');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit review'),
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setReviewData(prev => ({
                ...prev,
                images: [...prev.images, response.data.url]
            }));
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Image upload failed', error);
            toast.error('Failed to upload image');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-['Outfit']">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                <DashboardHeader
                    metalCategory={metalCategory}
                    setMetalCategory={setMetalCategory}
                    rates={rates}
                    ratesLoading={ratesLoading}
                    formatPrice={formatPrice}
                    user={user}
                />

                <LegalNoticeBanner
                    notices={notices}
                    activeTab={activeTab}
                    user={user}
                    setSearchParams={setSearchParams}
                    navigate={navigate}
                />

                {/* Content Area */}
                <div className="min-h-[60vh]">
                    {activeTab === 'shop' && (
                        <ShopTab
                            productsLoading={productsLoading}
                            ratesLoading={ratesLoading}
                            productsError={productsError}
                            productsData={productsData}
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
                            page={page}
                            setPage={setPage}
                        />
                    )}

                    {activeTab === 'orders' && (
                        <OrdersTab
                            ordersLoading={ordersLoading}
                            orders={orders}
                            formatPrice={formatPrice}
                            setSearchParams={setSearchParams}
                            setViewingReceipt={setViewingReceipt}
                            setEditingOrderId={setEditingOrderId}
                            setEditFormData={setEditFormData}
                            deleteOrderMutation={deleteOrderMutation}
                            setDisputingOrder={setDisputingOrder}
                            setDisputeData={setDisputeData}
                            setReviewingProduct={setReviewingProduct}
                        />
                    )}

                    {activeTab === 'complaints' && (
                        <ComplaintsTab
                            complaintsLoading={complaintsLoading}
                            complaints={complaints}
                            disputesUserLoading={disputesUserLoading}
                            disputes={disputes}
                            setDisputingOrder={setDisputingOrder}
                            setDisputeData={setDisputeData}
                        />
                    )}

                    {activeTab === 'legal' && (
                        <LegalTab
                            noticesLoading={noticesLoading}
                            notices={notices}
                            setViewingFir={setViewingFir}
                        />
                    )}

                    {activeTab === 'policy' && (
                        <Policy />
                    )}
                </div>
            </main>

            {/* Modals */}
            {/* Product Details Modal - Sync with URL product param */}
            <AnimatePresence>
                {selectedProduct && selectedProductId && (
                    <ProductDetailsModal
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                    />
                )}

                {disputingOrder && (
                    <DisputeModal
                        disputingOrder={disputingOrder}
                        disputeData={disputeData}
                        setDisputeData={setDisputeData}
                        handleEvidenceUpload={handleEvidenceUpload}
                        uploadingEvidence={uploadingEvidence}
                        disputeOrderMutation={disputeOrderMutation}
                        onClose={() => setDisputingOrder(null)}
                    />
                )}

                {editingOrderId && (
                    <OrderEditModal
                        editingOrderId={editingOrderId}
                        editFormData={editFormData}
                        setEditFormData={setEditFormData}
                        updateItemQuantity={updateItemQuantity}
                        removeItemFromEdit={removeItemFromEdit}
                        formatPrice={formatPrice}
                        editOrderMutation={editOrderMutation}
                        onClose={() => setEditingOrderId(null)}
                    />
                )}

                {reviewingProduct && (
                    <ReviewModal
                        reviewingProduct={reviewingProduct}
                        reviewData={reviewData}
                        setReviewData={setReviewData}
                        submitReviewMutation={submitReviewMutation}
                        onClose={() => setReviewingProduct(null)}
                        handleImageUpload={handleImageUpload}
                    />
                )}

                {viewingFir && (
                    <FirReceiptModal
                        viewingFir={viewingFir}
                        user={user}
                        onClose={() => setViewingFir(null)}
                    />
                )}
                {viewingReceipt && (
                    <OrderReceipt
                        order={viewingReceipt}
                        formatPrice={formatPrice}
                        onClose={() => setViewingReceipt(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
