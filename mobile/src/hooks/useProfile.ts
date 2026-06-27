import { useCallback, useEffect, useState } from "react";

import { getProfile } from "@/src/api/profile";
import type { UserProfile } from "@/src/types/profile";
import { errorMessageFromError } from "@/src/utils/profile";

type UseProfileOptions = {
  loadOnMount?: boolean;
};

export function useProfile({ loadOnMount = true }: UseProfileOptions = {}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const loadedProfile = await getProfile();
      setProfile(loadedProfile);
    } catch (error) {
      setErrorMessage(
        errorMessageFromError(error, "プロフィールを取得できませんでした")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loadOnMount) return;

    loadProfile();
  }, [loadOnMount, loadProfile]);

  return {
    profile,
    setProfile,
    isLoading,
    errorMessage,
    setErrorMessage,
    reloadProfile: loadProfile,
  };
}
