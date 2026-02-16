import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useChat } from '../hooks/useChat';
import { MessageSquare, User, Send, Search, Loader2, Circle } from 'lucide-react';

export default function AdminChat() {
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [inputText, setInputText] = useState('');

  const { data: chatList, isLoading: listLoading } = useQuery({
    queryKey: ['chat-list'],
    queryFn: async () => (await api.get('/chats/list')).data,
    refetchInterval: 3000,
  });

  const handleSelectChat = async (chat: any) => {
    setSelectedChat(chat);
    if (chat.unreadCount > 0) {
      try {
        await api.patch(`/chats/read/${chat.user.id}`);
      } catch (error) {
        console.error('Failed to mark as read', error);
      }
    }
  };

  const { messages, sendMessage, messagesEndRef } = useChat(selectedChat?.user.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && selectedChat) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-[var(--bg-main)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Sidebar - Chat List */}
      <div className={`w-full md:w-96 border-r border-[var(--border)] flex flex-col bg-[var(--bg-card)]/50 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 bg-[var(--bg-card)] border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center overflow-hidden border border-[var(--border)]">
              <User className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
            <h2 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tighter">Chats</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-[var(--primary)]/10 rounded-full text-[var(--text-muted)]"><MessageSquare className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search or start new chat"
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-main)] border border-[var(--border)] rounded-lg text-xs font-medium outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {listLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" /></div>
          ) : chatList?.length === 0 ? (
            <div className="p-8 text-center space-y-2 opacity-40">
                <MessageSquare className="w-8 h-8 mx-auto text-[var(--text-muted)]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">No active chats</p>
            </div>
          ) : (
            chatList?.map((chat: any) => (
              <button
                key={chat.user.id}
                onClick={() => handleSelectChat(chat)}
                className={`w-full p-3.5 flex items-center gap-4 transition-all border-b border-[var(--border)]/30 ${selectedChat?.user.id === chat.user.id ? 'bg-[var(--bg-input)]' : 'hover:bg-[var(--bg-input)]/50'}`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-input)] flex items-center justify-center overflow-hidden border border-[var(--border)] shadow-sm">
                    {chat.user.image ? <img src={chat.user.image} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-[var(--text-muted)]" />}
                  </div>
                  <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-[var(--bg-card)] rounded-full" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="text-[15px] font-semibold text-[var(--text-main)] truncate">{chat.user.name}</h4>
                    <span className="text-[11px] font-medium text-[var(--text-muted)]">{new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-[var(--text-muted)] truncate flex-1 pr-2">{chat.lastMessage}</p>
                    {chat.unreadCount > 0 && (
                      <div className="shrink-0 w-5 h-5 bg-[var(--primary)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-full ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-3 bg-[var(--bg-card)] border-l border-[var(--border)] flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-2 hover:bg-[var(--primary)]/10 rounded-full text-[var(--text-main)] mr-1"
                >
                  <Send className="w-5 h-5 rotate-180" />
                </button>
                <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center border border-[var(--border)] shadow-sm overflow-hidden">
                  {selectedChat.user.image ? <img src={selectedChat.user.image} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-[var(--text-muted)]" />}
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[var(--text-main)] leading-none mb-1">{selectedChat.user.name}</h3>
                  <p className="text-[11px] text-green-500 font-medium">online</p>
                </div>
              </div>
              <div className="flex gap-2 text-[var(--text-muted)]">
                <button className="p-2 hover:bg-[var(--primary)]/10 rounded-full"><Search className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-[var(--primary)]/10 rounded-full"><MessageSquare className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages - Themed Wallpaper Overlay */}
            <div
              className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3 custom-scrollbar relative"
              style={{
                backgroundImage: `url('https://w0.peakpx.com/wallpaper/580/550/HD-wallpaper-whatsapp-background-original-whatsapp-background-whatsapp-theme-whatsapp-walpaper.jpg')`,
                backgroundSize: '400px',
                backgroundBlendMode: 'soft-light',
                backgroundColor: 'var(--bg-main)'
              }}
            >
              {messages.map((msg, idx) => (
                <div key={msg.id || idx} className={`flex ${msg.senderId !== selectedChat.user.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[85%] md:max-w-[70%] px-3 py-1.5 rounded-xl text-[14px] shadow-sm relative ${msg.senderId !== selectedChat.user.id ? 'bg-[var(--primary)] text-white rounded-tr-none' : 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border)] rounded-tl-none'}`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className={`text-[9px] font-medium ${msg.senderId !== selectedChat.user.id ? 'opacity-70' : 'opacity-40'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                      {msg.senderId !== selectedChat.user.id && (
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

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-[var(--bg-card)] border-t border-[var(--border)] flex items-center gap-3">
              <div className="flex items-center gap-2 text-[var(--text-muted)] px-2">
                <button type="button" className="p-2 hover:bg-[var(--primary)]/10 rounded-full transition-colors"><MessageSquare className="w-6 h-6" /></button>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message"
                  className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border)] rounded-lg text-[15px] font-medium outline-none text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                />
              </div>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${inputText.trim()
                  ? 'bg-[var(--primary)] text-white shadow-lg active:scale-95 hover:bg-[var(--primary)]/90'
                  : 'bg-[var(--primary)] text-white opacity-40 cursor-not-allowed'
                  }`}
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </form>
          </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-[var(--bg-main)] border-l border-[var(--border)]">
              <div className="w-64 h-64 rounded-full overflow-hidden mb-8 opacity-10">
                <img src="https://w0.peakpx.com/wallpaper/580/550/HD-wallpaper-whatsapp-background-original-whatsapp-background-whatsapp-theme-whatsapp-walpaper.jpg" className="w-full h-full object-cover" />
            </div>
              <h3 className="text-3xl font-light text-[var(--text-main)] mb-4">Support Center for Admin</h3>
              <p className="text-sm text-[var(--text-muted)] max-w-md leading-relaxed">
                Managing customer queries in real-time.<br />
                The interface adapts to your selected application theme.
              </p>
              <div className="mt-12 flex items-center gap-2 text-[var(--text-muted)] opacity-60">
                <Circle className="w-3 h-3 fill-[var(--text-muted)]" />
                <span className="text-[12px] font-medium uppercase tracking-widest">End-to-end encrypted</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
