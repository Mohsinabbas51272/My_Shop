import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

const getSocketUrl = () => {
  // Try to get URL from VITE_API_URL or fallback to current window origin
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  // If it's a full API URL like http://localhost:5000/api, we need to extract the base http://localhost:5000
  try {
    const url = new URL(apiUrl);
    return `${url.protocol}//${url.host}`;
  } catch (e) {
    // Fallback if URL parsing fails
    return apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  }
};

const SOCKET_URL = getSocketUrl();

export interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    image?: string;
    role: string;
  };
}

export const useChat = (receiverId?: number) => {
  const { token, hasHydrated } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Socket once hydration is complete and we have a token
  useEffect(() => {
    if (!hasHydrated) return;

    const effectiveToken = token || sessionStorage.getItem('token') || localStorage.getItem('token');

    if (!effectiveToken) {
      console.warn('⚠️ ChatHook: No token found, socket connection deferred');
      return;
    }

    console.log('📡 ChatHook: Initializing connection to:', SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      auth: { token: effectiveToken.startsWith('Bearer ') ? effectiveToken : `Bearer ${effectiveToken}` },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ ChatHook: Connected! ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ ChatHook: Connection Error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('🔌 ChatHook: Disconnected. Reason:', reason);
      setIsConnected(false);
    });

    setSocket(newSocket);
    return () => {
      console.log('🧹 ChatHook: Cleaning up socket...');
      newSocket.close();
    };
  }, [token, hasHydrated]);

  // Handle message updates and history when receiverId changes
  useEffect(() => {
    // Note: We don't return early if !isConnected here because we want to setup listeners 
    // that persist across reconnection if the socket instance stays the same.
    if (!socket) return;

    console.log('👤 ChatHook: Active Receiver Changed To:', receiverId);
    setMessages([]);

    if (isConnected && receiverId) {
      console.log('📜 ChatHook: Requesting history for:', receiverId);
      socket.emit('getHistory', { otherId: Number(receiverId) });
    }

    const handleNewMessage = (message: ChatMessage) => {
      console.log('📥 ChatHook: Received New Message:', message);
      // Use functional state update to ensure we always have latest receiverId in closure if needed, 
      // but here we rely on the effect dependency array.
      if (Number(message.senderId) === Number(receiverId) || Number(message.receiverId) === Number(receiverId)) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleMessageSent = (message: ChatMessage) => {
      console.log('📤 ChatHook: messageSent Confirmation:', message);
      if (Number(message.receiverId) === Number(receiverId)) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleHistory = (history: ChatMessage[]) => {
      console.log('📜 ChatHook: Received History, Count:', history?.length || 0);
      setMessages(history || []);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageSent', handleMessageSent);
    socket.on('history', handleHistory);

    // If we just got connected and have a receiverId, fetch history
    const onConnect = () => {
      if (receiverId) {
        socket.emit('getHistory', { otherId: Number(receiverId) });
      }
    };
    socket.on('connect', onConnect);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageSent', handleMessageSent);
      socket.off('history', handleHistory);
      socket.off('connect', onConnect);
    };
  }, [socket, isConnected, receiverId]);

  // REST Fullback Polling
  useEffect(() => {
    if (!hasHydrated || isConnected || !receiverId) return;

    console.log('🔄 ChatHook: Socket not connected. Starting REST polling fallback...');

    // Initial fetch
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/chats/history/${receiverId}`);
        setMessages(response.data || []);
      } catch (error) {
        console.error('❌ ChatHook: REST fallback fetch failed:', error);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [hasHydrated, isConnected, receiverId]);

  const sendMessage = useCallback(
    async (content: string) => {
      console.log('🔘 ChatHook: sendMessage Function Triggered', { content, isConnected, receiverId });

      // try socket first if connected
      if (socket && isConnected) {
        console.log('🚀 ChatHook: Emitting via Socket...');
        socket.emit('sendMessage', { receiverId: Number(receiverId), content });
        return;
      }

      // REST Fallback
      console.log('🌐 ChatHook: Socket not available, using REST fallback...');
      try {
        const response = await api.post('/chats/send', { receiverId: Number(receiverId), content });
        console.log('✅ ChatHook: REST send success:', response.data);
        // Optimistically add to messages if we are successfully sending
        setMessages((prev) => [...prev, response.data]);
      } catch (error) {
        console.error('❌ ChatHook: REST send failed:', error);
      }
    },
    [socket, isConnected, receiverId]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return { messages, sendMessage, isConnected, messagesEndRef };
};
