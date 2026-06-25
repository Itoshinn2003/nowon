import type {
  RecruitmentFormState,
  RecruitmentType,
} from "@/src/types/recruitment";

export const APPLICATION_LIMIT = 10;
export const GROUP_RECRUITING_PEOPLE_MIN = 2;
export const GROUP_RECRUITING_PEOPLE_MAX = 4;

export function defaultRecruitmentFormState(
  recruitmentType: RecruitmentType
): RecruitmentFormState {
  return {
    recruitmentType,
    recruitmentCategoryId: null,
    purpose: "",
    vibe: "",
    recruitingPeopleMin:
      recruitmentType === "group" ? String(GROUP_RECRUITING_PEOPLE_MIN) : "1",
    recruitingPeopleMax:
      recruitmentType === "group" ? String(GROUP_RECRUITING_PEOPLE_MAX) : "1",
    allowedGenderPolicy: "anyone",
    description: "",
    safetyConfirmed: false,
  };
}

export function numberFromInput(value: string) {
  return Number.parseInt(value, 10);
}
