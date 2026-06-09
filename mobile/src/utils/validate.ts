export function emailValidate(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function passwordValidate(password: string) {
  return password.length >= 8 && password.length <= 20;
}

export function passwordConfirmationValidate(
  password: string,
  passwordConfirmation: string,
) {
  return password === passwordConfirmation;
}
