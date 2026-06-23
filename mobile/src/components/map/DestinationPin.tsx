import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";

export type DestinationPinCategory = "drink" | "live";

type Props = {
  category: DestinationPinCategory;
  imageSource: ImageSourcePropType;
  remainingRatio: number;
};

const PIN_SIZE = 64;
const FACE_SIZE = 44;
const RING_WIDTH = 6;

const categoryStyles: Record<DestinationPinCategory, { color: string }> = {
  drink: {
    color: "#14B8A6",
  },
  live: {
    color: "#F97316",
  },
};

export function DestinationPin({
  category,
  imageSource,
  remainingRatio,
}: Props) {
  const [hasImageError, setHasImageError] = useState(false);
  const progress = Math.max(0, Math.min(1, remainingRatio));
  const rightRotation = progress <= 0.5 ? -135 + progress * 360 : 45;
  const leftRotation = progress <= 0.5 ? -135 : -135 + (progress - 0.5) * 360;
  const accent = categoryStyles[category];

  return (
    <View style={styles.wrap}>
      <View style={styles.pin}>
        <View style={styles.ringTrack} />
        <View style={styles.rightHalfMask}>
          <View
            style={[
              styles.rightProgressArc,
              {
                borderTopColor: accent.color,
                borderRightColor: accent.color,
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
                borderTopColor: accent.color,
                borderLeftColor: accent.color,
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
    borderColor: "#D7DDE7",
    borderRadius: PIN_SIZE / 2,
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  faceImage: {
    width: "100%",
    height: "100%",
  },
});
