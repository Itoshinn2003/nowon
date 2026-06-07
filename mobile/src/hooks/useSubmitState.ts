import { useState } from "react";

export function useSubmitState() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationErrorState] = useState<string[]>([]);

  const startSubmitting = () => {
    setIsSubmitting(true);
    setValidationErrorState([]);
  };

  const finishSubmitting = () => {
    setIsSubmitting(false);
  };

  const setValidationError = (error: string | string[]) => {
    setValidationErrorState(Array.isArray(error) ? error : [error]);
  };

  return {
    isSubmitting,
    validationError,
    startSubmitting,
    finishSubmitting,
    setValidationError,
  };
}
