import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Correo no válido';
    if (!password) errs.password = 'La contraseña es obligatoria';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(email, password);
      toast.success('¡Bienvenido a Eluxar!');
      navigate('/');
    } catch {
      toast.error('Credenciales incorrectas');
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 pt-32 pb-24">
      <div className="max-w-md w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
           <h1 className="text-3xl font-light text-[#111111] tracking-tight uppercase tracking-[0.3em]">Bienvenido</h1>
           <p className="text-[#2B2B2B]/40 text-[10px] uppercase tracking-[0.2em] font-bold">
             Accede a tu perfil exclusivo de Eluxar
           </p>
        </div>

        {/* Demo Credentials */}
        <div className="bg-[#EDEDED] p-6 space-y-3">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F]">Credenciales Demo</p>
          <div className="grid grid-cols-1 gap-2 text-[11px] text-[#2B2B2B]/60">
            <p><strong>Admin:</strong> admin@eluxar.com</p>
            <p><strong>Empleado:</strong> empleado@eluxar.com</p>
            <p><strong>Cliente:</strong> cualquier@correo.com</p>
            <p className="text-[10px] text-[#2B2B2B]/30 italic">Contraseña: cualquier valor</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
           <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Correo Electrónico</label>
              <div className="relative border-b border-[#2B2B2B]/20 py-2 group focus-within:border-[#111111] transition-colors">
                 <Mail className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/20 group-focus-within:text-[#111111]" size={16} />
                 <input type="email" value={email} onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => { const n = { ...p }; delete n.email; return n; }); }}
                   className="bg-transparent border-none outline-none w-full text-sm font-medium pr-10" />
              </div>
              {errors.email && <span className="text-red-500 text-[10px] uppercase tracking-widest">{errors.email}</span>}
           </div>

           <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Contraseña</label>
                <Link to="/forgot-password" className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 hover:text-[#111111]">¿Olvidaste tu contraseña?</Link>
              </div>
              <div className="relative border-b border-[#2B2B2B]/20 py-2 group focus-within:border-[#111111] transition-colors">
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/20 hover:text-[#111111]">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                 </button>
                 <input type={showPassword ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => { const n = { ...p }; delete n.password; return n; }); }}
                   className="bg-transparent border-none outline-none w-full text-sm font-medium pr-10" />
              </div>
              {errors.password && <span className="text-red-500 text-[10px] uppercase tracking-widest">{errors.password}</span>}
           </div>

           <button type="submit" disabled={isLoading}
             className="w-full bg-[#111111] text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all flex items-center justify-center space-x-3 shadow-lg shadow-black/5 disabled:opacity-50">
              <span>{isLoading ? 'Accediendo...' : 'Iniciar Sesión'}</span>
              <ArrowRight size={14} />
           </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-[#EDEDED] space-y-6">
           <Link to="/register" className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 hover:text-[#111111] transition-colors">
             ¿No tienes cuenta? Regístrate
           </Link>

           <div className="flex items-center justify-center space-x-12 pt-4">
              <div className="h-px bg-[#EDEDED] flex-1" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/20">O</span>
              <div className="h-px bg-[#EDEDED] flex-1" />
           </div>

           <div className="flex flex-col space-y-4">
              <button className="w-full border border-[#EDEDED] py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#EDEDED] transition-colors flex items-center justify-center space-x-3">
                 <span>Acceder con Google</span>
              </button>
           </div>
        </div>
      </div>
    </main>
  );
};
