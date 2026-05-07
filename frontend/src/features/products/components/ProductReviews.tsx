import { useState, useEffect } from "react";
import { reviewsAPI } from "../../../core/api/api";
import { Star, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

interface Review {
  id: number;
  usuarioNombre: string;
  usuarioIniciales: string;
  calificacion: number;
  comentario: string;
  creadoEn: string;
}

export const ProductReviews = ({ productId, onReviewAdded }: { productId: string, onReviewAdded?: () => void }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userStr = localStorage.getItem('eluxar_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const data = await reviewsAPI.getByProductId(productId);
      if (data && data.content) {
        setReviews(data.content);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Debes iniciar sesión para dejar una valoración");
      return;
    }
    if (!comment.trim()) {
      toast.error("El comentario no puede estar vacío");
      return;
    }

    try {
      setIsSubmitting(true);
      await reviewsAPI.createOrUpdate(productId, rating, comment);
      toast.success("Tu valoración ha sido publicada");
      setComment("");
      setRating(5);
      fetchReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      console.error("Error posting review:", err);
      toast.error("Ocurrió un error al enviar la valoración");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-24 border-t border-[#EDEDED] dark:border-white/10 pt-16">
      <div className="flex flex-col md:flex-row gap-16">
        
        {/* Formulario de Reseña */}
        <div className="w-full md:w-1/3">
          <h3 className="text-2xl font-light text-[#111111] dark:text-white mb-6">Deja tu Opinión</h3>
          
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/60">Calificación</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`transition-colors ${star <= rating ? 'text-[#3A4A3F] dark:text-[#A5BAA8]' : 'text-[#EDEDED] dark:text-white/10 hover:text-[#3A4A3F]/50'}`}
                    >
                      <Star size={24} className={star <= rating ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/60">Tu Experiencia</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe qué te pareció esta fragancia..."
                  className="w-full bg-[#EDEDED]/50 dark:bg-white/5 border-none p-4 text-sm font-light min-h-[120px] focus:ring-1 focus:ring-[#111111] dark:focus:ring-white outline-none transition-all placeholder:text-[#2B2B2B]/30"
                />
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#E5E5E5] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Publicar Valoración'}
              </motion.button>
            </form>
          ) : (
            <div className="bg-[#EDEDED]/50 dark:bg-white/5 p-8 text-center border border-[#EDEDED] dark:border-white/10">
              <User className="mx-auto text-[#2B2B2B]/40 mb-4" size={32} />
              <p className="text-sm font-light text-[#2B2B2B]/80 dark:text-white/80 mb-4">Inicia sesión para compartir tu experiencia con la comunidad Eluxar.</p>
              <a href="/auth" className="inline-block border border-[#111111] dark:border-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111] transition-colors">
                Iniciar Sesión
              </a>
            </div>
          )}
        </div>

        {/* Lista de Reseñas */}
        <div className="w-full md:w-2/3">
          <h3 className="text-2xl font-light text-[#111111] dark:text-white mb-6">Valoraciones de Clientes</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[#3A4A3F]" size={24} />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-[#2B2B2B]/50 dark:text-white/50 font-light italic">Aún no hay valoraciones para este producto. ¡Sé el primero en opinar!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={review.id} 
                  className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/10 p-6 flex flex-col space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#EDEDED] dark:bg-white/10 rounded-full flex items-center justify-center text-[10px] font-bold text-[#111111] dark:text-white tracking-widest">
                        {review.usuarioIniciales}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{review.usuarioNombre}</p>
                        <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/40 uppercase tracking-widest">{new Date(review.creadoEn).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 text-[#3A4A3F] dark:text-[#A5BAA8]">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} size={14} className={index < review.calificacion ? 'fill-current' : 'text-[#EDEDED] dark:text-white/10'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-light text-[#2B2B2B]/80 dark:text-white/80 leading-relaxed">"{review.comentario}"</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
