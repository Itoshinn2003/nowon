export type ProfileGender = "male" | "female" | "other" | "no_answer";

export type ProfilePhoto = {
  id: number;
  position: number;
  status: "pending" | "approved" | "rejected";
  url: string | null;
};

export type UserProfile = {
  id: number;
  userId: number;
  nickname: string;
  birthDate: string;
  age: number;
  gender: ProfileGender;
  bio: string | null;
  photos: ProfilePhoto[];
};

export type ProfileFormState = {
  nickname: string;
  birthDate: Date;
  gender: ProfileGender;
  bio: string;
};

export type ProfileResponse = {
  profile: {
    id: number;
    user_id: number;
    nickname: string;
    birth_date: string;
    age: number;
    gender: ProfileGender;
    bio: string | null;
    photos: ProfilePhoto[];
  } | null;
};

export type SaveProfileParams = {
  nickname: string;
  birthDate: string;
  gender: ProfileGender;
  bio: string;
};

export type UploadProfilePhotoParams = {
  uri: string;
  name: string;
  type: string;
};
