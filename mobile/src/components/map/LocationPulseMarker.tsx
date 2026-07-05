import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { Marker } from "react-native-maps";

type Props = {
  latitude: number;
  longitude: number;
  visible: boolean;
  size?: number;
};

const MAIN_COLOR = "#00C2A8";
const OUTER_RING_COLOR = "rgba(0, 194, 168, 0.22)";
const ANIMATION_DURATION = 1800;

export function LocationPulseMarker({
  latitude,
  longitude,
  visible,
  size = 58,
}: Props) {
  const firstPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      firstPulse.stopAnimation();
      firstPulse.setValue(0);
      return;
    }

    const createPulse = (value: Animated.Value) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    const firstAnimation = createPulse(firstPulse);

    firstAnimation.start();

    return () => {
      firstAnimation.stop();
    };
  }, [firstPulse, visible]);

  const styles = useMemo(() => {
    const dotSize = Math.max(7, size * 0.11);
    const innerRingSize = size * 0.44;

    return {
      container: {
        height: size,
        width: size,
      },
      pulseRing: {
        backgroundColor: OUTER_RING_COLOR,
        borderRadius: size / 2,
        height: size,
        width: size,
      },
      innerRing: {
        backgroundColor: OUTER_RING_COLOR,
        borderRadius: innerRingSize / 2,
        height: innerRingSize,
        width: innerRingSize,
      },
      dot: {
        backgroundColor: MAIN_COLOR,
        borderRadius: dotSize / 2,
        height: dotSize,
        width: dotSize,
      },
    };
  }, [size]);

  if (!visible) return null;

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges
    >
      <View
        pointerEvents="none"
        className="items-center justify-center"
        style={styles.container}
      >
        <PulseCircle progress={firstPulse} style={styles.pulseRing} />
        <View className="absolute items-center justify-center" style={styles.innerRing}>
          <View style={styles.dot} />
        </View>
      </View>
    </Marker>
  );
}

function PulseCircle({
  progress,
  style,
}: {
  progress: Animated.Value;
  style: object;
}) {
  const animatedStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.45, 1],
      outputRange: [0.62, 0.34, 0],
    }),
    transform: [
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.22, 1],
        }),
      },
    ],
  };

  return <Animated.View className="absolute" style={[style, animatedStyle]} />;
}
