import { Link } from "react-router";
import { Instagram, Twitter, Youtube, Facebook, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('¡Suscripción confirmada! Te mantendremos al tanto.');
    setEmail('');
  };

  return (
    <footer className="bg-[#EDEDED] dark:bg-[#111111] py-24 px-6 border-t border-[#EDEDED]/0 dark:border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Info */}
          <div className="flex flex-col space-y-6">
            <span className="text-xl font-light tracking-[0.4em] uppercase text-[#111111] dark:text-white">Eluxar</span>
            <p className="text-[#2B2B2B]/60 dark:text-white/50 text-sm leading-relaxed max-w-xs font-light">
              Fragancias atemporales para espíritus modernos. Equilibrio puro en cada gota.
            </p>
            <div className="flex space-x-6 items-center">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><Instagram size={18} className="text-[#2B2B2B] dark:text-white/60 hover:opacity-50 transition-opacity cursor-pointer" /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><Twitter size={18} className="text-[#2B2B2B] dark:text-white/60 hover:opacity-50 transition-opacity cursor-pointer" /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><Youtube size={18} className="text-[#2B2B2B] dark:text-white/60 hover:opacity-50 transition-opacity cursor-pointer" /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><Facebook size={18} className="text-[#2B2B2B] dark:text-white/60 hover:opacity-50 transition-opacity cursor-pointer" /></a>
            </div>
          </div>

          {/* Links 1 */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] dark:text-white">Explorar</h4>
            <ul className="space-y-3 text-sm text-[#2B2B2B]/60 dark:text-white/50 font-light">
              <li><Link to="/catalog" className="hover:text-[#111111] dark:hover:text-white transition-colors">Catálogo</Link></li>
              <li><Link to="/search" className="hover:text-[#111111] dark:hover:text-white transition-colors">Buscador</Link></li>
              <li><Link to="/fragrance-test" className="hover:text-[#111111] dark:hover:text-white transition-colors">Test Olfativo IA</Link></li>
              <li><Link to="/recommendations" className="hover:text-[#111111] dark:hover:text-white transition-colors">Recomendaciones</Link></li>
              <li><Link to="/chat" className="hover:text-[#111111] dark:hover:text-white transition-colors">Asistente Virtual</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] dark:text-white">Mi Cuenta</h4>
            <ul className="space-y-3 text-sm text-[#2B2B2B]/60 dark:text-white/50 font-light">
              <li><Link to="/auth" className="hover:text-[#111111] dark:hover:text-white transition-colors">Iniciar Sesión</Link></li>
              <li><Link to="/register" className="hover:text-[#111111] dark:hover:text-white transition-colors">Crear Cuenta</Link></li>
              <li><Link to="/profile" className="hover:text-[#111111] dark:hover:text-white transition-colors">Mi Perfil</Link></li>
              <li><Link to="/order-history" className="hover:text-[#111111] dark:hover:text-white transition-colors">Mis Pedidos</Link></li>
              <li><Link to="/profile/addresses" className="hover:text-[#111111] dark:hover:text-white transition-colors">Direcciones</Link></li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="flex flex-col space-y-6">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] dark:text-white">Suscríbete</h4>
            <p className="text-[#2B2B2B]/60 dark:text-white/50 text-sm font-light">Únete a nuestra lista para recibir novedades exclusivas y lanzamientos.</p>
            <form onSubmit={handleNewsletter} className="relative border-b border-[#2B2B2B]/20 dark:border-white/20 pb-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                className="bg-transparent border-none outline-none text-sm w-full font-light text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30"
              />
              <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B] dark:text-white hover:opacity-50 transition-opacity">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-[#2B2B2B]/10 dark:border-white/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 dark:text-white/30 font-medium">
          <p>© 2026 ELUXAR. Todos los derechos reservados.</p>
          <div className="flex space-x-8">
            <Link to="/privacidad" className="hover:text-[#111111] dark:hover:text-white transition-colors">Privacidad</Link>
            <Link to="/terminos" className="hover:text-[#111111] dark:hover:text-white transition-colors">Términos</Link>
            <Link to="/cookies" className="hover:text-[#111111] dark:hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
