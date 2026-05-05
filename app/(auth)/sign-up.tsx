import SafeAreaView from "@/components/SafeAreaView";
import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import useSocialAuth from "@/hooks/useSocialAuth";
import { OAUTH } from "@/constants";


const SignInScreen = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();
  const isLoadingAny = Boolean(loadingStrategy);

  const isGoogleClicked = loadingStrategy === OAUTH.GOOGLE_OAUTH;
  const isGithubClicked = loadingStrategy === OAUTH.OAUTH_GITHUB;
  const isAppleClicked = loadingStrategy === OAUTH.OAUTH_APPLE;

  const signInWith = async (strategy: "oauth_google" | "oauth_github" | "oauth_apple") => {
    const isSuccess = await handleSocialAuth(strategy);
    if (isSuccess) {
      router.replace("/(tabs)/home");
    }
  };



  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-magnolia px-6 dark:bg-cinder">
      <View className="w-full items-center">
        <View
          className={`w-full max-w-[360px] items-center rounded-[32px] px-6 pb-16 pt-10 ${isDarkMode
            ? "border border-[#1f2433] bg-[#0d111c]"
            : "border border-[#ece8fb] bg-[#f7f5ff]"
            }`}
        >
          <Text
            className={`text-4xl font-extrabold uppercase tracking-wide ${isDarkMode ? "text-white" : "text-[#18171f]"
              }`}
          >
            SpendWise
          </Text>
          <Text
            className={`mt-2 text-center text-[14px] ${isDarkMode ? "text-[#cfd5e5]" : "text-[#3d3a45]"
              }`}
          >
            Sign in to access your curated financial dashboard
          </Text>
          <Image
            source={require("@/assets/images/wallet.webp")}
            className="mt-8 h-44 w-44"
            resizeMode="contain"
          />
        </View>

        <View
          className={`mt-[-28px] w-full max-w-[330px] rounded-[24px] px-5 py-4 ${isDarkMode
            ? "border border-[#2b3040] bg-[#1b1f2d]"
            : "border border-[#ece8fb] bg-[#ffffff]"
            }`}
        >
          <View
            className={`self-center rounded-full px-4 py-1 ${isDarkMode ? "bg-[#2d3242]" : "bg-[#efedf8]"
              }`}
          >
            <Text
              className={`text-[10px] font-extrabold tracking-[1.8px] ${isDarkMode ? "text-[#e8ecf7]" : "text-[#585563]"
                }`}
            >
              WELCOME BACK
            </Text>
          </View>
          <Text
            className={`mt-3 text-center text-[12px] leading-5 ${isDarkMode ? "text-[#d5dae6]" : "text-[#7d7988]"
              }`}
          >
            Select a sign-in option below to continue and securely access your
            account.
          </Text>
        </View>
      </View>

      <View className="mt-6">
        <View className="w-full max-w-[360px]">
          <Pressable
            onPress={() => signInWith(OAUTH.GOOGLE_OAUTH)}
            disabled={isLoadingAny}
            className={`h-12 flex-row items-center rounded-[14px] border px-4 ${isDarkMode
              ? "border-[#323a4e] bg-[#121825]"
              : "border-[#dde1ea] bg-[#ffffff]"
              } ${isLoadingAny ? "opacity-70" : "opacity-100"}`}
          >
            <View className="h-7 w-7 items-center justify-center rounded-full bg-white">
              <Image
                source={require("@/assets/images/google.png")}
                className="h-4 w-4"
                resizeMode="contain"
              />
            </View>
            <Text
              className={`ml-3 flex-1 text-[15px] font-semibold ${isDarkMode ? "text-[#f2f5ff]" : "text-[#1c2330]"
                }`}
            >
              {isGoogleClicked ? "Connecting with Google..." : "Continue with Google"}
            </Text>
            {isGoogleClicked ? (
              <ActivityIndicator size="small" color={isDarkMode ? "#e7ecfb" : "#1f2937"} />
            ) : (
              <Ionicons name="chevron-forward" size={16} color={isDarkMode ? "#9ea7bd" : "#64748b"} />
            )}
          </Pressable>

          <Pressable
            onPress={() => signInWith(OAUTH.OAUTH_GITHUB)}
            disabled={isLoadingAny}
            className={`mt-3 h-12 flex-row items-center rounded-[14px] border px-4 ${isDarkMode
              ? "border-[#323a4e] bg-[#121825]"
              : "border-[#dde1ea] bg-[#ffffff]"
              } ${isLoadingAny ? "opacity-70" : "opacity-100"}`}
          >
            <View className="h-7 w-7 items-center justify-center rounded-full bg-white">
              <FontAwesome5 name="github" size={15} color="#0f172a" />
            </View>
            <Text
              className={`ml-3 flex-1 text-[15px] font-semibold ${isDarkMode ? "text-[#f2f5ff]" : "text-[#1c2330]"
                }`}
            >
              {isGithubClicked ? "Connecting with GitHub..." : "Continue with GitHub"}
            </Text>
            {isGithubClicked ? (
              <ActivityIndicator size="small" color={isDarkMode ? "#e7ecfb" : "#1f2937"} />
            ) : (
              <Ionicons name="chevron-forward" size={16} color={isDarkMode ? "#9ea7bd" : "#64748b"} />
            )}
          </Pressable>

          <Pressable
            onPress={() => signInWith(OAUTH.OAUTH_APPLE)}
            disabled={isLoadingAny}
            className="mt-3 h-12 flex-row items-center rounded-[14px] border border-[#d7ddea] bg-[#f7f9fc] px-4"
          >
            <View className="h-7 w-7 items-center justify-center rounded-full bg-[#0f1116]">
              <FontAwesome name="apple" size={16} color="#ffffff" />
            </View>
            <Text className="ml-3 flex-1 text-[15px] font-semibold text-[#161a23]">
              {isAppleClicked ? "Connecting with Apple..." : "Continue with Apple"}
            </Text>
            {isAppleClicked ? (
              <ActivityIndicator size="small" color="#1f2937" />
            ) : (
              <Ionicons name="chevron-forward" size={16} color="#8a93a6" />
            )}
          </Pressable>

          <Text className={`mt-4 text-center text-[11px] ${isDarkMode ? "text-[#8f97ab]" : "text-[#8a93a6]"}`}>
            By continuing, you agree to our Terms and Privacy Policy.
          </Text>
        </View>
      </View>

    </SafeAreaView>
  );
};

export default SignInScreen;
