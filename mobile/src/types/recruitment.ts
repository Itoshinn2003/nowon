export type RecruitmentType = "one_to_one" | "group";

export type AllowedGenderPolicy = "male_only" | "female_only" | "anyone";

export type RecruitmentStatus = "active" | "closed" | "expired" | "matched";

export type RecruitmentApplicationStatus = "pending" | "accepted" | "rejected";

export type RecruitmentListTab = "mine" | "applied" | "matched";

export type RecruitmentSummaryStatusTone = "active" | "pending" | "matched";

export type RecruitmentCategory = {
  id: number;
  name: string;
  key: string;
  display_order: number;
  color: string | null;
  icon_name: string | null;
};

export type Recruitment = {
  id: number;
  user_id: number;
  owner_profile: {
    nickname: string;
    initials: string;
    avatar_url: string | null;
  } | null;
  recruitment_type: RecruitmentType;
  recruitment_category_id: number;
  recruitment_category: RecruitmentCategory | null;
  purpose: string;
  vibe: string;
  recruiting_people_min: number;
  recruiting_people_max: number;
  application_limit: number;
  active_application_count: number;
  allowed_gender_policy: AllowedGenderPolicy;
  latitude: string;
  longitude: string;
  description: string | null;
  status: RecruitmentStatus;
  expires_at: string;
  closed_at: string | null;
  safety_confirmed: boolean;
};

export type RecruitmentCategoriesResponse = {
  recruitment_categories: RecruitmentCategory[];
};

export type RecruitmentResponse = {
  recruitment: Recruitment;
};

export type RecruitmentsResponse = {
  recruitments: Recruitment[];
};

export type RecruitmentBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type RecruitmentApplication = {
  id: number;
  recruitment_id: number;
  user_id: number;
  status: RecruitmentApplicationStatus;
  message: string | null;
  recruitment: Recruitment | null;
  applicant_profile: {
    id: number;
    nickname: string;
    age: number;
    gender: string;
    bio: string | null;
  } | null;
  created_at: string;
  updated_at: string;
};

export type RecruitmentApplicationResponse = {
  application: RecruitmentApplication;
};

export type RecruitmentApplicationsResponse = {
  applications: RecruitmentApplication[];
};

export type CreateRecruitmentParams = {
  recruitmentType: RecruitmentType;
  recruitmentCategoryId: number;
  purpose: string;
  vibe: string;
  recruitingPeopleMin: number;
  recruitingPeopleMax: number;
  allowedGenderPolicy: AllowedGenderPolicy;
  latitude: number;
  longitude: number;
  description?: string;
  safetyConfirmed: boolean;
};

export type RecruitmentFormState = {
  recruitmentType: RecruitmentType;
  recruitmentCategoryId: number | null;
  purpose: string;
  vibe: string;
  recruitingPeopleMin: string;
  recruitingPeopleMax: string;
  allowedGenderPolicy: AllowedGenderPolicy;
  description: string;
  safetyConfirmed: boolean;
};

export type RecruitmentCreateFormProps = {
  recruitmentType: RecruitmentType;
  categories: RecruitmentCategory[];
  latitude?: string;
  longitude?: string;
  errorMessage: string;
  isLoadingCategories: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (formData: RecruitmentFormState) => void;
};
