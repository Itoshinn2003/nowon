import { useCallback, useEffect, useState } from "react";

import { getMyRecruitmentApplications } from "@/src/api/recruitmentApplications";
import type { RecruitmentApplication } from "@/src/types/recruitment";
import { errorMessageFromError } from "@/src/utils/profile";

type UseRecruitmentApplicationsOptions = {
  loadOnMount?: boolean;
};

export function useRecruitmentApplications({
  loadOnMount = true,
}: UseRecruitmentApplicationsOptions = {}) {
  const [applications, setApplications] = useState<RecruitmentApplication[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const loadedApplications = await getMyRecruitmentApplications();
      setApplications(loadedApplications);
    } catch (error) {
      setErrorMessage(
        errorMessageFromError(error, "応募を取得できませんでした")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loadOnMount) return;

    loadApplications();
  }, [loadApplications, loadOnMount]);

  return {
    applications,
    isLoading,
    errorMessage,
    reloadApplications: loadApplications,
  };
}
