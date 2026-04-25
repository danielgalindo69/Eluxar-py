import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowRight, ArrowLeft, CheckCircle, KeyRound, Lock } from "lucide-react";
import { authAPI } from "../../../core/api/api";
import { motion, AnimatePresence } from "motion/react";

type Phase = "email" | "code" | "password" | "success";

export const ForgotPassword = () => {
  const [phase, setPhase] = useState<Phase>("email");
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('El correo es obligatorio'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Correo no válido'); return; }

    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setPhase("code");
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (code.length !== 6) { setError('El código debe tener 6 dígitos'); return; }

    setIsLoading(true);
    try {
      await authAPI.verifyResetCode(email, code);
      setPhase("password");
    } catch (err: any) {
      setError(err.message || 'Código inválido o expirado');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (newPassword !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }

    setIsLoading(true);
    try {
      await authAPI.resetPassword(email, code, newPassword);
      setPhase("success");
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#161616] flex items-center justify-center px-6 pt-32 pb-24">
      <div className="max-w-md w-full space-y-12">
        <AnimatePresence mode="wait">
          
          {/* FASE 1: INGRESAR EMAIL */}
          {phase === "email" && (
            <motion.div key="form-email" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-light text-[#111111] dark:text-white tracking-tight uppercase tracking-[0.3em]">Recuperar</h1>
                <p className="text-[#2B2B2B]/40 dark:text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">
                  Ingresa tu correo para restaurar tu acceso
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-8">
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Correo Electrónico</label>
                  <div className="relative border-b border-[#2B2B2B]/20 dark:border-white/20 py-2 group focus-within:border-[#111111] transition-colors">
                    <Mail className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/20 group-focus-within:text-[#111111] dark:text-white" size={16} />
                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      className="bg-transparent border-none outline-none w-full text-sm dark:text-white font-medium pr-10"
                      placeholder="tu@correo.com" />
                  </div>
                  {error && <span className="text-red-500 text-[10px] uppercase tracking-widest">{error}</span>}
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full bg-[#111111] text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all flex items-center justify-center space-x-3 shadow-lg shadow-black/5 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Enviando...' : 'Enviar Código'}</span>
                  <ArrowRight size={14} />
                </button>
              </form>

              <div className="text-center">
                <Link to="/auth" className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:text-white transition-colors inline-flex items-center gap-2">
                  <ArrowLeft size={12} /> Volver al Inicio de Sesión
                </Link>
              </div>
            </motion.div>
          )}

          {/* FASE 2: VERIFICAR CÓDIGO */}
          {phase === "code" && (
            <motion.div key="form-code" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight uppercase tracking-[0.2em]">Verificar Código</h1>
                <p className="text-[#2B2B2B]/60 dark:text-white/60 text-xs font-light max-w-sm mx-auto">
                  Hemos enviado un código seguro de 6 dígitos a <strong className="text-[#111111] dark:text-white">{email}</strong>.
                </p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-8">
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 text-center">Código de Seguridad</label>
                  <div className="relative border-b border-[#2B2B2B]/20 dark:border-white/20 py-2 group focus-within:border-[#111111] transition-colors">
                    <KeyRound className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/20 group-focus-within:text-[#111111] dark:text-white" size={16} />
                    <input type="text" maxLength={6} value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                      className="bg-transparent border-none outline-none w-full text-2xl tracking-[0.5em] text-center font-bold pr-10"
                      placeholder="000000" />
                  </div>
                  {error && <span className="text-red-500 text-[10px] uppercase tracking-widest text-center block mt-2">{error}</span>}
                </div>

                <button type="submit" disabled={isLoading || code.length !== 6}
                  className="w-full bg-[#111111] text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all flex items-center justify-center space-x-3 shadow-lg shadow-black/5 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Verificando...' : 'Verificar'}</span>
                  <ArrowRight size={14} />
                </button>
              </form>

              <div className="text-center">
                <button onClick={() => setPhase('email')} className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:text-white transition-colors inline-flex items-center gap-2">
                  <ArrowLeft size={12} /> Usar otro correo
                </button>
              </div>
            </motion.div>
          )}

          {/* FASE 3: NUEVA CONTRASEÑA */}
          {phase === "password" && (
            <motion.div key="form-password" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight uppercase tracking-[0.2em]">Nueva Contraseña</h1>
                <p className="text-[#2B2B2B]/40 dark:text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">
                  Ingresa tu nueva clave de acceso
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-8">
                <div className="space-y-6">
                    <div className="flex flex-col space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Nueva Contraseña</label>
                    <div className="relative border-b border-[#2B2B2B]/20 dark:border-white/20 py-2 group focus-within:border-[#111111] transition-colors">
                        <Lock className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/20 group-focus-within:text-[#111111] dark:text-white" size={16} />
                        <input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                        className="bg-transparent border-none outline-none w-full text-sm dark:text-white font-medium pr-10"
                        placeholder="••••••••" />
                    </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Repetir Contraseña</label>
                    <div className="relative border-b border-[#2B2B2B]/20 dark:border-white/20 py-2 group focus-within:border-[#111111] transition-colors">
                        <Lock className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/20 group-focus-within:text-[#111111] dark:text-white" size={16} />
                        <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                        className="bg-transparent border-none outline-none w-full text-sm dark:text-white font-medium pr-10"
                        placeholder="••••••••" />
                    </div>
                    </div>
                </div>

                {error && <span className="text-red-500 text-[10px] uppercase tracking-widest block">{error}</span>}

                <button type="submit" disabled={isLoading}
                  className="w-full bg-[#111111] text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all flex items-center justify-center space-x-3 shadow-lg shadow-black/5 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Guardando...' : 'Restaurar Contraseña'}</span>
                  <CheckCircle size={14} />
                </button>
              </form>
            </motion.div>
          )}

          {/* FASE 4: ÉXITO */}
          {phase === "success" && (
            <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 border-2 border-[#3A4A3F] flex items-center justify-center">
                  <CheckCircle size={32} className="text-[#3A4A3F]" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">¡Contraseña Recuperada!</h2>
                <p className="text-sm text-[#2B2B2B]/60 dark:text-white/60 font-light max-w-sm mx-auto">
                  Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva clave.
                </p>
              </div>
              <Link to="/auth"
                className="inline-block bg-[#111111] text-white px-10 py-5 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] transition-colors shadow-lg shadow-black/5"
              >
                Ir a Iniciar Sesión
              </Link>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
};
