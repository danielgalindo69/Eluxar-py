import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router';
import { authAPI } from '../services/api';
import { User, Mail, Lock, UserPlus, LogIn, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const AdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Sesión de administrador iniciada');
        navigate('/admin');
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Las contraseñas no coinciden');
          return;
        }
        await authAPI.registerAdmin({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        });
        toast.success('Administrador registrado exitosamente. Ahora puedes iniciar sesión.');
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocurrió un error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#EDEDED] flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full bg-white shadow-2xl border border-[#EDEDED] overflow-hidden">
        {/* Header */}
        <div className="bg-[#3A4A3F] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-32 h-32 bg-[#111111]/20 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 bg-white flex items-center justify-center rounded-none mb-4">
              <ShieldCheck className="text-[#3A4A3F]" size={24} />
            </div>
            <h1 className="text-white text-xl font-light tracking-[0.3em] uppercase">Eluxar Admin</h1>
            <p className="text-white/60 text-[10px] uppercase tracking-widest mt-2">Acceso restringido a personal autorizado</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-10">
          <div className="flex mb-8 border-b border-[#EDEDED]">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-4 text-[10px] uppercase tracking-widest font-bold transition-colors ${isLogin ? 'text-[#3A4A3F] border-b-2 border-[#3A4A3F]' : 'text-[#2B2B2B]/40 hover:text-[#111111]'}`}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-4 text-[10px] uppercase tracking-widest font-bold transition-colors ${!isLogin ? 'text-[#3A4A3F] border-b-2 border-[#3A4A3F]' : 'text-[#2B2B2B]/40 hover:text-[#111111]'}`}
            >
              Registrar Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Nombre</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/30 group-focus-within:text-[#3A4A3F] transition-colors" size={14} />
                    <input 
                      type="text" 
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Ej: Marc"
                      className="w-full bg-[#EDEDED]/50 border-none px-10 py-3 text-xs placeholder:text-[#2B2B2B]/20 focus:ring-1 focus:ring-[#3A4A3F] outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Apellido</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/30 group-focus-within:text-[#3A4A3F] transition-colors" size={14} />
                    <input 
                      type="text" 
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Ej: Antoine"
                      className="w-full bg-[#EDEDED]/50 border-none px-10 py-3 text-xs placeholder:text-[#2B2B2B]/20 focus:ring-1 focus:ring-[#3A4A3F] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Email Corporativo</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/30 group-focus-within:text-[#3A4A3F] transition-colors" size={14} />
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@eluxar.com"
                  className="w-full bg-[#EDEDED]/50 border-none px-10 py-3 text-xs placeholder:text-[#2B2B2B]/20 focus:ring-1 focus:ring-[#3A4A3F] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/30 group-focus-within:text-[#3A4A3F] transition-colors" size={14} />
                <input 
                  type="password" 
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-[#EDEDED]/50 border-none px-10 py-3 text-xs placeholder:text-[#2B2B2B]/20 focus:ring-1 focus:ring-[#3A4A3F] outline-none transition-all"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Confirmar Contraseña</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/30 group-focus-within:text-[#3A4A3F] transition-colors" size={14} />
                  <input 
                    type="password" 
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-[#EDEDED]/50 border-none px-10 py-3 text-xs placeholder:text-[#2B2B2B]/20 focus:ring-1 focus:ring-[#3A4A3F] outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#111111] text-white py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#3A4A3F] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                isLogin ? <LogIn size={16} /> : <UserPlus size={16} />
              )}
              <span>{isLogin ? 'Acceder al Panel' : 'Crear Cuenta Admin'}</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#EDEDED] text-center">
            <p className="text-[10px] text-[#2B2B2B]/40 uppercase tracking-widest">
              Al acceder, aceptas los términos de seguridad del sistema Eluxar OS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
