import { 
    LayoutDashboard, 
    ShoppingBag, 
    Users, 
    Phone, 
    TrendingUp, 
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Menu
} from 'lucide-react';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;
    dashboardCounts: any;
    unreadChatCount: any;
    adminReviews: any;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    dashboardCounts,
    unreadChatCount,
    adminReviews,
}) => {
    const tabs = [
        { id: 'products', name: 'Products', icon: LayoutDashboard },
        { id: 'orders', name: 'Orders', icon: ShoppingBag, count: dashboardCounts?.orders },
        { id: 'users', name: 'Users', icon: Users },
        { 
            id: 'support', 
            name: 'Customer Support', 
            icon: Phone, 
            count: (dashboardCounts?.complaints || 0) + 
                   (dashboardCounts?.disputes || 0) + 
                   (unreadChatCount?.count || 0) + 
                   (adminReviews?.filter((r: any) => !r.isApproved).length || 0) 
        },
        { id: 'rates', name: 'Rate Control', icon: TrendingUp },
        { id: 'local', name: 'Local Sources', icon: ExternalLink, color: 'text-green-500' },
    ];

    return (
        <aside className={`fixed inset-y-0 left-0 z-[100] ${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-[var(--bg-card)] border-r border-[var(--border)]/50 transition-all duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:top-[56px] lg:h-[calc(100vh-56px)] lg:overflow-y-auto lg:z-[80] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className={`p-4 ${isSidebarCollapsed ? 'px-2' : 'px-6'} space-y-8`}>
                <div className="flex flex-col h-full">
                    <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} mb-6 px-2`}>
                        {!isSidebarCollapsed && (
                            <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Command Center</h3>
                        )}
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden lg:flex p-2 hover:bg-[var(--bg-input)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
                            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as any);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3.5 rounded-2xl font-bold text-sm transition-all group ${activeTab === tab.id
                                    ? 'bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-main)]'} ${isSidebarCollapsed ? 'px-0' : ''}`}
                                title={isSidebarCollapsed ? tab.name : ''}
                            >
                                <div className="flex items-center gap-3">
                                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : tab.color || 'text-[var(--primary)] group-hover:scale-110 transition-transform'}`} />
                                    {!isSidebarCollapsed && <span>{tab.name}</span>}
                                </div>
                                {!isSidebarCollapsed && (tab.count ?? 0) > 0 && (
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white text-[var(--primary)]' : 'bg-red-500 text-white shadow-lg shadow-red-500/20 animate-pulse'}`}>
                                        {tab.count}
                                    </span>
                                )}
                                {isSidebarCollapsed && (tab.count ?? 0) > 0 && (
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[var(--bg-card)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
