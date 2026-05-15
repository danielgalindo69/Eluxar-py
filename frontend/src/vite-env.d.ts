/// <reference types="vite/client" />

/**
 * Declaración de las variables de entorno de Vite (VITE_*).
 * Extiende ImportMetaEnv para que TypeScript las reconozca con tipo fuerte.
 * Solo se declaran aquí las que empiezan con VITE_ (las que llegan al browser).
 */
interface ImportMetaEnv {
  readonly VITE_MP_PUBLIC_KEY: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
