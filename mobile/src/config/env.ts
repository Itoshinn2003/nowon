const defaultGoogleClientId =
  "992345631859-210k21u2mnrde78sgd79mmsaa7hgig6n.apps.googleusercontent.com";

export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
  googleClientId: defaultGoogleClientId,
  googleExpoClientId:
    process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ?? defaultGoogleClientId,
  googleIosClientId:
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? defaultGoogleClientId,
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  googleWebClientId:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? defaultGoogleClientId,
};
