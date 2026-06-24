import FontAwesome from "@expo/vector-icons/FontAwesome";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";

export type DestinationPinCategory = "drink" | "live";

type Props = {
  category: DestinationPinCategory;
  categoryColor?: string;
  categoryIcon?: ComponentProps<typeof FontAwesome>["name"];
  imageSource: ImageSourcePropType;
  remainingRatio: number;
};

const PIN_SIZE = 68;
const FACE_SIZE = 48;
const RING_WIDTH = 6;

const categoryStyles: Record<
  DestinationPinCategory,
  { color: string; icon: ComponentProps<typeof FontAwesome>["name"] }
> = {
  drink: {
    color: "#14B8A6",
    icon: "glass",
  },
  live: {
    color: "#F97316",
    icon: "music",
  },
};

export function DestinationPin({
  category,
  categoryColor,
  categoryIcon,
  imageSource,
  remainingRatio,
}: Props) {
  const [hasImageError, setHasImageError] = useState(false);
  const progress = Math.max(0, Math.min(1, remainingRatio));
  const rightRotation = progress <= 0.5 ? -135 + progress * 360 : 45;
  const leftRotation = progress <= 0.5 ? -135 : -135 + (progress - 0.5) * 360;
  const accent = categoryStyles[category];
  const ringColor = categoryColor ?? accent.color;
  const iconName = categoryIcon ?? accent.icon;

  return (
    <View style={styles.wrap}>
      <View style={styles.pin}>
        <View style={styles.ringTrack} />
        <View style={styles.rightHalfMask}>
          <View
            style={[
              styles.rightProgressArc,
              {
                borderTopColor: ringColor,
                borderRightColor: ringColor,
                transform: [{ rotate: `${rightRotation}deg` }],
              },
            ]}
          />
        </View>
        <View style={styles.leftHalfMask}>
          <View
            style={[
              styles.leftProgressArc,
              {
                borderTopColor: ringColor,
                borderLeftColor: ringColor,
                transform: [{ rotate: `${leftRotation}deg` }],
              },
            ]}
          />
        </View>

        <View style={styles.faceFrame}>
          {hasImageError ? (
            <FontAwesome name="user" size={22} color="#667085" />
          ) : (
            <Image
              source={imageSource}
              style={styles.faceImage}
              onError={() => setHasImageError(true)}
            />
          )}
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: ringColor }]}>
          <FontAwesome name={iconName} size={10} color="#FFFFFF" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
  },
  pin: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ringTrack: {
    position: "absolute",
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderWidth: RING_WIDTH,
    borderColor: "#FFFFFF",
    borderRadius: PIN_SIZE / 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 5,
  },
  leftHalfMask: {
    position: "absolute",
    left: 0,
    width: PIN_SIZE / 2,
    height: PIN_SIZE,
    overflow: "hidden",
  },
  rightHalfMask: {
    position: "absolute",
    right: 0,
    width: PIN_SIZE / 2,
    height: PIN_SIZE,
    overflow: "hidden",
  },
  leftProgressArc: {
    position: "absolute",
    left: 0,
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderWidth: RING_WIDTH,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderRadius: PIN_SIZE / 2,
  },
  rightProgressArc: {
    position: "absolute",
    right: 0,
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderWidth: RING_WIDTH,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderRadius: PIN_SIZE / 2,
  },
  faceFrame: {
    width: FACE_SIZE,
    height: FACE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: FACE_SIZE / 2,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#EEF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  faceImage: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
