import axios from "axios";

import { env } from "@/src/config/env";
import type { SignUpFormState, SignUpResponse } from "@/src/types/auth";

export async function signUp(formData: SignUpFormState) {
  const response = await axios.post<SignUpResponse>(`${env.apiBaseUrl}/auth`, {
    email: formData.email,
    password: formData.password,
    password_confirmation: formData.passwordConfirmation,
    confirm_success_url: env.confirmSuccessUrl,
  });

  return response.data;
}
