import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import { Loader2, AlertCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { paymentAPI, MercadoPagoBrickFormData } from '../../../core/api/payments';

// ─── Tipos ──────────────────────────────────────────────────────

interface MercadoPagoBrickProps {
  preferenceId: string;
  pedidoId: number;
  amount: number;
  onSuccess?: () => void;
  onError?: (error?: unknown) => void;
  onReady?: () => void;
}

// Public key de las variables de entorno (.env)
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY as string;

// ─── Componente ──────────────────────────────────────────────────

/**
 * MercadoPagoBrick
 * Inicializa el SDK de MP y renderiza el Payment Brick oficial.
 *
 * Implementación: Opción B (formulario incrustado).
 * El Brick tokeniza la tarjeta en el navegador y expone un formData
 * en el callback onSubmit. Este componente envía ese formData al
 * backend via /api/payments/process-payment, que crea el pago real
 * con el SDK de Java. El token NUNCA toca nuestros servidores en crudo.
 */
export const MercadoPagoBrick = ({
  preferenceId,
  pedidoId,
  amount,
  onSuccess,
  onError,
  onReady,
}: MercadoPagoBrickProps) => {
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Detectar el tema activo del sistema para pasarlo al Brick
  const [isDarkMode, setIsDarkMode] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    try {
      initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-CO' });
      setIsSDKReady(true);
    } catch (err) {
      console.error('[MercadoPagoBrick] Error al inicializar SDK:', err);
      setInitError('No se pudo inicializar el módulo de pago. Intenta recargar la página.');
    }
  }, []);

  // ── Estado de error de inicialización ─────────────────────────
  if (initError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <AlertCircle size={32} className="text-red-500" strokeWidth={1.5} />
        <p className="text-sm text-red-500 font-medium">{initError}</p>
      </div>
    );
  }

  // ── Loading mientras el SDK carga ─────────────────────────────
  if (!isSDKReady) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Loader2 size={28} className="animate-spin text-[#3A4A3F]" strokeWidth={1.5} />
        <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/50 dark:text-white/40">
          Inicializando módulo de pago seguro...
        </p>
      </div>
    );
  }

  // ── Payment Brick ─────────────────────────────────────────────
  return (
    <div className="w-full rounded-sm overflow-hidden relative">
      {/* Overlay mientras se procesa el pago para evitar doble submit */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/70 dark:bg-black/70 z-10 flex flex-col items-center justify-center gap-3">
          <Loader2 size={28} className="animate-spin text-[#3A4A3F]" strokeWidth={1.5} />
          <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/60 font-bold">
            Procesando pago...
          </p>
        </div>
      )}

      <div
        style={{ background: isDarkMode ? 'var(--bg-surface, #1a1a1a)' : '#ffffff' }}
        id="mercadopago-brick-container"
      >
        <Payment
          initialization={{
            amount: amount,
            preferenceId,
          }}
          customization={{
            paymentMethods: {
              creditCard: 'all',
              debitCard: 'all',
              bankTransfer: 'all',   // PSE en Colombia
              ticket: [],            // Sin efectivo (array vacío = desactivado)
              mercadoPago: [],       // Sin wallet MP
              maxInstallments: 12,
            },
            visual: {
              style: {
                theme: isDarkMode ? 'dark' : 'default',
                customVariables: {
                  baseColor: '#3A4A3F',
                  baseColorFirstVariant: '#2d3d32',
                  baseColorSecondVariant: '#A5BAA8',
                  formBackgroundColor: isDarkMode ? '#161616' : '#ffffff',
                  fontSizeSmall: '10px',
                  fontSizeMedium: '12px',
                  fontSizeLarge: '14px',
                  borderRadiusFull: '0px',
                },
              },
            },
          }}
          onSubmit={async (param) => {
            // El Brick llama onSubmit con los datos tokenizados del formulario.
            // Enviamos esos datos al backend para crear el pago real.
            const formData = param.formData as MercadoPagoBrickFormData;

            setIsProcessing(true);
            try {
              const result = await paymentAPI.processPayment(formData, pedidoId);

              if (result.status === 'approved') {
                onSuccess?.();
              } else if (result.status === 'pending' || result.status === 'in_process') {
                // PSE u otros métodos que quedan pendientes — también navegamos al éxito
                // El webhook actualizará el estado cuando se confirme
                onSuccess?.();
              } else {
                // rejected
                console.warn('[MercadoPagoBrick] Pago rechazado:', result.statusDetail);
                onError?.(result.statusDetail);
              }
            } catch (err) {
              console.error('[MercadoPagoBrick] Error al procesar pago:', err);
              onError?.(err);
            } finally {
              setIsProcessing(false);
            }
          }}
          onError={(error) => {
            console.error('[MercadoPagoBrick] Error del Brick:', error);
            onError?.(error);
          }}
          onReady={() => {
            onReady?.();
          }}
        />
      </div>
    </div>
  );
};
