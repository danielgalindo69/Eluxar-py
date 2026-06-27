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
    <div className="mt-24 border-t border-[#EDEDED] dark:border-[#2A2A2A] pt-16">
      <div className="flex flex-col md:flex-row gap-16">
        
        {/* Formulario de Reseña */}
        <div className="w-full md:w-1/3">
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#111111] dark:text-white mb-6 pb-4 border-b border-[#EDEDED] dark:border-[#2A2A2A]">Deja tu Opinión</h3>
          
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Calificación</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-all hover:scale-110 active:scale-95 group"
                    >
                      <Star 
                        size={28} 
                        strokeWidth={1.5}
                        className={`transition-colors ${star <= rating ? 'fill-[var(--color-gold)] text-[var(--color-gold)]' : 'text-[#EDEDED] dark:text-white/20 group-hover:text-[var(--color-gold)]'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Tu Experiencia</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe qué te pareció esta fragancia..."
                  className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-4 text-sm font-light text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)] min-h-[140px] resize-none"
                />
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[var(--color-gold)] text-[#111111] py-4 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-[#b8946a] transition-colors rounded-sm disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Publicar Valoración'}
              </motion.button>
            </form>
          ) : (
            <div className="bg-[#F5F5F5] dark:bg-[var(--bg-surface)] p-8 text-center border border-[#DEDEDE] dark:border-[#2A2A2A] rounded-sm">
              <User className="mx-auto text-[#2B2B2B]/30 dark:text-white/30 mb-4" size={32} strokeWidth={1} />
              <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-[#2B2B2B]/60 dark:text-white/60 mb-6 leading-relaxed">Inicia sesión para compartir tu experiencia con la comunidad Eluxar.</p>
              <a href="/auth" className="inline-block border border-[var(--color-gold)] dark:border-[var(--color-gold)]/70 text-[var(--color-gold)] px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[var(--color-gold)] hover:text-[#111111] dark:hover:bg-[var(--color-gold)] dark:hover:text-[#111111] transition-colors rounded-sm">
                Iniciar Sesión
              </a>
            </div>
          )}
        </div>

        {/* Lista de Reseñas */}
        <div className="w-full md:w-2/3">
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#111111] dark:text-white mb-6 pb-4 border-b border-[#EDEDED] dark:border-[#2A2A2A]">Valoraciones de Clientes</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[var(--color-gold)]" size={24} />
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Star className="text-[#EDEDED] dark:text-white/10 mb-4" size={48} strokeWidth={1} />
              <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-[#2B2B2B]/40 dark:text-white/40">Sé el primero en compartir tu experiencia</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={review.id} 
                  className="bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border border-[#DEDEDE] dark:border-[#2A2A2A] rounded-sm py-5 px-6 flex flex-col space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[var(--color-gold)]/20 rounded-full flex items-center justify-center text-[10px] font-bold text-[var(--color-gold)] tracking-widest shrink-0">
                        {review.usuarioIniciales}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-[#111111] dark:text-white">{review.usuarioNombre}</p>
                        <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/40 uppercase tracking-widest mt-0.5">{new Date(review.creadoEn).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {[...Array(5)].map((_, index) => (
                        <Star 
                          key={index} 
                          size={14} 
                          strokeWidth={1.5}
                          className={index < review.calificacion ? 'fill-[var(--color-gold)] text-[var(--color-gold)]' : 'text-[#EDEDED] dark:text-white/20'} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm font-light text-[#2B2B2B]/80 dark:text-white/80 leading-relaxed">{review.comentario}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
