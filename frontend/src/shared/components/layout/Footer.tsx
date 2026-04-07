import { Link } from "react-router";
import { Instagram, Twitter, Youtube, Facebook, ArrowRight } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[#EDEDED] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Info */}
          <div className="flex flex-col space-y-6">
            <span className="text-xl font-light tracking-[0.4em] uppercase text-[#111111]">Eluxar</span>
            <p className="text-[#2B2B2B]/60 text-sm leading-relaxed max-w-xs font-light">
              Fragancias atemporales para espíritus modernos. Equilibrio puro en cada gota.
            </p>
            <div className="flex space-x-6 items-center">
              <Instagram size={18} className="text-[#2B2B2B] hover:opacity-50 transition-opacity cursor-pointer" />
              <Twitter size={18} className="text-[#2B2B2B] hover:opacity-50 transition-opacity cursor-pointer" />
              <Youtube size={18} className="text-[#2B2B2B] hover:opacity-50 transition-opacity cursor-pointer" />
              <Facebook size={18} className="text-[#2B2B2B] hover:opacity-50 transition-opacity cursor-pointer" />
            </div>
          </div>

          {/* Links 1 */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#111111]">Explorar</h4>
            <ul className="space-y-3 text-sm text-[#2B2B2B]/60 font-light">
              <li><Link to="/catalog" className="hover:text-[#111111] transition-colors">Catálogo</Link></li>
              <li><Link to="/search" className="hover:text-[#111111] transition-colors">Buscador</Link></li>
              <li><Link to="/fragrance-test" className="hover:text-[#111111] transition-colors">Test Olfativo IA</Link></li>
              <li><Link to="/recommendations" className="hover:text-[#111111] transition-colors">Recomendaciones</Link></li>
              <li><Link to="/chat" className="hover:text-[#111111] transition-colors">Asistente Virtual</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#111111]">Mi Cuenta</h4>
            <ul className="space-y-3 text-sm text-[#2B2B2B]/60 font-light">
              <li><Link to="/auth" className="hover:text-[#111111] transition-colors">Iniciar Sesión</Link></li>
              <li><Link to="/register" className="hover:text-[#111111] transition-colors">Crear Cuenta</Link></li>
              <li><Link to="/profile" className="hover:text-[#111111] transition-colors">Mi Perfil</Link></li>
              <li><Link to="/order-history" className="hover:text-[#111111] transition-colors">Mis Pedidos</Link></li>
              <li><Link to="/profile/addresses" className="hover:text-[#111111] transition-colors">Direcciones</Link></li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="flex flex-col space-y-6">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#111111]">Suscríbete</h4>
            <p className="text-[#2B2B2B]/60 text-sm font-light">Únete a nuestra lista para recibir novedades exclusivas y lanzamientos.</p>
            <div className="relative border-b border-[#2B2B2B]/20 pb-2">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="bg-transparent border-none outline-none text-sm w-full font-light placeholder:text-[#2B2B2B]/30"
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B] hover:opacity-50 transition-opacity">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-[#2B2B2B]/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 font-medium">
          <p>© 2026 ELUXAR. Todos los derechos reservados.</p>
          <div className="flex space-x-8">
            <a href="#" className="hover:text-[#111111] transition-colors">Privacidad</a>
            <a href="#" className="hover:text-[#111111] transition-colors">Términos</a>
            <a href="#" className="hover:text-[#111111] transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
