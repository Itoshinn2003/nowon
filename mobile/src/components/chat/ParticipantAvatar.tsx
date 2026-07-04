import { Image, Text, View } from "react-native";

import { colors } from "@/src/constants/colors";

type Props = {
  initials: string;
  avatarUrl?: string | null;
  size?: number;
};

export function ParticipantAvatar({ initials, avatarUrl, size = 36 }: Props) {
  const dimension = { height: size, width: size, borderRadius: size / 2 };

  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={dimension} />;
  }

  return (
    <View
      className="items-center justify-center"
      style={{ ...dimension, backgroundColor: colors.stateSoft }}
    >
      <Text
        className="font-bold"
        style={{ color: colors.state, fontSize: Math.max(11, size * 0.36) }}
      >
        {initials || "?"}
      </Text>
    </View>
  );
}
