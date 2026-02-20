import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api, { IMAGE_BASE_URL } from '../lib/api';
import { calculateDynamicPrice, convertTolaToGrams } from '../lib/pricing';
import Navbar from './Navbar';
import GoldCalculator from './GoldCalculator';
import OrderReceipt from './OrderReceipt';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { toast } from '../store/useToastStore';
import { useAuthStore } from '../store/useAuthStore';
import { useWeightStore } from '../store/useWeightStore';
import { useSearchStore } from '../store/useSearchStore';
import { X } from 'lucide-react';

// Sub-components
import AdminSidebar from './admin/AdminSidebar';
import AdminHeader from './admin/AdminHeader';
import AdminLegalBanner from './admin/AdminLegalBanner';
import RateControlTab from './admin/RateControlTab';
import ProductsTab from './admin/ProductsTab';
import OrdersTab from './admin/OrdersTab';
import UsersTab from './admin/UsersTab';
import SupportTab from './admin/SupportTab';
import LocalSourcesTab from './admin/LocalSourcesTab';
import UserDetailsModal from './admin/UserDetailsModal';
import ComplaintRespondModal from './admin/ComplaintRespondModal';
import DisputeRespondModal from './admin/DisputeRespondModal';
import FirRegistryModal from './admin/FirRegistryModal';
import FirDetailModal from './admin/FirDetailModal';

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const { unit } = useWeightStore();
    const { q, occasion } = useSearchStore();
    const queryClient = useQueryClient();
    const { currency, formatPrice } = useCurrencyStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        category: 'Gold',
        occasion: 'Other',
        weightTola: '0',
        weightMasha: '0',
        weightRati: '0'
    });
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as 'products' | 'orders' | 'users' | 'support' | 'rates' | 'local') || 'products';
    const supportSubTab = (searchParams.get('sub') as 'queries' | 'disputes' | 'chats' | 'reviews' | 'audit') || 'queries';

    const setActiveTab = (tab: string) => {
        setSearchParams({ tab });
    };

    const setSupportSubTab = (sub: string) => {
        setSearchParams({ tab: 'support', sub });
    };

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
    const [selectedDispute, setSelectedDispute] = useState<any>(null);
    const [respondText, setRespondText] = useState('');
    const [isCalcOpen, setIsCalcOpen] = useState(false);
    const [viewingReceipt, setViewingReceipt] = useState<any>(null);
    const [firModalUser, setFirModalUser] = useState<any>(null);
    const [firData, setFirData] = useState({ violation: '', details: '' });
    const [viewingFirLog, setViewingFirLog] = useState<any>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const { data: dashboardCounts } = useQuery({
        queryKey: ['dashboard-counts'],
        queryFn: async () => (await api.get('/complaints/counts')).data,
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: complaints, isLoading: complaintsLoading } = useQuery({
        queryKey: ['complaints'],
        queryFn: async () => (await api.get('/complaints')).data,
        enabled: activeTab === 'support' && supportSubTab === 'queries',
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: products, isLoading: productsLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => (await api.get('/products', { params: { page: 1, limit: 100 } })).data,
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => (await api.get('/orders')).data,
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => (await api.get('/users')).data,
        enabled: activeTab === 'users' || (activeTab === 'support' && supportSubTab === 'chats'),
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: disputes, isLoading: disputesLoading } = useQuery({
        queryKey: ['disputes'],
        queryFn: async () => (await api.get('/disputes')).data,
        enabled: activeTab === 'support' && supportSubTab === 'disputes' || activeTab === 'orders',
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: logs, isLoading: logsLoading } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: async () => (await api.get('/audit')).data,
        enabled: activeTab === 'support' && supportSubTab === 'audit',
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: adminReviews, isLoading: reviewsLoading } = useQuery({
        queryKey: ['admin-reviews'],
        queryFn: async () => (await api.get('/reviews/admin/all')).data,
        enabled: activeTab === 'support' && supportSubTab === 'reviews',
        refetchInterval: 10000,
    });

    const { data: notices } = useQuery({
        queryKey: ['notices-me', user?.id],
        queryFn: async () => (await api.get('/users/my-notices')).data,
        enabled: !!user?.id,
        refetchInterval: 10000,
    });

    const approveReviewMutation = useMutation({
        mutationFn: (id: number) => api.patch(`/reviews/approve/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            toast.success('Review approved and live!');
        },
        onError: () => toast.error('Failed to approve review'),
    });

    const deleteReviewMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/reviews/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            toast.success('Review deleted');
        },
        onError: () => toast.error('Failed to delete review'),
    });

    const { data: goldRate, isLoading: goldLoading } = useQuery({
        queryKey: ['gold-rate'],
        queryFn: async () => (await api.get('/commodity/gold-rate')).data,
        refetchInterval: 3600000,
    });

    const { data: unreadChatCount } = useQuery({
        queryKey: ['unread-chat-count'],
        queryFn: async () => (await api.get('/chats/unread-count')).data,
        refetchInterval: 5000,
    });

    const { data: silverRate, isLoading: silverLoading } = useQuery({
        queryKey: ['silver-rate'],
        queryFn: async () => (await api.get('/commodity/silver-rate')).data,
        refetchInterval: 3600000,
    });

    const { data: rateSettings } = useQuery({
        queryKey: ['rate-settings'],
        queryFn: async () => (await api.get('/admin/rate-settings')).data,
    });

    const { data: detailedRates, isLoading: detailedLoading } = useQuery({
        queryKey: ['detailed-rates'],
        queryFn: async () => (await api.get('/commodity/detailed-rates')).data,
        enabled: true,
        refetchInterval: 10000,
    });

    const addProductMutation = useMutation({
        mutationFn: (product: any) => api.post('/products', product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setNewProduct({
                name: '',
                price: '',
                description: '',
                image: '',
                category: 'Gold',
                occasion: 'Other',
                weightTola: '0',
                weightMasha: '0',
                weightRati: '0'
            });
            toast.success('Product created successfully!');
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/products/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setEditingProduct(null);
            setNewProduct({
                name: '',
                price: '',
                description: '',
                image: '',
                category: 'Gold',
                occasion: 'Other',
                weightTola: '0',
                weightMasha: '0',
                weightRati: '0'
            });
            toast.success('Product updated successfully!');
        },
        onError: () => toast.error('Failed to update product'),
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted successfully!');
        },
        onError: () => toast.error('Failed to delete product'),
    });

    const updateOrderStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/orders/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Order status updated!');
        },
        onError: () => toast.error('Failed to update order status'),
    });

    const deleteOrderMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/orders/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Order deleted successfully!');
        },
        onError: () => toast.error('Failed to delete order'),
    });

    const sendReceiptMutation = useMutation({
        mutationFn: (id: number) => api.patch(`/admin/orders/${id}/send-receipt`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Final Receipt sent to user dashboard!');
        },
        onError: () => toast.error('Failed to send receipt'),
    });

    const respondToComplaintMutation = useMutation({
        mutationFn: ({ id, response }: { id: number; response: string }) =>
            api.patch(`/complaints/${id}/respond`, { response }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === 'complaints-me'
            });
            setSelectedComplaint(null);
            setRespondText('');
            toast.success('Response sent successfully!');
        },
        onError: () => toast.error('Failed to send response'),
    });

    const deleteComplaint = useMutation({
        mutationFn: (id: number) => api.delete(`/complaints/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
            toast.success('Query deleted successfully');
        },
        onError: () => toast.error('Failed to delete query'),
    });

    const updateRateSettingsMutation = useMutation({
        mutationFn: (data: any) => api.patch('/admin/rate-settings', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rate-settings'] });
            queryClient.invalidateQueries({ queryKey: ['gold-rate'] });
            queryClient.invalidateQueries({ queryKey: ['silver-rate'] });
            toast.success('Rates adjusted successfully!');
        },
        onError: () => toast.error('Failed to update rates'),
    });

    const verifyUser = useMutation({
        mutationFn: (id: number) => api.post(`/users/${id}/verify`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User verified successfully!');
        },
        onError: () => toast.error('Failed to verify user'),
    });

    const freezeUser = useMutation({
        mutationFn: (id: number) => api.post(`/users/${id}/freeze`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User account frozen successfully!');
        },
        onError: () => toast.error('Failed to freeze user'),
    });

    const blockUser = useMutation({
        mutationFn: (id: number) => api.post(`/users/${id}/block`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User blocked successfully!');
        },
        onError: () => toast.error('Failed to block user'),
    });

    const registerFIR = useMutation({
        mutationFn: ({ userId, violation, details }: { userId: number; violation: string; details: string }) =>
            api.post(`/users/${userId}/register-fir`, { violation, details }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
            setFirModalUser(null);
            setFirData({ violation: '', details: '' });
            toast.success('FIR Record Logged Successfully');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to register FIR'),
    });

    const deleteUser = useMutation({
        mutationFn: (id: number) => api.delete(`/users/${id}`),
        onSuccess: () => {
            toast.success('User permanently removed from system.');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete user'),
    });

    const confirmPayment = useMutation({
        mutationFn: (id: number) => api.patch(`/orders/${id}/confirm-payment`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Payment confirmed!');
        },
        onError: () => toast.error('Failed to confirm payment'),
    });

    const updateDispute = useMutation({
        mutationFn: ({ id, status, response }: { id: number, status?: string, response?: string }) =>
            response
                ? api.patch(`/disputes/${id}/response`, { response })
                : api.patch(`/disputes/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disputes'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
            setSelectedDispute(null);
            setRespondText('');
            toast.success('Dispute updated successfully');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update dispute'),
    });

    const deleteDispute = useMutation({
        mutationFn: (id: number) => api.delete(`/disputes/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disputes'] });
            toast.success('Dispute deleted successfully');
        },
        onError: () => toast.error('Failed to delete dispute'),
    });

    const deleteAllLogs = useMutation({
        mutationFn: () => api.delete('/audit'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
            toast.success('All audit logs cleared!');
        },
        onError: () => toast.error('Failed to delete logs'),
    });

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${IMAGE_BASE_URL}${url}`;
    };

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
            setNewProduct({ ...newProduct, image: response.data.url });
        } catch (error) {
            console.error('Upload failed', error);
            toast.error('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-['Outfit']">
            <Navbar />

            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-56px)] relative">
                <AdminSidebar
                    activeTab={activeTab}
                    setActiveTab={(tab) => setSearchParams({ tab })}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    isMobileMenuOpen={isMobileMenuOpen}
                    isSidebarCollapsed={isSidebarCollapsed}
                    setIsSidebarCollapsed={setIsSidebarCollapsed}
                    dashboardCounts={dashboardCounts}
                    unreadChatCount={unreadChatCount}
                    adminReviews={adminReviews}
                />

                <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'} bg-[var(--bg-main)] min-h-screen`}>
                    <AdminHeader
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                        goldRate={goldRate}
                        goldLoading={goldLoading}
                        silverRate={silverRate}
                        silverLoading={silverLoading}
                        formatPrice={formatPrice}
                    />

                    <AdminLegalBanner
                        notices={notices}
                        activeTab={activeTab}
                        user={user}
                        setActiveTab={setActiveTab}
                        setSupportSubTab={setSupportSubTab}
                    />

                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full">
                        {activeTab === 'rates' && (
                            <RateControlTab
                                rateSettings={rateSettings}
                                updateRateSettingsMutation={updateRateSettingsMutation}
                                formatPrice={formatPrice}
                            />
                        )}

                        {activeTab === 'products' && (
                            <ProductsTab
                                editingProduct={editingProduct}
                                setEditingProduct={setEditingProduct}
                                newProduct={newProduct}
                                setNewProduct={setNewProduct}
                                uploading={uploading}
                                handleFileUpload={handleFileUpload}
                                addProductMutation={addProductMutation}
                                updateProductMutation={updateProductMutation}
                                deleteProductMutation={deleteProductMutation}
                                products={products}
                                productsLoading={productsLoading}
                                q={q}
                                occasion={occasion}
                                currency={currency}
                                unit={unit}
                                goldRate={goldRate}
                                goldLoading={goldLoading}
                                silverRate={silverRate}
                                silverLoading={silverLoading}
                                formatPrice={formatPrice}
                                calculateDynamicPrice={calculateDynamicPrice}
                                getImageUrl={getImageUrl}
                                convertTolaToGrams={convertTolaToGrams}
                            />
                        )}

                        {activeTab === 'orders' && (
                            <OrdersTab
                                orders={orders}
                                ordersLoading={ordersLoading}
                                updateOrderStatusMutation={updateOrderStatusMutation}
                                confirmPayment={confirmPayment}
                                deleteOrderMutation={deleteOrderMutation}
                                sendReceiptMutation={sendReceiptMutation}
                                q={q}
                                formatPrice={formatPrice}
                                getImageUrl={getImageUrl}
                                setViewingReceipt={setViewingReceipt}
                                disputes={disputes}
                            />
                        )}

                        {activeTab === 'users' && (
                            <UsersTab
                                users={users}
                                usersLoading={usersLoading}
                                q={q}
                                setSelectedUser={setSelectedUser}
                                verifyUser={verifyUser}
                                setFirModalUser={setFirModalUser}
                                setFirData={setFirData}
                                freezeUser={freezeUser}
                                blockUser={blockUser}
                                deleteUser={deleteUser}
                            />
                        )}

                        {activeTab === 'support' && (
                            <SupportTab
                                supportSubTab={supportSubTab}
                                setSupportSubTab={setSupportSubTab}
                                dashboardCounts={dashboardCounts}
                                adminReviews={adminReviews}
                                unreadChatCount={unreadChatCount}
                                complaints={complaints}
                                complaintsLoading={complaintsLoading}
                                setSelectedComplaint={setSelectedComplaint}
                                setRespondText={setRespondText}
                                disputes={disputes}
                                disputesLoading={disputesLoading}
                                setSelectedDispute={setSelectedDispute}
                                deleteDispute={deleteDispute}
                                reviewsLoading={reviewsLoading}
                                q={q}
                                approveReviewMutation={approveReviewMutation}
                                deleteReviewMutation={deleteReviewMutation}
                                deleteComplaint={deleteComplaint}
                                logs={logs}
                                logsLoading={logsLoading}
                                deleteAllLogs={deleteAllLogs}
                            />
                        )}

                        {activeTab === 'local' && (
                            <LocalSourcesTab
                                detailedRates={detailedRates}
                                detailedLoading={detailedLoading}
                                formatPrice={formatPrice}
                            />
                        )}
                    </div>
                </main>

                <UserDetailsModal
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    blockUser={blockUser}
                    formatPrice={formatPrice}
                    getImageUrl={getImageUrl}
                    formatDate={(date: any) => new Date(date).toLocaleString()}
                />

                <ComplaintRespondModal
                    selectedComplaint={selectedComplaint}
                    setSelectedComplaint={setSelectedComplaint}
                    respondText={respondText}
                    setRespondText={setRespondText}
                    respondToComplaintMutation={respondToComplaintMutation}
                />

                <DisputeRespondModal
                    selectedDispute={selectedDispute}
                    setSelectedDispute={setSelectedDispute}
                    respondText={respondText}
                    setRespondText={setRespondText}
                    updateDispute={updateDispute}
                    getImageUrl={getImageUrl}
                />

                <FirRegistryModal
                    firModalUser={firModalUser}
                    setFirModalUser={setFirModalUser}
                    firData={firData}
                    setFirData={setFirData}
                    registerFIR={registerFIR}
                />

                <FirDetailModal
                    viewingFirLog={viewingFirLog}
                    setViewingFirLog={setViewingFirLog}
                    users={users}
                />

                {isCalcOpen && (
                    <GoldCalculator
                        isOpen={isCalcOpen}
                        onClose={() => setIsCalcOpen(false)}
                    />
                )}

                <AnimatePresence>
                    {viewingReceipt && (
                        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-4xl my-auto"
                            >
                                <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-2xl relative">
                                    <button
                                        onClick={() => setViewingReceipt(null)}
                                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors z-10"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                    <OrderReceipt
                                        order={viewingReceipt}
                                        formatPrice={formatPrice}
                                        onClose={() => setViewingReceipt(null)}
                                        isAdmin={true}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
