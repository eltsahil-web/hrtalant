
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, X, MessageSquare, Minimize2 } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { Chat } from '@google/genai';
import { generateId } from '../utils';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session on mount
    try {
      chatSession.current = createChatSession();
      // Add initial greeting
      setMessages([{
        id: 'init',
        role: 'model',
        text: "Hi! I'm EduTalent AI. How can I help you with evaluations today?",
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error("Failed to initialize chat", e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasUnread(false);
    }
  }, [messages, isLoading, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chatSession.current || isLoading) return;

    const userText = input;
    setInput('');
    
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await chatSession.current.sendMessage({ message: userText });
      const text = response.text;
      
      const aiMsg: Message = {
        id: generateId(),
        role: 'model',
        text: text || "I'm sorry, I couldn't generate a response at this time.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'model',
        text: "I encountered an error connecting to the AI service.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto bg-white w-[380px] h-[600px] max-h-[80vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in-up origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm">EduTalent Assistant</h3>
                <p className="text-[10px] text-blue-100 opacity-90">Powered by Gemini 3 Pro</p>
              </div>
            </div>
            <button 
              onClick={toggleChat}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-white mt-1
                  ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-600 text-white'}
                `}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                
                <div className={`
                  max-w-[85%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                  }
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                   <Bot size={14} />
                 </div>
                 <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2 text-slate-500 text-sm">
                   <Loader2 size={14} className="animate-spin text-blue-500" />
                   <span className="text-xs">Thinking...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner text-sm"
                disabled={isLoading}
                autoFocus
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className={`
                  absolute right-1.5 p-2 rounded-lg transition-colors
                  ${!input.trim() || isLoading 
                    ? 'text-slate-300 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button 
        onClick={toggleChat}
        className={`
          pointer-events-auto
          h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95
          ${isOpen ? 'bg-slate-700 text-white rotate-90' : 'bg-blue-600 text-white hover:bg-blue-700'}
        `}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className="relative">
            <MessageSquare size={26} />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
        )}
      </button>
    </div>
  );
};