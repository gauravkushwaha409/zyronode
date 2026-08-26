/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SERVER_URL: string
    readonly VITE_APP_URL: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  declare const __PROXY_ENABLED__: boolean;
  declare const __SERVER_URL__: string;