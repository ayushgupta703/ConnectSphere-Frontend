export const getFullUrl = (url) => {
  if (!url) return "";

  // Normalize slashes (handle potential Windows-style paths)
  let path = url.replace(/\\/g, '/');

  // If it's a direct microservice link (8087), normalize it to go through the gateway (8088)
  if (path.includes("localhost:8087")) {
    const normalized = path.replace("localhost:8087/uploads", "localhost:8088/api/v1/media/uploads");
    return normalized.startsWith("http") ? normalized : `http://${normalized}`;
  }

  // If it's already a full URL (including gateway), return it
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const baseUrl = "http://localhost:8088/api/v1/media";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};
