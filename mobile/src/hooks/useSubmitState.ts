import { useState } from "react";

import type { ErrorMessages } from "@/src/types/auth";

export function useSubmitState() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationErrorState] = useState<ErrorMessages>(
    [],
  );

  const startSubmitting = () => {
    setIsSubmitting(true);
    setValidationErrorState([]);
  };

  const finishSubmitting = () => {
    setIsSubmitting(false);
  };

  const setValidationError = (error: ErrorMessages) => {
    setValidationErrorState(error);
  };

  return {
    isSubmitting,
    validationError,
    startSubmitting,
    finishSubmitting,
    setValidationError,
  };
}
