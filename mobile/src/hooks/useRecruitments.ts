import { useCallback, useEffect, useRef, useState } from "react";

import {
  getRecruitment,
  getMyRecruitments,
  getRecruitments,
} from "@/src/api/recruitments";
import type { Recruitment, RecruitmentBounds } from "@/src/types/recruitment";
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
  loadRecruitmentsRequest: (
    bounds?: RecruitmentBounds
  ) => Promise<Recruitment[]>,
  { loadOnMount = true }: UseRecruitmentsOptions
) {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const requestIdRef = useRef(0);

  const loadRecruitments = useCallback(async (bounds?: RecruitmentBounds) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const loadedRecruitments = await loadRecruitmentsRequest(bounds);
      if (requestId !== requestIdRef.current) return;

      setRecruitments(loadedRecruitments);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      setErrorMessage(
        errorMessageFromError(error, "募集を取得できませんでした")
      );
    } finally {
      if (requestId !== requestIdRef.current) return;

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
