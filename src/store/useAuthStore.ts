import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    email: string;
    name?: string;
    cnic?: string;
    address?: string;
    phone?: string;
    paymentMethod?: string;
    role: 'USER' | 'ADMIN';
}

interface AuthState {
    user: User | null;
    token: string | null;
    hasHydrated: boolean;
    setAuth: (user: User, token: string) => void;
    updateUser: (user: Partial<User>) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            hasHydrated: false,
            setAuth: (user: User, token: string) => {
                set({ user, token });
                localStorage.setItem('token', token);
            },
            updateUser: (newUser: Partial<User>) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({ user: { ...currentUser, ...newUser } });
                }
            },
            logout: () => {
                set({ user: null, token: null });
                localStorage.removeItem('token');
            },
            setHasHydrated: (state: boolean) => {
                set({ hasHydrated: state });
            },
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
