import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { aiAPI } from "../../../core/api/api";
import { motion, AnimatePresence } from "motion/react";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip scroll on the initial mount — only scroll when the conversation
    // is active (user sent a message or bot is typing/replied).
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { reply } = await aiAPI.chatMessage(userMsg.text);
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
    <main className="pt-24 bg-white min-h-screen flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col px-6">
        {/* Header */}
        <div className="py-8 border-b border-[#EDEDED]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3A4A3F] flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-light text-[#111111] tracking-tight">Asistente Eluxar</h1>
              <p className="text-[10px] uppercase tracking-widest text-[#3A4A3F] font-bold">Asesoría de fragancias IA</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-8 space-y-6 min-h-[400px]">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'bot' && (
                  <div className="w-8 h-8 bg-[#3A4A3F] flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'bg-[#111111] text-white p-5' : 'bg-[#EDEDED] p-5'}`}>
                  <p className="text-sm font-light leading-relaxed">{msg.text}</p>
                  <p className={`text-[9px] mt-3 uppercase tracking-widest ${msg.role === 'user' ? 'text-white/40' : 'text-[#2B2B2B]/30'}`}>
                    {msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-[#111111] flex items-center justify-center shrink-0">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-8 h-8 bg-[#3A4A3F] flex items-center justify-center shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-[#EDEDED] p-5 flex items-center gap-1">
                <span className="w-2 h-2 bg-[#2B2B2B]/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[#2B2B2B]/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[#2B2B2B]/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {quickActions.map(action => (
              <button key={action} onClick={() => { setInput(action); inputRef.current?.focus(); }}
                className="border border-[#EDEDED] px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 hover:border-[#111111] hover:text-[#111111] transition-colors">
                {action}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-[#EDEDED] py-6">
          <div className="flex items-center gap-4">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              disabled={isTyping}
              className="flex-1 bg-[#EDEDED] px-6 py-4 text-sm font-light outline-none placeholder:text-[#2B2B2B]/30 disabled:opacity-50"
            />
            <button onClick={handleSend} disabled={!input.trim() || isTyping}
              className="bg-[#111111] text-white p-4 hover:bg-[#3A4A3F] transition-colors disabled:opacity-30">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
