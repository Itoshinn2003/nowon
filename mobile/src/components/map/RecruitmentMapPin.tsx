import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/constants/colors";
import type { Recruitment } from "@/src/types/recruitment";

type Props = {
  recruitment: Recruitment;
  currentTime: number;
  onImageLoadEnd?: () => void;
};

const PIN_WIDTH = 82;
const AVATAR_SIZE = 48;
const DEFAULT_CATEGORY_COLOR = colors.state;

export function RecruitmentMapPin({
  recruitment,
  currentTime,
  onImageLoadEnd,
}: Props) {
  const categoryColor =
    recruitment.recruitment_category?.color || DEFAULT_CATEGORY_COLOR;
  const avatarUrl = recruitment.owner_profile?.avatar_url;
  const remainingLabel = remainingTimeLabel(recruitment.expires_at, currentTime);

  return (
    <View style={styles.wrap}>
      <View style={[styles.avatarRing, { borderColor: categoryColor }]}>
        <View style={styles.avatarFrame}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
              onLoadEnd={onImageLoadEnd}
              onError={onImageLoadEnd}
            />
          ) : (
            <FontAwesome name="user" size={22} color="#667085" />
          )}
        </View>
        {remainingLabel ? (
          <View style={[styles.timeBadge, { backgroundColor: categoryColor }]}>
            <FontAwesome name="clock-o" size={8} color="#FFFFFF" />
            <Text style={styles.timeText}>{remainingLabel}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.arrowWrap}>
        <View
          style={[
            styles.arrow,
            {
              borderTopColor: categoryColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: PIN_WIDTH,
    alignItems: "center",
  },
  avatarRing: {
    width: AVATAR_SIZE + 10,
    height: AVATAR_SIZE + 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: (AVATAR_SIZE + 10) / 2,
    borderWidth: 4,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarFrame: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#EEF2F7",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  timeBadge: {
    position: "absolute",
    left: -8,
    top: 36,
    minWidth: 36,
    height: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderRadius: 999,
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  timeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  arrowWrap: {
    marginTop: -2,
    alignItems: "center",
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
});

function remainingTimeLabel(expiresAt: string, currentTime: number) {
  const expiresAtTime = Date.parse(expiresAt);

  if (!Number.isFinite(expiresAtTime)) {
    return "";
  }

  const remainingMinutes = Math.max(
    0,
    Math.ceil((expiresAtTime - currentTime) / 60_000)
  );

  if (remainingMinutes <= 0) {
    return "終了";
  }

  if (remainingMinutes < 60) {
    return `${remainingMinutes}分`;
  }

  const remainingHours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  if (remainingHours < 24) {
    return minutes === 0 ? `${remainingHours}時間` : `${remainingHours}h`;
  }

  return "1日+";
}
