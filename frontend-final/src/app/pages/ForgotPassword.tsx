import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { authAPI } from "../services/api";
import { motion, AnimatePresence } from "motion/react";

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('El correo es obligatorio'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Correo no válido'); return; }

    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setIsSubmitted(true);
    } catch {
      setError('Error al enviar el correo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 pt-32 pb-24">
      <div className="max-w-md w-full space-y-12">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-light text-[#111111] tracking-tight uppercase tracking-[0.3em]">Recuperar</h1>
                <p className="text-[#2B2B2B]/40 text-[10px] uppercase tracking-[0.2em] font-bold">
                  Ingresa tu correo para restaurar tu acceso
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Correo Electrónico</label>
                  <div className="relative border-b border-[#2B2B2B]/20 py-2 group focus-within:border-[#111111] transition-colors">
                    <Mail className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/20 group-focus-within:text-[#111111]" size={16} />
                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      className="bg-transparent border-none outline-none w-full text-sm font-medium pr-10"
                      placeholder="tu@correo.com" />
                  </div>
                  {error && <span className="text-red-500 text-[10px] uppercase tracking-widest">{error}</span>}
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full bg-[#111111] text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all flex items-center justify-center space-x-3 shadow-lg shadow-black/5 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Enviando...' : 'Enviar Enlace'}</span>
                  <ArrowRight size={14} />
                </button>
              </form>

              <div className="text-center">
                <Link to="/auth" className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 hover:text-[#111111] transition-colors inline-flex items-center gap-2">
                  <ArrowLeft size={12} /> Volver al Inicio de Sesión
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 border-2 border-[#3A4A3F] flex items-center justify-center">
                  <CheckCircle size={32} className="text-[#3A4A3F]" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-[#111111] tracking-tight">Correo Enviado</h2>
                <p className="text-sm text-[#2B2B2B]/60 font-light max-w-sm mx-auto">
                  Hemos enviado un enlace de recuperación a <strong className="text-[#111111]">{email}</strong>. Revisa tu bandeja de entrada.
                </p>
              </div>
              <Link to="/auth"
                className="inline-block bg-[#111111] text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] transition-colors"
              >
                Volver al Inicio de Sesión
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};
