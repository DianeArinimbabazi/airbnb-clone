export const config = {
  apiUrl: (import.meta.env.VITE_API_URL as string) ?? "http://localhost:3000/api/v1",
  isDev: import.meta.env.DEV as boolean,
  isProd: import.meta.env.PROD as boolean,
} as const;
