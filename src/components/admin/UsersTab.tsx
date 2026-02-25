import React from 'react';
import { 
    Users, 
    ShieldAlert, 
    ShieldCheck,
    Lock,
    Gavel,
    Trash2, 
    Eye,
} from 'lucide-react';

interface UsersTabProps {
    users: any[];
    totalPages: number;
    currentPage: number;
    setPage: (page: number) => void;
    usersLoading: boolean;
    q: string;
    verifyUser: any;
    freezeUser: any;
    blockUser: any;
    deleteUser: any;
    setSelectedUser: (user: any) => void;
    setFirModalUser: (user: any) => void;
    setFirData: (data: any) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({
    users,
    totalPages,
    currentPage,
    setPage,
    usersLoading,
    q,
    verifyUser: _verifyUser,
    freezeUser: _freezeUser,
    blockUser: _blockUser,
    deleteUser,
    setSelectedUser,
    setFirModalUser,
    setFirData: _setFirData,
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                    <Users className="w-5 h-5 text-[var(--primary)]" />
                    User Registry
                </h2>
                <div className="bg-[var(--bg-card)] px-4 py-2 rounded-xl border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    {users?.length || 0} Citizens on this page
                </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--bg-input)] text-[var(--text-muted)] font-black uppercase tracking-widest text-[10px]">
                            <tr>
                                <th className="p-4">Citizen</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]/50">
                            {usersLoading ? (
                                <tr><td colSpan={4} className="p-12 text-center opacity-50 font-bold uppercase tracking-widest">Accessing Registry...</td></tr>
                            ) : (users || [])
                                .filter((u: any) => !q || u.name?.toLowerCase().includes(q.toLowerCase()) || u.phone?.includes(q))
                                .map((u: any) => (
                                    <tr key={u.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] border border-[var(--border)] overflow-hidden shrink-0">
                                                    {u.image ? (
                                                        <img src={u.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] font-black text-[10px]">
                                                            {u.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-bold text-[var(--text-main)] truncate max-w-[150px]">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-[var(--text-muted)] font-mono text-xs">{u.phone}</td>
                                        <td className="p-4">
                                            {u.isBlocked ? (
                                                <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20">Blocked</span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20">Active</span>
                                                        {u.isFrozen ? (
                                                            <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Frozen</span>
                                                        ) : u.isVerified ? (
                                                            <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20">Verified</span>
                                                        ) : null}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedUser(u)}
                                                    className="p-1.5 hover:bg-[var(--primary)]/10 text-[var(--text-muted)] hover:text-[var(--primary)] rounded-lg transition-colors"
                                                    title="View Full Profile"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => _verifyUser?.mutate && _verifyUser.mutate(u.id)}
                                                    disabled={_verifyUser?.isPending}
                                                    className="p-1.5 hover:bg-green-500/10 text-green-500 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Verify User"
                                                >
                                                    <ShieldCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirm('Freeze this user account?') && _freezeUser?.mutate && _freezeUser.mutate(u.id)}
                                                    disabled={_freezeUser?.isPending}
                                                    className="p-1.5 hover:bg-yellow-500/10 text-yellow-500 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Freeze User"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => _blockUser?.mutate && _blockUser.mutate(u.id)}
                                                    disabled={_blockUser?.isPending}
                                                    className="p-1.5 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Block/Unblock User"
                                                >
                                                    <ShieldAlert className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setFirModalUser(u)}
                                                    className="p-1.5 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors"
                                                    title="Registry Offence (FIR)"
                                                >
                                                    <Gavel className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirm('Permanently remove citizen from system? This cannot be undone!') && deleteUser.mutate(u.id)}
                                                    className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === i + 1
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default UsersTab;
