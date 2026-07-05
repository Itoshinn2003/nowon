import { useCallback, useEffect, useState } from "react";

import {
  getRecruitment,
  getMyRecruitments,
  getRecruitments,
} from "@/src/api/recruitments";
import type { Recruitment } from "@/src/types/recruitment";
import { errorMessageFromError } from "@/src/utils/profile";

type UseRecruitmentsOptions = {
  loadOnMount?: boolean;
};

export function useRecruitments(options: UseRecruitmentsOptions = {}) {
  return useRecruitmentLoader(getRecruitments, options);
}

export function useMyRecruitments(options: UseRecruitmentsOptions = {}) {
  return useRecruitmentLoader(getMyRecruitments, options);
}

export function useRecruitment(recruitmentId: number | null) {
  const [recruitment, setRecruitment] = useState<Recruitment | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(recruitmentId));
  const [errorMessage, setErrorMessage] = useState("");

  const loadRecruitment = useCallback(async () => {
    if (!recruitmentId) {
      setRecruitment(null);
      setIsLoading(false);
      setErrorMessage("募集が見つかりませんでした");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const loadedRecruitment = await getRecruitment(recruitmentId);
      setRecruitment(loadedRecruitment);
    } catch (error) {
      setRecruitment(null);
      setErrorMessage(
        errorMessageFromError(error, "募集を取得できませんでした")
      );
    } finally {
      setIsLoading(false);
    }
  }, [recruitmentId]);

  useEffect(() => {
    loadRecruitment();
  }, [loadRecruitment]);

  return {
    recruitment,
    isLoading,
    errorMessage,
    reloadRecruitment: loadRecruitment,
  };
}

function useRecruitmentLoader(
  loadRecruitmentsRequest: () => Promise<Recruitment[]>,
  { loadOnMount = true }: UseRecruitmentsOptions
) {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadRecruitments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const loadedRecruitments = await loadRecruitmentsRequest();
      setRecruitments(loadedRecruitments);
    } catch (error) {
      setErrorMessage(
        errorMessageFromError(error, "募集を取得できませんでした")
      );
    } finally {
      setIsLoading(false);
    }
  }, [loadRecruitmentsRequest]);

  useEffect(() => {
    if (!loadOnMount) return;

    loadRecruitments();
  }, [loadOnMount, loadRecruitments]);

  return {
    recruitments,
    isLoading,
    errorMessage,
    reloadRecruitments: loadRecruitments,
  };
}
