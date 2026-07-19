export const useImageResolver = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;

  const resolveImageUrl = (path?: string | null): string => {
    if (!path) return '/images/image.png'; // fallback placeholder
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/uploads/')) {
      return `${apiBase}${path}`; // maps to NestJS server static serving
    }
    return path; // relative to Nuxt public folder (backward compatibility)
  };

  return {
    resolveImageUrl,
  };
};
