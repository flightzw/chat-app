/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AXIOS_BASE_URL: string;
  readonly VITE_WEB_SOCKET_URL: string;
  readonly VITE_EMOJI_BASE_URL: string;
  readonly VITE_CONN_RETRY_NUM: number;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
