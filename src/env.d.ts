/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PK?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
