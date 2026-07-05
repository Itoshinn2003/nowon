import { useCallback, useEffect, useState } from "react";

import { getProfile, getUserProfile } from "@/src/api/profile";
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

export function useUserProfile(userId: number | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [errorMessage, setErrorMessage] = useState("");

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      setErrorMessage("プロフィールが見つかりませんでした");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const loadedProfile = await getUserProfile(userId);
      setProfile(loadedProfile);
    } catch (error) {
      setProfile(null);
      setErrorMessage(
        errorMessageFromError(error, "プロフィールを取得できませんでした")
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    isLoading,
    errorMessage,
    reloadProfile: loadProfile,
  };
}
