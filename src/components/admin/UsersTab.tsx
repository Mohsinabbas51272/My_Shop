import React from 'react';
import { 
    Users, 
    ShieldAlert, 
    Trash2, 
    Eye, 
    History,
} from 'lucide-react';

interface UsersTabProps {
    users: any[];
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                    <Users className="w-5 h-5 text-[var(--primary)]" />
                    User Registry
                </h2>
                <div className="bg-[var(--bg-input)] px-4 py-2 rounded-xl border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    {users?.length || 0} Registered Citizens
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
                                <th className="p-4">Record</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]/50">
                            {usersLoading ? (
                                <tr><td colSpan={5} className="p-12 text-center opacity-50 font-bold uppercase tracking-widest">Accessing Registry...</td></tr>
                            ) : (users || [])
                                .filter((u: any) => !q || u.name?.toLowerCase().includes(q.toLowerCase()) || u.phone?.includes(q))
                                .map((u: any) => (
                                    <tr key={u.id} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                                        <td className="p-4 font-bold text-[var(--text-main)]">{u.name}</td>
                                        <td className="p-4 text-[var(--text-muted)] font-mono text-xs">{u.phone}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${u.isBlocked ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                                {u.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase">
                                                <History className="w-3.5 h-3.5" />
                                                {u.ordersCount || 0} Orders
                                            </div>
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
                                                    onClick={() => setFirModalUser(u)}
                                                    className="p-1.5 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors"
                                                    title="Registry Offence (FIR)"
                                                >
                                                    <ShieldAlert className="w-4 h-4" />
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
        </div>
    );
};

export default UsersTab;
