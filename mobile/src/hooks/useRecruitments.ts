import { useCallback, useEffect, useState } from "react";

import { getRecruitments } from "@/src/api/recruitments";
import type { Recruitment } from "@/src/types/recruitment";
import { errorMessageFromError } from "@/src/utils/profile";

export function useRecruitments() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadRecruitments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const loadedRecruitments = await getRecruitments();
      setRecruitments(loadedRecruitments);
    } catch (error) {
      setErrorMessage(
        errorMessageFromError(error, "募集を取得できませんでした")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecruitments();
  }, [loadRecruitments]);

  return {
    recruitments,
    isLoading,
    errorMessage,
    reloadRecruitments: loadRecruitments,
  };
}
