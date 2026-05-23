# ELUXAR — Implementación Mercado Pago Checkout Bricks

# CONTEXTO GENERAL DEL PROYECTO

Estás trabajando en Eluxar, una plataforma e-commerce premium de perfumes con recomendaciones impulsadas por IA.

El sistema tiene arquitectura desacoplada frontend/backend.

---

# STACK TECNOLÓGICO OFICIAL

## FRONTEND

* React
* TailwindCSS
* Vite
* TypeScript

---

## BACKEND

* Java
* Spring Boot
* Spring Security
* Maven
* Arquitectura REST API

---

## BASE DE DATOS

* PostgreSQL

---

# OBJETIVO ACTUAL

Implementar Mercado Pago Checkout Bricks en entorno LOCAL utilizando credenciales TEST.

NO deben realizarse pagos reales.

La implementación debe quedar preparada para escalar posteriormente a producción sin rehacer arquitectura.

---

# TU ROL

Debes actuar simultáneamente como:

* Arquitecto de software senior
* Ingeniero backend senior Java/Spring
* Ingeniero frontend React senior
* Especialista en integración de pagos
* Especialista en seguridad backend
* Diseñador UI premium
* Diseñador UX e-commerce
* Especialista en clean architecture

Debes priorizar:

* código empresarial
* arquitectura limpia
* separación de responsabilidades
* escalabilidad
* seguridad
* mantenibilidad
* UX premium
* responsive design
* reutilización
* tipado fuerte

NO generar implementaciones rápidas o desordenadas.

---

# OBJETIVO FUNCIONAL

Implementar:

* Checkout Bricks
* Preferencias de pago
* Flujo sandbox
* Estados de pago
* Webhooks
* Arquitectura preparada para producción

---

# RESTRICCIONES IMPORTANTES

NO implementar:

* pagos reales
* marketplace
* QR
* pagos presenciales
* efectivo
* suscripciones
* wallets
* analytics avanzados
* antifraude avanzado

---

# MÉTODOS DE PAGO NECESARIOS

Implementar soporte únicamente para:

* tarjetas crédito
* tarjetas débito
* PSE
* cuotas

---

# CREDENCIALES

## PUBLIC KEY TEST

```env id="e3y5nr"
PEGAR_AQUI_PUBLIC_KEY
```

---

## ACCESS TOKEN TEST

```env id="skmkx9"
PEGAR_AQUI_ACCESS_TOKEN
```

---

# FRONTEND — IMPLEMENTACIÓN

# DEPENDENCIAS NECESARIAS

Instalar:

```bash id="k5v8n4"
npm install @mercadopago/sdk-react
```

---

# ESTRUCTURA FRONTEND ESPERADA

Crear:

```txt id="r1yl9m"
src/
 ├── components/
 │    └── payments/
 │         ├── MercadoPagoBrick.tsx
 │         ├── CheckoutSummary.tsx
 │         └── PaymentStatus.tsx
 │
 ├── services/
 │    └── paymentService.ts
 │
 ├── pages/
 │    └── checkout/
 │         ├── Success.tsx
 │         ├── Pending.tsx
 │         └── Failure.tsx
```

---

# RESPONSABILIDADES FRONTEND

## MercadoPagoBrick.tsx

Responsabilidad:

* inicializar Mercado Pago
* renderizar Payment Brick
* manejar callbacks frontend
* consumir preference_id desde backend

NO incluir lógica de negocio compleja.

---

## paymentService.ts

Responsabilidad:

* consumir backend REST API
* solicitar preference_id
* manejar respuestas HTTP
* centralizar requests de pagos

---

# UX/UI REQUERIDA

La interfaz debe sentirse:

* premium
* moderna
* elegante
* minimalista
* rápida
* luxury ecommerce

NO usar interfaces genéricas.

Debe incluir:

* loading states elegantes
* manejo visual de errores
* responsive design
* buena jerarquía visual
* espaciado profesional
* componentes desacoplados

---

# BACKEND — IMPLEMENTACIÓN

# DEPENDENCIA MAVEN

Agregar SDK oficial Mercado Pago:

```xml id="a4fk5s"
<dependency>
    <groupId>com.mercadopago</groupId>
    <artifactId>sdk-java</artifactId>
    <version>2.1.7</version>
</dependency>
```

Validar versión estable más reciente antes de implementar.

---

# VARIABLES DE ENTORNO BACKEND

Agregar:

```env id="i2fxqk"
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=
```

IMPORTANTE:

* nunca exponer access token al frontend
* usar variables de entorno seguras

---

# ESTRUCTURA BACKEND ESPERADA

```txt id="zx94pz"
src/main/java/com/eluxar/

 ├── config/
 │    └── MercadoPagoConfig.java
 │
 ├── controller/
 │    └── PaymentController.java
 │
 ├── service/
 │    └── PaymentService.java
 │
 ├── dto/
 │    ├── PaymentPreferenceRequest.java
 │    └── PaymentPreferenceResponse.java
 │
 ├── webhook/
 │    └── MercadoPagoWebhookController.java
```

---

# CONFIGURACIÓN SDK

## MercadoPagoConfig.java

Responsabilidad:

* inicializar SDK Mercado Pago
* cargar access token
* centralizar configuración

Debe usar:

```java id="9v7m4h"
MercadoPagoConfig.setAccessToken(...)
```

NO hardcodear tokens.

---

# PAYMENT SERVICE

## PaymentService.java

Responsabilidad:

* crear preferencias de pago
* manejar integración SDK
* validar payloads
* construir items
* manejar excepciones
* centralizar lógica de pagos

---

# PAYMENT CONTROLLER

## PaymentController.java

Crear endpoint:

```http id="clh9jx"
POST /api/payments/create-preference
```

Responsabilidad:

* recibir request frontend
* validar datos
* llamar service
* retornar preference_id

---

# RESPUESTA ESPERADA

```json id="5nsqik"
{
  "preferenceId": "xxxxxxxx"
}
```

---

# WEBHOOKS

## MercadoPagoWebhookController.java

Crear endpoint:

```http id="s4e9d1"
POST /api/payments/webhook
```

Responsabilidad:

* recibir eventos Mercado Pago
* validar payload
* registrar estados
* preparar futura actualización de órdenes

Por ahora:

* solo loggear eventos
* validar integración

NO implementar lógica compleja todavía.

---

# CONFIGURACIÓN SPRING SECURITY

IMPORTANTE:

Permitir acceso público únicamente a:

```txt id="t9af5u"
/api/payments/**
```

Mantener protegidas las demás rutas.

NO desactivar seguridad global.

---

# FLUJO FUNCIONAL ESPERADO

## PASO 1

Usuario entra al checkout.

---

## PASO 2

Frontend llama:

```http id="x6r8lu"
POST /api/payments/create-preference
```

---

## PASO 3

Backend crea preferencia Mercado Pago.

---

## PASO 4

Backend retorna:

```json id="shd7to"
{
  "preferenceId": "..."
}
```

---

## PASO 5

Frontend renderiza Checkout Brick.

---

## PASO 6

Usuario realiza pago sandbox.

---

## PASO 7

Mercado Pago redirige a:

* success
* pending
* failure

---

## PASO 8

Webhook recibe evento.

---

# PÁGINAS NECESARIAS

Crear:

```txt id="k0r7ci"
/checkout/success
/checkout/pending
/checkout/failure
```

Cada página debe incluir:

* diseño premium
* iconografía elegante
* feedback visual claro
* responsive
* UX moderna

---

# TARJETAS SANDBOX

La implementación debe quedar preparada para usar tarjetas TEST oficiales Mercado Pago.

NO usar tarjetas reales.

---

# REQUISITOS DE CÓDIGO

TODO el código debe:

* usar TypeScript estricto
* usar DTOs Java correctamente
* evitar lógica duplicada
* evitar any
* tener manejo robusto de errores
* usar clean code
* ser modular
* seguir buenas prácticas empresariales

---

# MANEJO DE ERRORES

Implementar:

* try/catch adecuados
* respuestas HTTP claras
* logs backend útiles
* validaciones defensivas

NO ocultar errores críticos silenciosamente.

---

# IMPORTANTE

ANTES de escribir código:

1. Analiza estructura actual del proyecto
2. Identifica convenciones existentes
3. Respeta arquitectura actual
4. Mantén consistencia visual
5. Reutiliza patrones existentes

Luego:

* implementa paso a paso
* explica decisiones importantes
* documenta archivos creados
* justifica arquitectura elegida
* evita sobreingeniería innecesaria

---

# PRIORIDAD ACTUAL

FASE 1:

* integración sandbox funcional
* checkout brick funcionando
* backend limpio
* frontend premium
* webhooks básicos
* arquitectura escalable

NO implementar todavía:

* órdenes reales DB
* facturación
* emails automáticos
* antifraude
* analytics
* dashboards administrativos
