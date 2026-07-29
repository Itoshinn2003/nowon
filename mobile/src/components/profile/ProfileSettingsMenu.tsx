import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { Modal, Pressable, Text, View } from "react-native";

import { colors } from "@/src/constants/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type SettingsItem = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

export function ProfileSettingsMenu({ visible, onClose }: Props) {
  function navigate(path: Parameters<typeof router.push>[0]) {
    onClose();
    router.push(path);
  }

  const supportItems: SettingsItem[] = [
    {
      icon: "mail",
      label: "お問い合わせ",
      onPress: () => navigate("/profile/settings/contact"),
    },
  ];
  const legalItems: SettingsItem[] = [
    {
      icon: "file-text",
      label: "利用規約",
      onPress: () => navigate("/profile/settings/terms"),
    },
    {
      icon: "shield",
      label: "プライバシーポリシー",
      onPress: () => navigate("/profile/settings/privacy"),
    },
  ];
  const accountItems: SettingsItem[] = [
    {
      icon: "trash-2",
      label: "アカウント削除",
      onPress: () => navigate("/profile/settings/delete-account"),
      destructive: true,
    },
  ];

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/30 px-4 pt-16" onPress={onClose}>
        <Pressable
          className="ml-auto w-72 rounded-lg border bg-white py-2"
          style={{ borderColor: colors.border }}
          onPress={(event) => event.stopPropagation()}
        >
          <SettingsSection title="サポート" items={supportItems} />
          <SettingsSection title="法務" items={legalItems} />
          <SettingsSection title="アカウント" items={accountItems} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SettingsSection({
  title,
  items,
}: {
  title: string;
  items: SettingsItem[];
}) {
  return (
    <View className="py-2">
      <Text className="px-4 pb-1 text-xs font-bold text-gray-500">
        {title}
      </Text>
      {items.map((item) => (
        <Pressable
          key={item.label}
          className="flex-row items-center gap-3 px-4 py-3"
          onPress={item.onPress}
        >
          <Feather
            name={item.icon}
            size={18}
            color={item.destructive ? "#DC2626" : "#111827"}
          />
          <Text
            className="text-base"
            style={{ color: item.destructive ? "#DC2626" : "#111827" }}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
