package com.eluxar.modules.pagos.service;

import com.eluxar.modules.pagos.dto.PaymentPreferenceRequest;
import com.eluxar.modules.pagos.dto.PaymentPreferenceResponse;
import com.eluxar.modules.pagos.dto.ProcessPaymentRequest;
import com.eluxar.modules.pagos.dto.ProcessPaymentResponse;
import com.eluxar.modules.ventas.service.PedidoService;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferencePaymentMethodsRequest;
import com.mercadopago.client.preference.PreferencePaymentTypeRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio encargado de la creación de preferencias de pago con Mercado Pago.
 * Toda la lógica de integración con el SDK queda aislada aquí;
 * el controlador solo delega y maneja errores HTTP.
 */
@Slf4j
@Service
public class PaymentService {

    /** Referencia lazy para evitar dependencia circular (PedidoService → PaymentService → PedidoService). */
    private final PedidoService pedidoService;

    public PaymentService(@Lazy PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.backend-url}")
    private String backendUrl;

    @PostConstruct
    public void init() {
        log.info("[PaymentService] URLs cargadas desde propiedades — Frontend: '{}', Backend: '{}'", frontendUrl, backendUrl);
    }

    /**
     * Crea una preferencia de pago en Mercado Pago a partir del carrito del usuario.
     *
     * @param request DTO con ítems del carrito y datos del comprador
     * @return DTO con preferenceId listo para inicializar el Checkout Brick
     */
    public PaymentPreferenceResponse createPreference(PaymentPreferenceRequest request) {
        try {
            PreferenceClient client = new PreferenceClient();

            // ── Construir ítems ────────────────────────────────────
            List<PreferenceItemRequest> items = request.getItems().stream()
                    .map(item -> PreferenceItemRequest.builder()
                            .title(item.getTitle())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .currencyId("COP")
                            .build())
                    .collect(Collectors.toList());

            // ── Configurar métodos de pago permitidos ──────────────
            // Solo: tarjeta crédito, tarjeta débito, PSE (transferencia bancaria)
            PreferencePaymentMethodsRequest paymentMethods = PreferencePaymentMethodsRequest.builder()
                    .excludedPaymentTypes(List.of(
                            // Excluir efectivo, tickets, wallets (según restricciones del documento)
                            PreferencePaymentTypeRequest.builder().id("ticket").build(),
                            PreferencePaymentTypeRequest.builder().id("atm").build(),
                            PreferencePaymentTypeRequest.builder().id("prepaid_card").build()
                    ))
                    .installments(12)           // Máximo de cuotas permitidas
                    .defaultInstallments(1)     // Cuotas por defecto
                    .build();

            // ── Datos del comprador ────────────────────────────────
            PreferencePayerRequest payer = PreferencePayerRequest.builder()
                    .name(request.getPayerName())
                    .email(request.getPayerEmail())
                    .build();

            // ── Normalizar y Sanitizar URLs ────────────────────────
            String cleanFrontend = frontendUrl != null ? frontendUrl.trim() : "";
            if (cleanFrontend.endsWith("/")) {
                cleanFrontend = cleanFrontend.substring(0, cleanFrontend.length() - 1);
            }
            if (!cleanFrontend.isEmpty() && !cleanFrontend.startsWith("http://") && !cleanFrontend.startsWith("https://")) {
                cleanFrontend = "http://" + cleanFrontend;
            }

            String cleanBackend = backendUrl != null ? backendUrl.trim() : "";
            if (cleanBackend.endsWith("/")) {
                cleanBackend = cleanBackend.substring(0, cleanBackend.length() - 1);
            }
            if (!cleanBackend.isEmpty() && !cleanBackend.startsWith("http://") && !cleanBackend.startsWith("https://")) {
                cleanBackend = "http://" + cleanBackend;
            }

            log.info("[PaymentService] URLs sanitizadas: frontend='{}', backend='{}'", cleanFrontend, cleanBackend);

            // ── Configurar URLs de retorno ──────────────────────────
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(cleanFrontend + "/checkout/success")
                    .pending(cleanFrontend + "/checkout/pending")
                    .failure(cleanFrontend + "/checkout/failure")
                    .build();

            // ── Construir la preferencia completa ─────────────────
            // Configurado para producción: Vercel (frontend) + Render (backend).
            // autoReturn="approved" requiere back_url.success con URL pública, garantizado en producción.
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .payer(payer)
                    .paymentMethods(paymentMethods)
                    .backUrls(backUrls)
                    .autoReturn("approved")
                    .statementDescriptor("ELUXAR")
                    .externalReference(request.getExternalReference())
                    .notificationUrl(cleanBackend + "/api/payments/webhook")
                    .build();

            Preference preference = client.create(preferenceRequest);

            log.info("[PaymentService] Preferencia creada exitosamente: {}", preference.getId());

            return PaymentPreferenceResponse.builder()
                    .preferenceId(preference.getId())
                    .sandboxInitPoint(preference.getSandboxInitPoint())
                    .build();

        } catch (MPApiException e) {
            String mpErrorBody = e.getApiResponse().getContent();
            log.error("[PaymentService] Error de API Mercado Pago: status={}, body={}",
                    e.getApiResponse().getStatusCode(), mpErrorBody);
            throw new RuntimeException("Error MP API: " + mpErrorBody, e);
        } catch (MPException e) {
            log.error("[PaymentService] Error del SDK Mercado Pago: {}", e.getMessage());
            throw new RuntimeException("Error al comunicarse con Mercado Pago: " + e.getMessage(), e);
        }
    }

    /**
     * Calcula el total de una preferencia sumando (cantidad × precio) de cada ítem.
     * Útil para validaciones defensivas antes de crear la preferencia.
     */
    public BigDecimal calculateTotal(PaymentPreferenceRequest request) {
        return request.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Procesa un pago real usando el token de tarjeta generado por el Payment Brick.
     * Este método es llamado por el endpoint POST /api/payments/process-payment
     * cuando el frontend captura el formData del callback onSubmit del Brick.
     *
     * Si el pago queda 'approved', también actualiza el pedido directamente sin esperar
     * el webhook (doble confirmación de seguridad).
     *
     * @param request DTO con token, método de pago, cuotas y datos del comprador
     * @return DTO con paymentId, status y statusDetail de Mercado Pago
     */
    public ProcessPaymentResponse processPayment(ProcessPaymentRequest request) {
        try {
            PaymentClient client = new PaymentClient();

            // ── Construir datos del pagador ────────────────────────
            PaymentPayerRequest.PaymentPayerRequestBuilder payerBuilder = PaymentPayerRequest.builder()
                    .email(request.getPayerEmail());

            // La identificación es opcional en sandbox pero obligatoria en producción para Colombia
            if (request.getPayerIdentificationType() != null && request.getPayerIdentificationNumber() != null
                    && !request.getPayerIdentificationType().isBlank() && !request.getPayerIdentificationNumber().isBlank()) {
                payerBuilder.identification(IdentificationRequest.builder()
                        .type(request.getPayerIdentificationType())
                        .number(request.getPayerIdentificationNumber())
                        .build());
            }

            // ── Construir el request de pago ───────────────────────
            PaymentCreateRequest paymentCreateRequest = PaymentCreateRequest.builder()
                    .transactionAmount(request.getTransactionAmount())
                    .token(request.getToken())
                    .paymentMethodId(request.getPaymentMethodId())
                    .installments(request.getInstallments())
                    .externalReference(request.getExternalReference())
                    .payer(payerBuilder.build())
                    .build();

            log.info("[PaymentService] Procesando pago para pedido externalRef='{}' | método='{}' | cuotas={}",
                    request.getExternalReference(), request.getPaymentMethodId(), request.getInstallments());

            // ── Llamar a la API de Mercado Pago ────────────────────
            Payment payment = client.create(paymentCreateRequest);

            log.info("[PaymentService] Pago creado — ID={} | Status={} | Detail={}",
                    payment.getId(), payment.getStatus(), payment.getStatusDetail());

            // ── Confirmar pedido directamente si el pago fue aprobado ──
            // Esto evita depender únicamente del webhook para confirmaciones inmediatas.
            if ("approved".equals(payment.getStatus()) && request.getExternalReference() != null) {
                try {
                    Long pedidoId = Long.parseLong(request.getExternalReference());
                    pedidoService.procesarPagoAprobado(pedidoId, String.valueOf(payment.getId()));
                    log.info("[PaymentService] Pedido #{} confirmado directamente tras pago aprobado.", pedidoId);
                } catch (Exception e) {
                    // No interrumpir la respuesta al usuario si la actualización del pedido falla
                    // El webhook de MP servirá como fallback para reintentar la confirmación
                    log.error("[PaymentService] Error al confirmar pedido directamente tras pago aprobado: {}", e.getMessage(), e);
                }
            }

            return ProcessPaymentResponse.builder()
                    .paymentId(payment.getId())
                    .status(payment.getStatus())
                    .statusDetail(payment.getStatusDetail())
                    .build();

        } catch (MPApiException e) {
            String mpErrorBody = e.getApiResponse().getContent();
            log.error("[PaymentService] Error de API al procesar pago: status={}, body={}",
                    e.getApiResponse().getStatusCode(), mpErrorBody);
            throw new RuntimeException("Error MP API: " + mpErrorBody, e);
        } catch (MPException e) {
            log.error("[PaymentService] Error del SDK al procesar pago: {}", e.getMessage());
            throw new RuntimeException("Error al comunicarse con Mercado Pago: " + e.getMessage(), e);
        }
    }
}
