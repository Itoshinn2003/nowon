import { useState } from "react";

import type { ErrorMessages } from "@/src/types/auth";

type FinishSubmittingOptions = {
  succeeded?: boolean;
};

export function useSubmitState() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [validationError, setValidationErrorState] = useState<ErrorMessages>(
    [],
  );

  const startSubmitting = () => {
    setIsSubmitting(true);
    setValidationErrorState([]);
  };

  const finishSubmitting = (options: FinishSubmittingOptions = {}) => {
    setIsSubmitting(false);

    if (options.succeeded) {
      setSuccessCount((currentSuccessCount) => currentSuccessCount + 1);
    }
  };

  const setValidationError = (error: ErrorMessages) => {
    setValidationErrorState(error);
  };

  return {
    isSubmitting,
    successCount,
    validationError,
    startSubmitting,
    finishSubmitting,
    setValidationError,
  };
}
