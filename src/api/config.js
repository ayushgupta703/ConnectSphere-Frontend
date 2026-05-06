// Map of service base URLs
// If there is an API gateway in the future, these can all point to the gateway's URL (e.g., localhost:8080)
const API_PORTS = {
  auth: 8080,
  post: 8081,
  like: 8082,
  comment: 8083,
  follow: 8084,
  notification: 8085,
  search: 8086,
  media: 8087,
};

const BASE_DOMAIN = 'http://localhost';

// Helper to construct the base URL for a given service
export const getServiceUrl = (serviceName) => {
  const port = API_PORTS[serviceName] || 8080;
  return `${BASE_DOMAIN}:${port}/api/v1`;
};
