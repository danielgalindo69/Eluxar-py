import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  /** Título de la página. Se concatena con "| Eluxar" automáticamente si no se usa exactTitle. */
  title: string;
  /** Usa exactamente el título provisto sin concatenar el SITE_NAME */
  exactTitle?: boolean;
  /** Meta description. Máximo recomendado: 160 caracteres. */
  description?: string;
  /** URL canónica absoluta de la página. */
  canonical?: string;
  /** URL de imagen para Open Graph / Twitter Cards. */
  image?: string;
  /** Tipo de contenido Open Graph. Por defecto "website". */
  ogType?: "website" | "product" | "article";
  /** Si true, indica a los bots que no indexen ni sigan links. */
  noIndex?: boolean;
  /** JSON-LD structured data (Schema.org). Se serializa y se inyecta como script. */
  structuredData?: Record<string, unknown>;
  /** Keywords opcionales (bajo impacto en Google, útil para otros motores). */
  keywords?: string;
}

const SITE_NAME = "Eluxar";
const BASE_URL = "https://eluxar-py-7jov.vercel.app"; // Dominio de producción (Vercel)
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

export const SEOHead = ({
  title,
  exactTitle = false,
  description = "Descubre Eluxar: fragancias de lujo con alta concentración.",
  canonical,
  image = DEFAULT_IMAGE,
  ogType = "website",
  noIndex = false,
  structuredData,
  keywords,
}: SEOHeadProps) => {
  const fullTitle = exactTitle ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical ?? (typeof window !== "undefined" ? window.location.href : BASE_URL);

  return (
    <Helmet>
      {/* ── Básicos ───────────────────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />

      {/* ── Open Graph ────────────────────────────────────────── */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="es_CO" />

      {/* ── Twitter Cards ─────────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* ── JSON-LD Structured Data ───────────────────────────── */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
