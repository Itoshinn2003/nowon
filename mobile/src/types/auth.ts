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
