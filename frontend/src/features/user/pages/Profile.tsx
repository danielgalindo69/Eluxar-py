import { useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { authAPI } from "../../../core/api/api";
import { User, Mail, Phone, Lock, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import ProfileImageUpload from "../components/ProfileImageUpload";

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validateProfile = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'El nombre es obligatorio';
    if (!formData.email.trim()) errs.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Correo no válido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePassword = () => {
    const errs: Record<string, string> = {};
    if (!passwordData.oldPassword) errs.oldPassword = 'Introduce tu contraseña actual';
    if (!passwordData.newPassword) errs.newPassword = 'La nueva contraseña es obligatoria';
    else if (passwordData.newPassword.length < 8) errs.newPassword = 'Mínimo 8 caracteres';
    if (passwordData.newPassword !== passwordData.confirmPassword) errs.confirmPassword = 'No coinciden';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    setIsSaving(true);
    try {
      await authAPI.updateProfile(formData);
      updateUser(formData);
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch { toast.error('Error al actualizar'); }
    finally { setIsSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    setIsSaving(true);
    try {
      //hay que implementar la recuperacion de contraseña
      await authAPI.changePassword(passwordData.oldPassword, passwordData.newPassword);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
      toast.success('Contraseña actualizada correctamente');
    } catch { toast.error('Error al cambiar contraseña'); }
    finally { setIsSaving(false); }
  };

  return (
    <main className="pt-32 pb-24 bg-[#FCFCFC] min-h-screen px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-light text-[#111111] tracking-tight mb-4 text-center sm:text-left">Mi Perfil</h1>
        <p className="text-sm text-[#2B2B2B]/50 font-light mb-12 text-center sm:text-left">Gestiona tus datos personales y preferencias de cuenta</p>

        {/* Unified Dashboard Card */}
        <div className="bg-white border border-[#EDEDED] shadow-[0_10px_60px_rgba(0,0,0,0.02)] flex flex-col md:flex-row overflow-hidden rounded-sm">
          
          {/* LEFT COLUMN: Profile & Identity */}
          <div className="w-full md:w-[35%] bg-[#F9F9F9] border-r border-[#EDEDED] py-16 flex flex-col items-center justify-center">
            <ProfileImageUpload displayName={formData.name} />
          </div>

          {/* RIGHT COLUMN: Personal Data Form */}
          <div className="w-full md:w-[65%] p-10 md:p-16">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#111111]">Datos Personales</h2>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#3A4A3F] hover:text-[#111111] transition-colors">Editar</button>
              ) : (
                <div className="flex gap-6">
                  <button onClick={() => { setIsEditing(false); setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' }); setErrors({}); }}
                    className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/40 hover:text-[#111111]">Cancelar</button>
                  <button onClick={handleSaveProfile} disabled={isSaving} className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#3A4A3F] hover:text-[#111111] flex items-center gap-2">
                    <Save size={12} />{isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-10">
              {/* Name Field */}
              <div className="flex flex-col space-y-3">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#2B2B2B]/30">Nombre</label>
                <div className="relative border-b border-[#EDEDED] pb-3 group">
                  <User className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/15 group-hover:text-[#111111]/30 transition-colors" size={18} />
                  <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    disabled={!isEditing} className="bg-transparent border-none outline-none w-full text-[15px] font-medium pr-10 disabled:text-[#2B2B2B]/60 transition-all focus:border-b-[#111111]" />
                </div>
                {errors.name && <span className="text-red-500 text-[9px] uppercase tracking-widest font-bold">{errors.name}</span>}
              </div>

              {/* Email Field */}
              <div className="flex flex-col space-y-3">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#2B2B2B]/30">Correo Electrónico</label>
                <div className="relative border-b border-[#EDEDED] pb-3 group">
                  <Mail className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/15 group-hover:text-[#111111]/30 transition-colors" size={18} />
                  <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    disabled={!isEditing} className="bg-transparent border-none outline-none w-full text-[15px] font-medium pr-10 disabled:text-[#2B2B2B]/60 transition-all" />
                </div>
                {errors.email && <span className="text-red-500 text-[9px] uppercase tracking-widest font-bold">{errors.email}</span>}
              </div>

              {/* Phone Field */}
              <div className="flex flex-col space-y-3">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#2B2B2B]/30">Teléfono</label>
                <div className="relative border-b border-[#EDEDED] pb-3 group">
                  <Phone className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/15 group-hover:text-[#111111]/30 transition-colors" size={18} />
                  <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    disabled={!isEditing} placeholder="Opcional" className="bg-transparent border-none outline-none w-full text-[15px] font-medium pr-10 disabled:text-[#2B2B2B]/60 placeholder:text-[#2B2B2B]/20 transition-all" />
                </div>
              </div>

              {/* Role Field (Static) */}
              <div className="flex flex-col space-y-3 pt-4">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#2B2B2B]/30">Rol</label>
                <div>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold bg-[#3A4A3F] text-white px-4 py-2 rounded-sm shadow-sm inline-block">
                    {user?.role || 'CLIENTE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password - Kept separate but styled to match */}
        <div className="mt-8 bg-white border border-[#EDEDED] shadow-[0_10px_60px_rgba(0,0,0,0.02)] p-10 md:p-16 rounded-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#111111]">Seguridad</h2>
            <button onClick={() => { setShowPasswordChange(!showPasswordChange); setErrors({}); }}
              className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#3A4A3F] hover:text-[#111111] transition-colors flex items-center gap-2">
              <Lock size={12} />{showPasswordChange ? 'Cancelar' : 'Cambiar Contraseña'}
            </button>
          </div>

          {showPasswordChange && (
            <div className="space-y-10 pt-10">
              <div className="flex flex-col space-y-3">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#2B2B2B]/30">Contraseña Actual</label>
                <div className="relative border-b border-[#EDEDED] pb-3">
                  <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/15 hover:text-[#111111] transition-colors">
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <input type={showOldPassword ? "text" : "password"} value={passwordData.oldPassword}
                    onChange={e => setPasswordData(p => ({ ...p, oldPassword: e.target.value }))}
                    className="bg-transparent border-none outline-none w-full text-[15px] font-medium pr-10" />
                </div>
                {errors.oldPassword && <span className="text-red-500 text-[9px] uppercase tracking-widest font-bold">{errors.oldPassword}</span>}
              </div>

              <div className="flex flex-col space-y-3">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#2B2B2B]/30">Nueva Contraseña</label>
                <div className="relative border-b border-[#EDEDED] pb-3">
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/15 hover:text-[#111111] transition-colors">
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <input type={showNewPassword ? "text" : "password"} value={passwordData.newPassword}
                    onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                    className="bg-transparent border-none outline-none w-full text-[15px] font-medium pr-10" />
                </div>
                {errors.newPassword && <span className="text-red-500 text-[9px] uppercase tracking-widest font-bold">{errors.newPassword}</span>}
              </div>

              <div className="flex flex-col space-y-3">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#2B2B2B]/30">Confirmar Nueva Contraseña</label>
                <div className="relative border-b border-[#EDEDED] pb-3">
                  <Lock className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/15" size={18} />
                  <input type="password" value={passwordData.confirmPassword}
                    onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                    className="bg-transparent border-none outline-none w-full text-[15px] font-medium pr-10" />
                </div>
                {errors.confirmPassword && <span className="text-red-500 text-[9px] uppercase tracking-widest font-bold">{errors.confirmPassword}</span>}
              </div>

              <button onClick={handleChangePassword} disabled={isSaving}
                className="bg-[#111111] text-white py-4 px-12 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all disabled:opacity-50 rounded-sm shadow-md">
                {isSaving ? 'Guardando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
