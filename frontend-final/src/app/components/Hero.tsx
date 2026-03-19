import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

export const Hero = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center bg-[#EDEDED] overflow-hidden">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1758560936904-4eb0049284aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcGVyZnVtZSUyMGJvdHRsZSUyMHN0dWRpbyUyMHBob3RvZ3JhcGh5JTIwbmV1dHJhbCUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzcxNzE4Nzk5fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Eluxar Hero Collection"
          className="w-full h-full object-cover opacity-90 scale-105"
        />
        <div className="absolute inset-0 bg-[#FFFFFF]/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <span className="text-[#3A4A3F] uppercase tracking-[0.4em] text-xs font-semibold mb-6">
            Colección Atemporal
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#111111] leading-tight tracking-tight mb-8">
            La Esencia del <br />
            Equilibrio Puro
          </h1>
          <p className="text-[#2B2B2B]/70 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Descubre fragancias diseñadas para trascender el género. 
            Una oda al minimalismo, la sofisticación y el lujo contemporáneo.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/catalog" className="bg-[#111111] text-white px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#3A4A3F] transition-colors duration-300">
              Descubre tu aroma con IA
            </Link>
            <Link to="/catalog" className="border border-[#111111] text-[#111111] px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#111111] hover:text-white transition-all duration-300 flex items-center group">
              Ver Colección
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Subtle Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-[#2B2B2B]/40"
      >
        <span className="text-[10px] uppercase tracking-widest mb-2">Deslizar</span>
        <div className="w-px h-12 bg-[#2B2B2B]/20" />
      </motion.div>
    </section>
  );
};
