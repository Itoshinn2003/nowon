# AGENTS.md

## 基本方針

このプロジェクトは React Native + Expo + Expo Router を使う。

コンポーネント設計では、画面・状態管理・API 通信・UI 表示・入力部品の責務を明確に分ける。
「コンポーネントを細かく分ける」こと自体を目的にしない。目的は、変更理由が異なるコードを同じ場所に置かないこと。

API が変わった時、画面遷移が変わった時、入力 UI が変わった時、バリデーションが変わった時に、触る場所が自然に分かれる設計を優先する。

## ディレクトリ方針

```txt
app/              # Expo Router のページ。画面単位の入口
src/
  components/     # 画面や機能に紐づく複合コンポーネント
  components/ui/  # 汎用 UI 部品
  hooks/          # 再利用可能な状態・処理
  api/            # API 通信
  stores/         # アプリ全体の状態
  types/          # 型定義
  utils/          # 純粋関数
```

## app の責務

app/ 配下のファイルは Expo Router のルートとして扱う。

担当すること:

- 画面の入口になる
- API 呼び出し
- 画面全体の状態管理
- 認証ストアとの接続
- Expo Router による遷移
- 子コンポーネントへの props 渡し
- 子コンポーネントからの submit / press イベントの受け取り

担当しないこと:

- TextInput など細かい UI の大量実装
- フォーム内部の細かい入力状態
- API URL や HTTP クライアントの詳細
- バリデーションロジックの中身
- 汎用 UI の見た目定義

例:

// app/profile/edit.tsx

import { router } from "expo-router";
import { ProfileEditSection } from "@/src/components/profile/ProfileEditSection";
import { updateProfile } from "@/src/api/profile";
import { useSubmitState } from "@/src/hooks/useSubmitState";

export default function ProfileEditPage() {
  const {
    isSubmitting,
    validationError,
    startSubmitting,
    finishSubmitting,
    setValidationError,
  } = useSubmitState();

  async function handleSubmit(formState: ProfileFormState) {
    startSubmitting();

    try {
      await updateProfile(formState);
      router.push("/profile");
    } catch (error) {
      setValidationError(error);
    } finally {
      finishSubmitting();
    }
  }

  return (
    <ProfileEditSection
      isSubmitting={isSubmitting}
      validationError={validationError}
      onSubmit={handleSubmit}
    />
  );
}

## components の責務

src/components には、画面の一部として意味を持つ複合コンポーネントを置く。

例:

src/components/auth/SignInForm.tsx
src/components/auth/SignUpForm.tsx
src/components/profile/ProfileSection.tsx
src/components/profile/ProfileEditSection.tsx
src/components/jobs/JobCard.tsx

担当すること:

- フォーム内部の入力状態
- 入力値の組み立て
- UI 部品の配置
- バリデーション結果に応じたボタン制御
- submit 時に親へ値を渡す

担当しないこと:

- API 通信
- Expo Router による画面遷移
- 認証トークンの保存
- グローバル store の直接更新

悪い例:

export function SignUpForm() {
  async function handleSubmit() {
    await api.post("/signup", formData);
    router.push("/signup/email-sent");
  }
}

良い例:

type Props = {
  isSubmitting: boolean;
  validationError?: string[];
  onSubmit: (formData: SignUpFormState) => void;
};

export function SignUpForm(props: Props) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  return (
    // 入力 UI
  );
}

## components/ui の責務

src/components/ui には、汎用 UI 部品を置く。

例:

src/components/ui/FormInput.tsx
src/components/ui/FormSelect.tsx
src/components/ui/FormTextArea.tsx
src/components/ui/Button.tsx
src/components/ui/ErrorMessage.tsx

担当すること:

- 表示
- 入力値の受け取り
- onChangeText などの通知
- touched 状態など UI 表示に必要な最小限の内部状態

担当しないこと:

- API 通信
- 画面遷移
- ドメイン知識
- store 操作
- 画面固有の条件分岐

汎用 UI は特定の業務名に依存させない。

悪い例:

<JobSeekerEmailInput />

良い例:

<FormInput
  label="メールアドレス"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  isValid={isEmailValid}
  errorMessage="正しいメールアドレス形式で入力してください"
/>

## hooks の責務

src/hooks には、再利用可能な状態や処理を置く。

例:

src/hooks/useSubmitState.ts
src/hooks/useProfileForm.ts
src/hooks/useAuthHeaders.ts

担当すること:

- 送信中状態
- バリデーションエラー状態
- フォーム状態の初期化
- API レスポンスからフォーム状態への変換
- 複数画面で使う処理

export function useSubmitState() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string[]>([]);

  const startSubmitting = () => {
    setIsSubmitting(true);
    setValidationError([]);
  };

  const finishSubmitting = () => {
    setIsSubmitting(false);
  };

  return {
    isSubmitting,
    validationError,
    startSubmitting,
    finishSubmitting,
    setValidationError,
  };
}

## api の責務

src/api は HTTP 通信だけを担当する。

担当すること:

- API エンドポイント呼び出し
- リクエストパラメータの受け取り
- レスポンス型の返却
- 認証ヘッダーの付与

担当しないこと:

- 画面遷移
- UI 表示
- Alert 表示
- フォーム状態管理
- JSX

export async function updateProfile(
  params: ProfileFormState,
): Promise<ProfileResponse> {
  const response = await apiClient.put(`/profiles/${params.id}`, params);
  return response.data;
}

## stores の責務

src/stores には、アプリ全体で共有する状態だけを置く。

例:

- 認証情報
- ログインユーザー
- アプリ設定

一時的なフォーム入力値は store に入れない。
まず app または components の state として持つ。複数画面で本当に共有する必要がある場合だけ store に昇格する。

## utils の責務

src/utils には副作用のない純粋関数を置く。

例:

src/utils/validate.ts
src/utils/date.ts
src/utils/format.ts

例:

- emailValidate
- passwordValidate
- nameValidate
- calculateAge
- getFullName
- 表示用ラベル変換

API 通信、store 更新、画面遷移は utils に入れない。

## フォーム設計

フォームは以下の流れを基本にする。

1. app/ のページが API データを取得する
2. 複合コンポーネントに props として渡す
3. 複合コンポーネントが入力状態を持つ
4. components/ui の汎用 UI が入力表示を担当する
5. submit 時に複合コンポーネントが親へ form state を渡す
6. app/ のページが API 更新と画面遷移を行う

## 禁止する実装

以下は避ける。

- app/ のページに TextInput や細かい UI を大量に直接書く
- components/ui から API を呼ぶ
- form component から router.push を直接呼ぶ
- API 関数の中で Alert や画面遷移を行う
- store に一時的なフォーム入力値を入れる
- 1 つのコンポーネントに API、状態、表示、バリデーション、遷移を全部詰め込む
- props や API レスポンス型を any にする
- 同じ入力 UI を画面ごとに重複実装する

## 判断基準

新しい処理を書く前に、以下で置き場所を判断する。

- 画面の入口か？
    - app/
- 画面の一部として意味のある UI か？
    - src/components
- 汎用的な入力・表示部品か？
    - src/components/ui
- 再利用できる状態や処理か？
    - src/hooks
- API 通信か？
    - src/api
- アプリ全体で共有する状態か？
    - src/stores
- 副作用のない変換・検証か？
    - src/utils

迷った場合は、より責務の狭い場所に置く。
必要になった時に上位へ引き上げる。

## 命名規則

- Expo Router のページは app/ に配置する
- 複合コンポーネントは XxxSection, XxxForm, XxxList, XxxItem
- 汎用 UI は FormInput, FormSelect, PrimaryButton のように用途で命名する
- hooks は useXxx
- API 関数は fetchXxx, createXxx, updateXxx, deleteXxx(サーバーにRailsを使用しているため)
- 型は XxxResponse, XxxParams, XxxFormState

## 最終目標

このプロジェクトでは、次の状態を目指す。

- app/ を読むと、画面の流れが分かる
- components を読むと、その UI の構造が分かる
- components/ui を読むと、再利用可能な表示契約だけが分かる
- hooks を読むと、状態管理の意図が分かる
- api を読むと、通信仕様が分かる
- utils を読むと、純粋な変換・検証ロジックが分かる

責務が混ざりそうな場合は、実装前に分割案を考えてから進める。
