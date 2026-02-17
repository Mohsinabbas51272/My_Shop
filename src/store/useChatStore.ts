import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleChat: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'chat-storage',
    }
  )
);
