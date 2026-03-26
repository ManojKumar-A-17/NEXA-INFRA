const requireClientEnv = (name: 'VITE_API_BASE_URL'): string => {
  const value = import.meta.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const API_BASE_URL = requireClientEnv('VITE_API_BASE_URL');
