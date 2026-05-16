const GATEWAY_URL = 'http://localhost:8088/api/v1';

// Helper to construct the base URL for a given service
export const getServiceUrl = (serviceName) => {
  return GATEWAY_URL;
};
