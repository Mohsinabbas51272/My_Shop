import React, { useState } from 'react';
import { MessageCircle, X, Send, Minus, MessageSquare } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

export default function ChatWidget() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [adminId] = useState<number | null>(3); // Set to active admin ID (3)
  const { messages, sendMessage, isConnected, messagesEndRef } = useChat(adminId || undefined);

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
    <div className="fixed bottom-6 right-6 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 md:w-96 h-[500px] bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-[var(--primary)] p-4 flex items-center justify-between text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/10">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Support</h3>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">
                      {isConnected ? 'Online' : 'Reconnecting...'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-main)] custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-40">
                  <MessageCircle className="w-12 h-12 text-[var(--text-muted)]" />
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    How can we help you today?
                  </p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${msg.senderId === user.id
                      ? 'bg-[var(--primary)] text-white rounded-tr-none'
                      : 'bg-[var(--bg-card)] text-[var(--text-main)] rounded-tl-none border border-[var(--border)]'
                      }`}
                  >
                    {msg.content}
                    <div className={`text-[8px] mt-1.5 opacity-40 font-mono ${msg.senderId === user.id ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-[var(--bg-card)] border-t border-[var(--border)] flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-[var(--bg-main)] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 transition-all text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-[var(--primary)] text-white rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 hover:bg-[var(--primary-hover)]"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[var(--primary)] text-white rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden group border border-white/10"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <Minus className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
