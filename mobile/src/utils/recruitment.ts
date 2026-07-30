import type {
  Recruitment,
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

export function recruitmentPeopleLabel(
  recruitment: Pick<
    Recruitment,
    "recruitment_type" | "recruiting_people_min" | "recruiting_people_max"
  >
) {
  if (recruitment.recruitment_type === "one_to_one") {
    return "1人募集";
  }

  return `${recruitment.recruiting_people_min}〜${recruitment.recruiting_people_max}人募集`;
}
