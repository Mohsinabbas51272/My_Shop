import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
    id: number;
    email: string;
    name?: string;
    cnic?: string;
    address?: string;
    phone?: string;
    paymentMethod?: string;
    image?: string;
    role: 'USER' | 'ADMIN';
    isVerified: boolean;
    isFrozen: boolean;
    isBlocked: boolean;
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
                sessionStorage.setItem('token', token);
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
                sessionStorage.removeItem('token');
                localStorage.removeItem('auth-storage');
                sessionStorage.removeItem('auth-storage');
            },
            setHasHydrated: (state: boolean) => {
                set({ hasHydrated: state });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage), // Changed to sessionStorage for tab isolation
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
