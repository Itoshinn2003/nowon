import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getProfile, getUserProfile } from "@/src/api/profile";
import type { UserProfile } from "@/src/types/profile";
import { errorMessageFromError } from "@/src/utils/profile";

type UseProfileOptions = {
  loadOnMount?: boolean;
};

type ProfileState = {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  isLoading: boolean;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
  reloadProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileState | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const profileState = useProvideProfile();

  return (
    <ProfileContext.Provider value={profileState}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(_options: UseProfileOptions = {}) {
  const profileState = useContext(ProfileContext);

  if (!profileState) {
    throw new Error("useProfile must be used within ProfileProvider");
  }

  return profileState;
}

function useProvideProfile() {
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
    loadProfile();
  }, [loadProfile]);

  return useMemo(
    () => ({
      profile,
      setProfile,
      isLoading,
      errorMessage,
      setErrorMessage,
      reloadProfile: loadProfile,
    }),
    [errorMessage, isLoading, loadProfile, profile]
  );
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
