import { useState, useRef } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { aiAPI } from "../../../core/api/api";
import { motion, AnimatePresence } from "motion/react";
import { SEOHead } from "../../../shared/components/seo/SEOHead";

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: '¡Hola! Soy el asistente virtual de Eluxar. Estoy aquí para ayudarte a descubrir tu fragancia ideal. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Conversation history for the AI agent (persisted across turns, not in state to avoid re-renders)
  const conversationHistory = useRef<object[]>([]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { reply, history } = await aiAPI.chatMessage(userMsg.text, conversationHistory.current);
      // Update persisted history for the next turn
      conversationHistory.current = history ?? [];
      const botMsg: Message = { id: crypto.randomUUID(), role: 'bot', text: reply, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'bot', text: 'Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const quickActions = ['Perfumes para hombre', 'Perfumes para mujer', 'Quiero un regalo', 'Larga duración'];

  return (
    <main className="pt-24 bg-white dark:bg-[var(--bg-base)] min-h-screen flex flex-col font-sans">
      <SEOHead title="Eluxar | Asistente de Fragancias" exactTitle />
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col px-4 sm:px-6 relative">
        {/* Header */}
        <div className="py-6 border-b border-[#EDEDED] dark:border-white/10 flex items-center justify-between -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3A4A3F] to-[#2C3830] shadow-lg flex items-center justify-center">
              <Sparkles size={20} className="text-[#E8EFEA]" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-[#111111] dark:text-white dark:text-white tracking-tight">Asistente Eluxar</h1>
              <p className="text-xs uppercase tracking-widest text-[#3A4A3F] dark:text-[#A3B5AA] font-semibold mt-1">Asesoría de fragancias IA</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-8 space-y-8 min-h-[400px] px-2">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'bot' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3A4A3F] to-[#2C3830] flex items-center justify-center shrink-0 shadow-md">
                    <Bot size={18} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-5 shadow-sm text-[15px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#111111] dark:bg-[#2A352D] text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED]/50 dark:border-white/5 dark:border-white/5 rounded-2xl rounded-tl-sm text-[#111111] dark:text-[#EDEDED] dark:text-gray-200'
                  }`}>
                    <div className="whitespace-pre-wrap">
                      {msg.text.split(/(\*\*.*?\*\*)/g).map((part, i) => 
                        part.startsWith('**') && part.endsWith('**') 
                          ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
                          : part
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3A4A3F] to-[#2C3830] flex items-center justify-center shrink-0 shadow-md">
                <Bot size={18} className="text-white" />
              </div>
              <div className="bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED]/50 dark:border-white/5 dark:border-white/5 rounded-2xl rounded-tl-sm p-5 flex items-center gap-2 shadow-sm h-[60px]">
                <span className="w-2 h-2 bg-[#3A4A3F] dark:bg-[#A3B5AA] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[#3A4A3F] dark:bg-[#A3B5AA] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[#3A4A3F] dark:bg-[#A3B5AA] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="pb-8 pt-4 bg-white dark:bg-[var(--bg-base)] sticky bottom-0 z-10">
          {/* Quick Actions */}
          {messages.length <= 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-3 mb-6 justify-center">
              {quickActions.map(action => (
                <button key={action} onClick={() => { setInput(action); inputRef.current?.focus(); }}
                  className="px-5 py-2.5 rounded-full border border-black/10 dark:border-white/20 text-[11px] uppercase tracking-wider font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-[var(--bg-surface)] hover:border-[#3A4A3F] hover:bg-[#3A4A3F] hover:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                  {action}
                </button>
              ))}
            </motion.div>
          )}

          {/* Input */}
          <div className="relative flex items-center shadow-2xl rounded-full bg-white dark:bg-[var(--bg-elevated)]">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              disabled={isTyping}
              className="w-full bg-transparent border border-black/10 dark:border-white/20 rounded-full pl-6 pr-16 py-4 text-[15px] font-light outline-none text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/40 dark:placeholder:text-white/60 focus:border-[#3A4A3F] dark:focus:border-white/50 transition-all disabled:opacity-50"
            />
            <button onClick={handleSend} disabled={!input.trim() || isTyping}
              className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] flex items-center justify-center hover:bg-[#3A4A3F] dark:hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:hover:bg-[#111111] dark:disabled:hover:bg-white">
              <Send size={18} className={input.trim() && !isTyping ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
            </button>
          </div>
          <div className="text-center mt-4">
            <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/30 dark:text-gray-600 font-light">
              La IA de Eluxar puede cometer errores. Verifica la información.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
