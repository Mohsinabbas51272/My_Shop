import React, { useState } from 'react';
import { MessageCircle, X, Send, Minus, User } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

export default function ChatWidget() {
  const { user } = useAuthStore();
  const { isOpen, setIsOpen } = useChatStore();
  const [inputText, setInputText] = useState('');
  const [adminId] = useState<number | null>(4); // Updated to active admin ID (4)
  const { messages, sendMessage, isConnected, isRestOnline, messagesEndRef } = useChat(adminId || undefined);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && adminId) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  // Only show if user is logged in and NOT an admin
  if (!user || user.role === 'ADMIN') return null;

  return (
    <div className={`fixed z-[200] transition-all duration-300 ${isOpen ? 'inset-0 md:inset-auto md:bottom-6 md:right-6' : 'bottom-6 right-6'}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-full h-full md:w-[400px] md:h-[600px] md:max-h-[min(80vh,700px)] bg-[var(--bg-main)] md:rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col"
          >
            {/* Themed Header */}
            <div className="bg-[var(--primary)] p-3 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="md:hidden p-1 hover:bg-white/10 rounded-full"
                >
                  <Minus className="w-6 h-6 rotate-90" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/10 overflow-hidden">
                    <User className="w-6 h-6 text-white/70" />
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--primary)] ${isConnected || isRestOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Support Team</h3>
                  <p className="text-[10px] opacity-80">{isConnected || isRestOnline ? 'online' : 'reconnecting...'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Body - Themed Background with Wallpaper Overlay */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative"
              style={{
                backgroundImage: `url('https://w0.peakpx.com/wallpaper/580/550/HD-wallpaper-whatsapp-background-original-whatsapp-background-whatsapp-theme-whatsapp-walpaper.jpg')`,
                backgroundSize: '400px',
                backgroundBlendMode: 'soft-light',
                backgroundColor: 'var(--bg-main)'
              }}
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-40">
                  <div className="w-16 h-16 bg-[var(--bg-card)] rounded-full flex items-center justify-center shadow-sm">
                    <MessageCircle className="w-8 h-8 text-[var(--primary)]" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    Messages are end-to-end encrypted
                  </p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-1.5 rounded-xl text-[14px] shadow-sm relative ${msg.senderId === user.id
                      ? 'bg-[var(--primary)] text-white rounded-tr-none ml-12'
                      : 'bg-[var(--bg-card)] text-[var(--text-main)] rounded-tl-none border border-[var(--border)] mr-12'
                      }`}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className={`text-[9px] font-medium ${msg.senderId === user.id ? 'opacity-70' : 'opacity-40'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                      {msg.senderId === user.id && (
                        <div className="flex -space-x-1">
                          <span className="text-white/80 text-[10px] font-bold">✓✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Themed Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-[var(--bg-card)] border-t border-[var(--border)] flex items-center gap-2">
              <div className="flex-1 flex items-center bg-[var(--bg-main)] rounded-full px-4 py-1.5 shadow-sm border border-[var(--border)]">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 py-1.5 bg-transparent text-sm focus:outline-none text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                />
              </div>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${inputText.trim()
                  ? 'bg-[var(--primary)] text-white shadow-lg active:scale-95'
                  : 'bg-[var(--primary)] text-white opacity-50 cursor-not-allowed'
                  }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
