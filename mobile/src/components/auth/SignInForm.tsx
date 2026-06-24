import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Button } from "react-native-paper";

import { FormInput } from "@/src/components/ui/FormInput";
import type { ErrorMessages, SignInFormState } from "@/src/types/auth";
import { toDisplayErrors } from "@/src/utils/error";
import { emailValidate, passwordValidate } from "@/src/utils/validate";

type VisibleValidationError = {
  email: boolean;
  password: boolean;
};

type Props = {
  isSubmitting?: boolean;
  validationError?: ErrorMessages;
  onSubmit?: (formData: SignInFormState) => void;
};

export function SignInForm({
  isSubmitting = false,
  validationError = [],
  onSubmit,
}: Props) {
  const validationErrors = toDisplayErrors(validationError);

  const [formData, setFormData] = useState<SignInFormState>({
    email: "",
    password: "",
  });

  const [visibleValidationError, setVisibleValidationError] =
    useState<VisibleValidationError>({
      email: false,
      password: false,
    });

  const isEmailValid = useMemo(
    () => emailValidate(formData.email),
    [formData.email]
  );

  const isPasswordValid = useMemo(
    () => passwordValidate(formData.password),
    [formData.password]
  );

  const canSubmit = isEmailValid && isPasswordValid && !isSubmitting;

  useEffect(() => {
    const timerId = setTimeout(() => {
      setVisibleValidationError({
        email: formData.email.length > 0 && !isEmailValid,
        password: formData.password.length > 0 && !isPasswordValid,
      });
    }, 800);

    return () => clearTimeout(timerId);
  }, [formData.email, formData.password, isEmailValid, isPasswordValid]);

  function updateForm<K extends keyof SignInFormState>(
    key: K,
    value: SignInFormState[K]
  ) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [key]: value,
    }));

    setVisibleValidationError((currentVisibleValidationError) => ({
      ...currentVisibleValidationError,
      [key]: false,
    }));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit?.(formData);
  }

  return (
    <View className="gap-8">
      <Text className="text-center text-3xl font-bold text-gray-900">
        ログイン
      </Text>

      {validationErrors.length > 0 ? (
        <View className="gap-1">
          {validationErrors.map((error) => (
            <Text key={error} className="text-sm text-red-500">
              {error}
            </Text>
          ))}
        </View>
      ) : null}

      <View className="gap-4">
        <FormInput
          label="メールアドレス"
          value={formData.email}
          onChangeText={(text) => updateForm("email", text)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          placeholder="example@mail.com"
          isValid={!visibleValidationError.email}
          errorMessage="正しいメールアドレス形式で入力してください"
        />

        <FormInput
          label="パスワード"
          value={formData.password}
          onChangeText={(text) => updateForm("password", text)}
          secureTextEntry
          autoCapitalize="none"
          placeholder="パスワード"
          isValid={!visibleValidationError.password}
          errorMessage="8文字以上20文字以下で入力してください"
        />

        <Pressable onPress={() => {}}>
          <Text className="text-right text-sm font-bold text-blue-600">
            パスワードをお忘れですか？
          </Text>
        </Pressable>
      </View>

      <Button mode="contained" disabled={!canSubmit} onPress={handleSubmit}>
        ログインする
      </Button>
    </View>
  );
}
