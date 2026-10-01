interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_BUCKET_STORAGE_URL: string;
  readonly VITE_BUCKET_STORAGE_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}