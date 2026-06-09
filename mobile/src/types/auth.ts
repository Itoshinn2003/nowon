export type SignUpFormState = {
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type VisibleValidationError = {
  email: boolean;
  password: boolean;
  passwordConfirmation: boolean;
};

export type ErrorMessages =
  | string
  | string[]
  | {
      full_messages?: string[];
      [key: string]: string[] | undefined;
    };

export type SignUpResponse = {
  status: string;
  data?: {
    id: number;
    email: string;
    provider: string;
    uid: string;
  };
};

export type AuthErrorResponse = {
  errors?: ErrorMessages;
};
