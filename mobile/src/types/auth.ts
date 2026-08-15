export type SignUpFormState = {
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type SignInFormState = {
  email: string;
  password: string;
};

export type AppleFullName = {
  familyName?: string | null;
  givenName?: string | null;
  middleName?: string | null;
  namePrefix?: string | null;
  nameSuffix?: string | null;
  nickname?: string | null;
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

export type SignInResponse = {
  data: {
    id: number;
    email: string;
    provider: string;
    uid: string;
  };
};

export type AuthHeaders = {
  accessToken?: string;
  client?: string;
  uid?: string;
  expiry?: string;
  tokenType?: string;
};

export type AuthErrorResponse = {
  errors?: ErrorMessages;
};
