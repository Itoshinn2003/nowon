import { useCallback, useEffect, useState } from "react";

import { getRecruitmentCategories } from "@/src/api/recruitments";
import type { RecruitmentCategory } from "@/src/types/recruitment";
import { errorMessageFromError } from "@/src/utils/profile";

export function useRecruitmentCategories() {
  const [categories, setCategories] = useState<RecruitmentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const loadedCategories = await getRecruitmentCategories();
      setCategories(loadedCategories);
    } catch (error) {
      setErrorMessage(
        errorMessageFromError(error, "カテゴリを取得できませんでした")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoading,
    errorMessage,
    reloadCategories: loadCategories,
  };
}
