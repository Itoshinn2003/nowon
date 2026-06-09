import type { ErrorMessages } from "@/src/types/auth";

export function toDisplayErrors(errorMessages: ErrorMessages) {
  if (typeof errorMessages === "string") {
    return errorMessages ? [errorMessages] : [];
  }

  if (Array.isArray(errorMessages)) {
    return errorMessages;
  }

  return errorMessages.full_messages ?? [];
}
