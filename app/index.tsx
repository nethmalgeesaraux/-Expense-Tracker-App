import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";

export default function HomeScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-up" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
