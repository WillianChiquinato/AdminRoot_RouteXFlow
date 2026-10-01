const bucketBaseUrl = `${import.meta.env.VITE_BUCKET_STORAGE_URL}${import.meta.env.VITE_BUCKET_STORAGE_NAME}`;

export const bucketStorageFetch = (file: string | null | undefined): string => {
  if (!file) return "";
  if (/^https?:\/\//i.test(file)) return file;
  return `${bucketBaseUrl}/${file.replace(/^\/+/, "")}`;
};
