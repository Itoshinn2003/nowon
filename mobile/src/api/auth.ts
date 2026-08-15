import axios, { AxiosResponse } from "axios";

import { env } from "@/src/config/env";
import type {
  AppleFullName,
  AuthHeaders,
  SignInFormState,
  SignInResponse,
  SignUpFormState,
  SignUpResponse,
} from "@/src/types/auth";

export async function signUp(formData: SignUpFormState) {
  const response = await axios.post<SignUpResponse>(`${env.apiBaseUrl}/auth`, {
    email: formData.email,
    password: formData.password,
    password_confirmation: formData.passwordConfirmation,
  });

  return response.data;
}

export async function signIn(formData: SignInFormState) {
  const response = await axios.post<SignInResponse>(
    `${env.apiBaseUrl}/auth/sign_in`,
    {
      email: formData.email,
      password: formData.password,
    }
  );

  return {
    data: response.data,
    authHeaders: responseAuthHeaders(response),
  };
}

export async function signInWithGoogle(idToken: string) {
  const response = await axios.post<SignInResponse>(
    `${env.apiBaseUrl}/auth/google`,
    {
      id_token: idToken,
    }
  );

  return {
    data: response.data,
    authHeaders: responseAuthHeaders(response),
  };
}

export async function signInWithApple(params: {
  identityToken: string;
  fullName?: AppleFullName | null;
}) {
  const response = await axios.post<SignInResponse>(
    `${env.apiBaseUrl}/auth/apple`,
    {
      identity_token: params.identityToken,
      full_name: params.fullName,
    }
  );

  return {
    data: response.data,
    authHeaders: responseAuthHeaders(response),
  };
}

function responseAuthHeaders(response: AxiosResponse): AuthHeaders {
  return {
    accessToken: response.headers["access-token"],
    client: response.headers.client,
    uid: response.headers.uid,
    expiry: response.headers.expiry,
    tokenType: response.headers["token-type"],
  };
}
