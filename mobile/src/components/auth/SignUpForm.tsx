import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

import { FormInput } from "@/src/components/ui/FormInput";
import { SignUpFormState, VisibleValidationError } from "@/src/types/auth";
import {
  emailValidate,
  passwordConfirmationValidate,
  passwordValidate,
} from "@/src/utils/validate";

// 親コンポーネントから受け取る値。
// API 通信や画面遷移は親が担当し、このフォームは入力値を組み立てて渡すだけにする。
// 今は入力とバリデーションに集中するため、親コンポーネント連携は一旦コメントアウトしている。
// type Props = {
//   isSubmitting?: boolean;
//   validationError?: string[];
//   onSubmit?: (formData: SignUpFormState) => void;
// };

export function SignUpForm() {
  // 親コンポーネント連携を戻す時は、上の Props とこの引数を戻す。
  // {
  //   isSubmitting = false,
  //   validationError = [],
  //   onSubmit,
  // }: Props
  // フォームの入力値。
  // 一時的な入力状態なので store には入れず、このフォームコンポーネント内で持つ。
  const [formData, setFormData] = useState<SignUpFormState>({
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  // 初期表示では false にして、バリデーションエラーを表示しない。
  // 入力が止まって1秒経った後、バリデーションに通っていない項目だけ true にする。
  const [visibleValidationError, setVisibleValidationError] =
    useState<VisibleValidationError>({
      email: false,
      password: false,
      passwordConfirmation: false,
    });

  const isEmailValid = useMemo(
    () => emailValidate(formData.email),
    [formData.email]
  );

  const isPasswordValid = useMemo(
    () => passwordValidate(formData.password),
    [formData.password]
  );

  const isPasswordConfirmationValid = useMemo(
    () =>
      passwordConfirmationValidate(
        formData.password,
        formData.passwordConfirmation
      ),
    [formData.password, formData.passwordConfirmation]
  );

  const canSubmit =
    isEmailValid && isPasswordValid && isPasswordConfirmationValid;
  // 親コンポーネント連携を戻す時は、送信中の二重送信防止もここに戻す。
  // const canSubmit =
  //   isEmailValid &&
  //   isPasswordValid &&
  //   isPasswordConfirmationValid &&
  //   !isSubmitting;

  // 入力が止まってから1秒後に、入力済みでバリデーションNGのフィールドだけエラー表示する。
  // 入力が続いている場合は cleanup で前の timer を消すので、最後の入力から1秒後だけ実行される。
  useEffect(() => {
    const timerId = setTimeout(() => {
      setVisibleValidationError({
        email: formData.email.length > 0 && !isEmailValid,
        password: formData.password.length > 0 && !isPasswordValid,
        passwordConfirmation:
          formData.passwordConfirmation.length > 0 &&
          !isPasswordConfirmationValid,
      });
    }, 800);

    return () => clearTimeout(timerId);
  }, [
    formData.email,
    formData.password,
    formData.passwordConfirmation,
    isEmailValid,
    isPasswordValid,
    isPasswordConfirmationValid,
  ]);

  // フィールド名と値を受け取り、formData の該当箇所だけ更新する。
  // key は SignUpFormState のキーに限定されるので、存在しない項目名は渡せない。
  function updateForm<K extends keyof SignUpFormState>(
    key: K,
    value: SignUpFormState[K]
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

  // submit 時はこのコンポーネント内で API 通信しない。
  // 入力値を親へ渡し、親側で API 通信や画面遷移を行う。
  // 親コンポーネント連携を戻す時に使う。
  // function handleSubmit() {
  //   if (!canSubmit) return;
  //
  //   onSubmit?.(formData);
  // }

  return (
    <View className="gap-8">
      <Text className="text-center text-3xl font-bold text-gray-900">
        新規登録
      </Text>

      {/* 親から渡されるフォーム全体のエラー表示。今は親連携を外しているので一旦コメントアウト。 */}
      {/* {validationError.length > 0 ? (
        <View className="gap-1">
          {validationError.map((error) => (
            // validationError はサーバー側など、親から渡されるフォーム全体のエラー。
            <Text key={error} className="text-sm text-red-500">
              {error}
            </Text>
          ))}
        </View>
      ) : null} */}

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

        <FormInput
          label="パスワード確認"
          value={formData.passwordConfirmation}
          onChangeText={(text) => updateForm("passwordConfirmation", text)}
          secureTextEntry
          autoCapitalize="none"
          placeholder="パスワードをもう一度入力"
          isValid={!visibleValidationError.passwordConfirmation}
          errorMessage="パスワードが一致していません"
        />
      </View>

      <Button mode="contained" disabled={!canSubmit} onPress={() => {}}>
        新規登録する
      </Button>
    </View>
  );
}
