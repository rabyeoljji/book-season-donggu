const isProduction = process.env.NODE_ENV === "production";

const baseUrl = isProduction
  ? process.env.NEXT_PUBLIC_BASE_URL_PROD
  : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export const API_BASE_URL = baseUrl ?? "";
