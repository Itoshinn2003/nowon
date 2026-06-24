import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { Button, SegmentedButtons } from "react-native-paper";

import { FormInput } from "@/src/components/ui/FormInput";
import { colors } from "@/src/constants/colors";
import type {
  ProfileFormState,
  ProfileGender,
  UserProfile,
} from "@/src/types/profile";
import {
  defaultProfileFormState,
  formatDate,
  profileToFormState,
} from "@/src/utils/profile";

type Props = {
  profile: UserProfile | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (formData: ProfileFormState) => void;
};

export function ProfileEditForm({
  profile,
  isSaving,
  onCancel,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState<ProfileFormState>(
    defaultProfileFormState()
  );
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  useEffect(() => {
    setFormData(profileToFormState(profile));
  }, [profile]);

  const canSubmit = useMemo(
    () =>
      formData.nickname.trim().length > 0 &&
      formData.nickname.trim().length <= 12 &&
      formData.birthDate <= new Date() &&
      !isSaving,
    [formData.birthDate, formData.nickname, isSaving]
  );

  function updateForm<K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K]
  ) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [key]: value,
    }));
  }

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === "android") {
      setIsDatePickerVisible(false);
    }

    if (event.type === "dismissed" || !selectedDate) return;

    updateForm("birthDate", selectedDate);
  }

  function handleSubmit() {
    if (!canSubmit) return;

    onSubmit(formData);
  }

  return (
    <View
      className="gap-5 rounded-lg border bg-white p-5"
      style={{ borderColor: colors.border }}
    >
      <FormInput
        label="ニックネーム"
        value={formData.nickname}
        onChangeText={(text) => updateForm("nickname", text)}
        maxLength={12}
        placeholder="12文字以内"
        isValid={formData.nickname.length <= 12}
        errorMessage="12文字以内で入力してください"
      />

      <View className="gap-2">
        <Text className="text-sm font-medium text-gray-700">
          生年月日
        </Text>
        <Pressable
          className="rounded-lg border bg-white px-4 py-3"
          style={{ borderColor: colors.inputBorder }}
          onPress={() =>
            setIsDatePickerVisible((currentValue) => !currentValue)
          }
        >
          <Text className="text-base text-gray-900">
            {formatDate(formData.birthDate)}
          </Text>
        </Pressable>
        {isDatePickerVisible ? (
          <DateTimePicker
            value={formData.birthDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            onChange={handleDateChange}
          />
        ) : null}
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium text-gray-700">
          性別
        </Text>
        <SegmentedButtons
          value={formData.gender}
          onValueChange={(value) => updateForm("gender", value as ProfileGender)}
          theme={{
            colors: {
              primary: colors.state,
              secondaryContainer: colors.stateSoft,
              onSecondaryContainer: "#1F2937",
            },
          }}
          buttons={[
            { value: "male", label: "男性" },
            { value: "female", label: "女性" },
            { value: "other", label: "その他" },
            { value: "no_answer", label: "未回答" },
          ]}
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium text-gray-700">
          一言
        </Text>
        <TextInput
          className="min-h-28 rounded-lg border bg-white px-4 py-3 text-base text-gray-900"
          style={{ borderColor: colors.inputBorder }}
          value={formData.bio}
          onChangeText={(text) => updateForm("bio", text)}
          maxLength={160}
          multiline
          textAlignVertical="top"
          placeholder="よろしくお願いします"
          placeholderTextColor="#9CA3AF"
        />
        <Text className="text-right text-xs text-gray-500">
          {formData.bio.length}/160
        </Text>
      </View>

      <View className="flex-row gap-3">
        <Button
          mode="outlined"
          className="flex-1"
          textColor={colors.textPrimary}
          style={{ borderColor: colors.inputBorder }}
          onPress={onCancel}
        >
          キャンセル
        </Button>
        <Button
          mode="contained"
          className="flex-1"
          buttonColor={colors.textPrimary}
          disabled={!canSubmit}
          loading={isSaving}
          onPress={handleSubmit}
        >
          保存
        </Button>
      </View>
    </View>
  );
}
