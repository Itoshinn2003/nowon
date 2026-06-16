import axios from "axios";

import { env } from "@/src/config/env";
import type {
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

  const authHeaders: AuthHeaders = {
    accessToken: response.headers["access-token"],
    client: response.headers.client,
    uid: response.headers.uid,
    expiry: response.headers.expiry,
    tokenType: response.headers["token-type"],
  };

  return {
    data: response.data,
    authHeaders,
  };
}
