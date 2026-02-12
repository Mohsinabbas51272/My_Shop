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
    <div className="flex h-[calc(100vh-180px)] bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border)] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sidebar - Chat List */}
      <div className="w-80 border-r border-[var(--border)] flex flex-col bg-[var(--bg-input)]/30">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter mb-4">Live Support</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-main)] border border-[var(--border)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--primary)]/30 transition-all text-[var(--text-main)]"
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
                className={`w-full p-4 flex items-center gap-4 transition-all border-b border-[var(--border)]/30 ${selectedChat?.user.id === chat.user.id ? 'bg-[var(--bg-main)] shadow-sm ring-1 ring-[var(--primary)]/20' : 'hover:bg-[var(--bg-main)]/50'}`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-input)] flex items-center justify-center overflow-hidden border-2 border-[var(--border)] shadow-sm">
                    {chat.user.image ? <img src={chat.user.image} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-[var(--text-muted)]" />}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[var(--bg-card)] shadow-lg animate-bounce">
                      {chat.unreadCount}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-card)] rounded-full shadow-sm" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="text-sm font-black text-[var(--text-main)] truncate uppercase tracking-tight">{chat.user.name}</h4>
                    <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase">{new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] font-medium text-[var(--text-muted)] truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[var(--bg-main)]">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center border border-[var(--border)] shadow-sm overflow-hidden">
                  {selectedChat.user.image ? <img src={selectedChat.user.image} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-[var(--text-muted)]" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest leading-none mb-1">{selectedChat.user.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <Circle className="w-1.5 h-1.5 fill-green-500 text-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-tighter">Active Now</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-input)]/20 space-y-6 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={msg.id || idx} className={`flex ${msg.senderId !== selectedChat.user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] space-y-1`}>
                    <div className={`p-4 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${msg.senderId !== selectedChat.user.id ? 'bg-[var(--primary)] text-white rounded-tr-none' : 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border)] rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                    <div className={`text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest ${msg.senderId !== selectedChat.user.id ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 bg-[var(--bg-card)] border-t border-[var(--border)] flex gap-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 px-6 py-4 bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--primary)]/30 transition-all text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-8 bg-[var(--primary)] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-[var(--primary-hover)] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Reply
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-30">
            <div className="w-20 h-20 bg-[var(--bg-input)] rounded-full flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-main)]">Select a Conversation</h3>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2">Choose a user from the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
