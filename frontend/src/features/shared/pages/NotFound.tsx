import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

export const NotFound = () => {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#3A4A3F] font-bold mb-8">
            Error 404
          </p>
          <h1 className="text-7xl md:text-9xl font-light text-[#111111] tracking-tight mb-4">
            404
          </h1>
          <p className="text-xl font-light text-[#2B2B2B]/60 mb-4">
            Página no encontrada
          </p>
          <p className="text-sm font-light text-[#2B2B2B]/40 mb-12 max-w-sm mx-auto">
            La página que buscas no existe o ha sido movida. Vuelve al inicio para continuar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-[#111111] text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] transition-colors"
            >
              <ArrowLeft size={14} />
              Volver al Inicio
            </Link>
            <Link
              to="/catalog"
              className="border border-[#111111] text-[#111111] px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] hover:text-white transition-colors"
            >
              Ver Colección
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
};
