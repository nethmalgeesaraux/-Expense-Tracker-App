import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { Text, View } from "react-native";

export default function HomeScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-up" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-lg font-semibold text-black dark:text-white">
        You are signed in.
      </Text>
    </View>
  );
}
