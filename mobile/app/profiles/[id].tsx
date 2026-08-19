import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  Button,
  Dialog,
  Menu,
  Portal,
  RadioButton,
  TextInput,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { blockUser, reportUser } from "@/src/api/moderation";
import { ProfileView } from "@/src/components/profile/ProfileView";
import { BackIconButton } from "@/src/components/ui/BackIconButton";
import { colors } from "@/src/constants/colors";
import { useProfile, useUserProfile } from "@/src/hooks/useProfile";
import type { ReportReason } from "@/src/types/moderation";

const REPORT_REASONS: { label: string; value: ReportReason }[] = [
  { label: "不適切なプロフィール", value: "inappropriate_profile" },
  { label: "迷惑行為", value: "harassment" },
  { label: "なりすまし", value: "impersonation" },
  { label: "危険・違法な行為", value: "dangerous_illegal" },
  { label: "スパム", value: "spam" },
  { label: "その他", value: "other" },
];

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = numberFromParam(id);
  const { profile: currentProfile } = useProfile();
  const {
    profile,
    isLoading,
    errorMessage,
    reloadProfile,
  } = useUserProfile(userId);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>(
    "inappropriate_profile"
  );
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const canModerate =
    Boolean(profile && currentProfile) && profile?.userId !== currentProfile?.userId;

  function openReportDialog() {
    setMenuVisible(false);
    setReportVisible(true);
  }

  async function submitReport() {
    if (!profile) return;

    setIsSubmittingReport(true);

    try {
      await reportUser({
        reportedUserId: profile.userId,
        reason: reportReason,
        details: reportDetails,
      });
      setReportVisible(false);
      setReportDetails("");
      setReportReason("inappropriate_profile");
      Alert.alert("通報しました", "内容を確認し、必要に応じて対応します。");
    } catch {
      Alert.alert("送信できませんでした", "時間をおいてもう一度お試しください。");
    } finally {
      setIsSubmittingReport(false);
    }
  }

  function confirmBlock() {
    if (!profile) return;

    setMenuVisible(false);
    Alert.alert(
      "このユーザーをブロックしますか？",
      "ブロックすると、このユーザーの募集やプロフィールが表示されなくなり、チャットなどのやり取りもできなくなります。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "ブロックする",
          style: "destructive",
          onPress: handleBlock,
        },
      ]
    );
  }

  async function handleBlock() {
    if (!profile) return;

    setIsBlocking(true);

    try {
      await blockUser(profile.userId);
      Alert.alert("ブロックしました", undefined, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch {
      Alert.alert("ブロックできませんでした", "時間をおいてもう一度お試しください。");
    } finally {
      setIsBlocking(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="mx-4 mt-2 h-12 flex-row items-center justify-between">
        <BackIconButton onPress={() => router.back()} />
        <Text className="text-base font-extrabold text-gray-950">
          プロフィール
        </Text>
        {canModerate ? (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Pressable
                className="h-10 w-10 items-center justify-center"
                disabled={isBlocking}
                onPress={() => setMenuVisible(true)}
              >
                <FontAwesome
                  name="ellipsis-h"
                  size={20}
                  color={colors.textPrimary}
                />
              </Pressable>
            }
          >
            <Menu.Item onPress={openReportDialog} title="通報する" />
            <Menu.Item
              onPress={confirmBlock}
              title="ブロックする"
              titleStyle={{ color: "#DC2626" }}
            />
          </Menu>
        ) : (
          <View className="w-10" />
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <ActivityIndicator color={colors.state} />
          <Text className="text-sm text-gray-500">読み込み中です</Text>
        </View>
      ) : errorMessage ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.stateSoft }}
          >
            <FontAwesome name="exclamation" size={20} color={colors.state} />
          </View>
          <Text className="text-center text-base font-bold text-gray-950">
            プロフィールを表示できません
          </Text>
          <Text className="text-center text-sm leading-6 text-gray-500">
            {errorMessage}
          </Text>
          <Button
            mode="contained"
            buttonColor={colors.textPrimary}
            style={{ borderRadius: 999 }}
            onPress={reloadProfile}
          >
            再読み込み
          </Button>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <ProfileView profile={profile} />
        </ScrollView>
      )}

      <Portal>
        <Dialog visible={reportVisible} onDismiss={() => setReportVisible(false)}>
          <Dialog.Title>通報する</Dialog.Title>
          <Dialog.Content>
            <Text className="mb-3 text-sm leading-6 text-gray-700">
              通報理由を選択してください。
            </Text>
            <RadioButton.Group
              value={reportReason}
              onValueChange={(value) => setReportReason(value as ReportReason)}
            >
              {REPORT_REASONS.map((reason) => (
                <RadioButton.Item
                  key={reason.value}
                  label={reason.label}
                  value={reason.value}
                  color={colors.state}
                  labelStyle={{ fontSize: 14 }}
                />
              ))}
            </RadioButton.Group>
            <TextInput
              mode="outlined"
              label="詳細（任意）"
              multiline
              value={reportDetails}
              onChangeText={setReportDetails}
              style={{ marginTop: 12, backgroundColor: colors.surface }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setReportVisible(false)}>キャンセル</Button>
            <Button loading={isSubmittingReport} onPress={submitReport}>
              送信
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

function numberFromParam(value: string | undefined) {
  if (!value) return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
