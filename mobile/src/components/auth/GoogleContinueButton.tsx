import { Button } from "react-native-paper";

export function GoogleContinueButton() {
  function handlePress() {
    // Google認証処理はここに接続する。
  }

  return (
    <Button mode="outlined" onPress={handlePress}>
      Googleで続ける
    </Button>
  );
}
