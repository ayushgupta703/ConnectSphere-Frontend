export const getFullUrl = (url) => {
  if (!url) return "";
  
  // Normalize slashes (handle potential Windows-style paths)
  let path = url.replace(/\\/g, '/');
  
  // If it's already a full URL, return it
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  
  // If it contains the port but lacks protocol
  if (path.includes("localhost:8087")) {
    return path.startsWith("//") ? `http:${path}` : `http://${path}`;
  }

  const baseUrl = "http://localhost:8087";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};
