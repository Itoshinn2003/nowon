import type { ComponentProps, ReactNode } from "react";
import { Button } from "react-native-paper";

type Props = {
  children: ReactNode;
  disabled?: boolean;
  icon: ComponentProps<typeof Button>["icon"];
  loading?: boolean;
  onPress: () => void;
};

export function SocialContinueButton({
  children,
  disabled = false,
  icon,
  loading = false,
  onPress,
}: Props) {
  return (
    <Button
      mode="outlined"
      icon={icon}
      loading={loading}
      disabled={disabled}
      textColor="#1F2937"
      style={{ borderColor: "#D1D5DB" }}
      theme={{ colors: { primary: "#1F2937" } }}
      onPress={onPress}
    >
      {children}
    </Button>
  );
}
