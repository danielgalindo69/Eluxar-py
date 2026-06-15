package com.eluxar.modules.pagos.service;

import com.eluxar.modules.pagos.dto.PaymentPreferenceRequest;
import com.eluxar.modules.pagos.dto.PaymentPreferenceResponse;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferencePaymentMethodsRequest;
import com.mercadopago.client.preference.PreferencePaymentTypeRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
}
