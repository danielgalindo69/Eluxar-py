
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { AuthAwareLink } from "../../../features/auth/components/AuthAwareLink";

export const Hero = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center bg-[#EDEDED] dark:bg-[var(--bg-surface)] overflow-hidden">


      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <span className="text-[#3A4A3F] dark:text-[#A5BAA8] uppercase tracking-[0.4em] text-xs font-semibold mb-6">
            Colección Atemporal
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#111111] dark:text-white leading-tight tracking-tight mb-8">
            La Esencia del <br />
            Equilibrio Puro
          </h1>
          <p className="text-[#2B2B2B]/70 dark:text-white/70 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Descubre fragancias diseñadas para trascender el género.
            Una oda al minimalismo, la sofisticación y el lujo contemporáneo.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <AuthAwareLink to="/fragrance-test" customMessage="Inicia sesión para realizar el test olfativo y encontrar tu fragancia ideal." className="inline-flex items-center justify-center bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-10 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-all duration-300">
              Descubre tu aroma con IA
            </AuthAwareLink>
            <Link to="/catalog" className="inline-flex items-center justify-center border border-[#111111]/20 dark:border-white/20 text-[#111111] dark:text-white px-10 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:border-[#111111] dark:hover:border-white transition-all duration-300 group">
              Ver Colección
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>

    </section>
  );
};
