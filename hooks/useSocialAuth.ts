import { useState } from "react";
import { Alert } from "react-native";
import { useSSO } from "@clerk/expo";
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";

type ClerkErrorShape = {
  errors?: Array<{
    message?: string;
    longMessage?: string;
  }>;
  message?: string;
};

const getErrorMessage = (error: unknown) => {
  const typedError = error as ClerkErrorShape;
  const firstApiMessage = typedError?.errors?.[0]?.longMessage || typedError?.errors?.[0]?.message;

  if (firstApiMessage) return firstApiMessage;
  if (typedError?.message) return typedError.message;
  return "Failed to sign in. Please try again.";
};

const useSocialAuth = () => {
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
  const { startSSOFlow } = useSSO();

  const handleSocialAuth = async (
    strategy: "oauth_google" | "oauth_github" | "oauth_apple",
  ) => {
    if (loadingStrategy) return false; // guard against concurrent flows
    setLoadingStrategy(strategy);

    try {
      const rawScheme = Constants.expoConfig?.scheme;
      const appScheme = Array.isArray(rawScheme) ? rawScheme[0] : rawScheme;
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: appScheme ?? "moneymap",
        path: "sso-callback",
      });

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl,
      });

      if (!createdSessionId || !setActive) {
        Alert.alert(
          "Sign-in incomplete",
          "Sign-in did not complete. Please try again.",
        );
        return false;
      }

      await setActive({ session: createdSessionId });
      return true;
    } catch (error) {
      console.error("Error in social auth", JSON.stringify(error, null, 2));
      Alert.alert("Sign-in failed", getErrorMessage(error));
      return false;
    } finally {
      setLoadingStrategy(null);
    }
  };

  return {
    loadingStrategy,
    handleSocialAuth,
  };
};

export default useSocialAuth;
