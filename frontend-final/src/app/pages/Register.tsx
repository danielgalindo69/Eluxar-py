import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export const Register = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = 'El nombre es obligatorio';
    if (!formData.lastName.trim()) errs.lastName = 'El apellido es obligatorio';
    if (!formData.email.trim()) errs.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Correo no válido';
    if (!formData.password) errs.password = 'La contraseña es obligatoria';
    else if (formData.password.length < 8) errs.password = 'Mínimo 8 caracteres';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden';
    if (!acceptTerms) errs.terms = 'Debes aceptar los términos';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register(formData.firstName, formData.lastName, formData.email, formData.password);
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/');
    } catch {
      toast.error('Error al crear la cuenta');
    }
  };

  const update = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 pt-32 pb-24">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-light text-[#111111] tracking-tight uppercase tracking-[0.3em]">Crear Cuenta</h1>
          <p className="text-[#2B2B2B]/40 text-[10px] uppercase tracking-[0.2em] font-bold">
            Únete a la experiencia exclusiva de alta perfumería
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name & Last Name */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Nombre</label>
              <div className="relative border-b border-[#2B2B2B]/20 py-2 group focus-within:border-[#111111] transition-colors">
                <User className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/20 group-focus-within:text-[#111111]" size={16} />
                <input type="text" value={formData.firstName} onChange={(e) => update('firstName', e.target.value)} className="bg-transparent border-none outline-none w-full text-sm font-medium pr-10" />
              </div>
              {errors.firstName && <span className="text-red-500 text-[10px] uppercase tracking-widest">{errors.firstName}</span>}
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Apellido</label>
              <div className="relative border-b border-[#2B2B2B]/20 py-2 group focus-within:border-[#111111] transition-colors">
                <User className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/20 group-focus-within:text-[#111111]" size={16} />
                <input type="text" value={formData.lastName} onChange={(e) => update('lastName', e.target.value)} className="bg-transparent border-none outline-none w-full text-sm font-medium pr-10" />
              </div>
              {errors.lastName && <span className="text-red-500 text-[10px] uppercase tracking-widest">{errors.lastName}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Correo Electrónico</label>
            <div className="relative border-b border-[#2B2B2B]/20 py-2 group focus-within:border-[#111111] transition-colors">
              <Mail className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/20 group-focus-within:text-[#111111]" size={16} />
              <input type="email" value={formData.email} onChange={(e) => update('email', e.target.value)} className="bg-transparent border-none outline-none w-full text-sm font-medium pr-10" />
            </div>
            {errors.email && <span className="text-red-500 text-[10px] uppercase tracking-widest">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Contraseña</label>
            <div className="relative border-b border-[#2B2B2B]/20 py-2 group focus-within:border-[#111111] transition-colors">
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/20 hover:text-[#111111]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => update('password', e.target.value)} className="bg-transparent border-none outline-none w-full text-sm font-medium pr-10" />
            </div>
            {errors.password && <span className="text-red-500 text-[10px] uppercase tracking-widest">{errors.password}</span>}
            <div className="flex gap-1 mt-1">
              {[1,2,3,4].map(i => (
                <div key={i} className={`h-0.5 flex-1 transition-colors ${formData.password.length >= i * 3 ? 'bg-[#3A4A3F]' : 'bg-[#EDEDED]'}`} />
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Confirmar Contraseña</label>
            <div className="relative border-b border-[#2B2B2B]/20 py-2 group focus-within:border-[#111111] transition-colors">
              <Lock className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/20 group-focus-within:text-[#111111]" size={16} />
              <input type="password" value={formData.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} className="bg-transparent border-none outline-none w-full text-sm font-medium pr-10" />
            </div>
            {errors.confirmPassword && <span className="text-red-500 text-[10px] uppercase tracking-widest">{errors.confirmPassword}</span>}
          </div>

          {/* Terms */}
          <div className="flex items-start space-x-3">
            <button type="button" onClick={() => { setAcceptTerms(!acceptTerms); if (errors.terms) setErrors(prev => { const n = { ...prev }; delete n.terms; return n; }); }}
              className={`w-5 h-5 border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${acceptTerms ? 'bg-[#111111] border-[#111111]' : 'border-[#2B2B2B]/20'}`}
            >
              {acceptTerms && <Check size={12} className="text-white" />}
            </button>
            <span className="text-[11px] text-[#2B2B2B]/60 leading-relaxed">
              Acepto los <a href="#" className="underline hover:text-[#111111]">Términos y Condiciones</a> y la <a href="#" className="underline hover:text-[#111111]">Política de Privacidad</a> de Eluxar.
            </span>
          </div>
          {errors.terms && <span className="text-red-500 text-[10px] uppercase tracking-widest">{errors.terms}</span>}

          <button type="submit" disabled={isLoading}
            className="w-full bg-[#111111] text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all flex items-center justify-center space-x-3 shadow-lg shadow-black/5 disabled:opacity-50"
          >
            <span>{isLoading ? 'Creando...' : 'Crear Perfil'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center pt-8 border-t border-[#EDEDED]">
          <Link to="/auth" className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 hover:text-[#111111] transition-colors">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </main>
  );
};
