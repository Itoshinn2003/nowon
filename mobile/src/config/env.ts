export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
  confirmSuccessUrl:
    process.env.EXPO_PUBLIC_CONFIRM_SUCCESS_URL ?? "mobile://auth/confirmed",
};
