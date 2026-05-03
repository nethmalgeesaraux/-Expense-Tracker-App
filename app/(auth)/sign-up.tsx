import SafeAreaView from "@/components/SafeAreaView";
import { useColorScheme } from "nativewind";
import { Image, Text, View } from "react-native";

const SignInScreen = () => {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-magnolia px-6 dark:bg-cinder">
      <View className="w-full items-center">
        <View
          className={`w-full max-w-[360px] items-center rounded-[32px] px-6 pb-16 pt-10 ${
            isDarkMode
              ? "border border-[#1f2433] bg-[#0d111c]"
              : "border border-[#ece8fb] bg-[#f7f5ff]"
          }`}
        >
          <Text
            className={`text-4xl font-extrabold uppercase tracking-wide ${
              isDarkMode ? "text-white" : "text-[#18171f]"
            }`}
          >
            SpendWise
          </Text>
          <Text
            className={`mt-2 text-center text-[14px] ${
              isDarkMode ? "text-[#cfd5e5]" : "text-[#3d3a45]"
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
          className={`mt-[-28px] w-full max-w-[330px] rounded-[24px] px-5 py-4 ${
            isDarkMode
              ? "border border-[#2b3040] bg-[#1b1f2d]"
              : "border border-[#ece8fb] bg-[#ffffff]"
          }`}
        >
          <View
            className={`self-center rounded-full px-4 py-1 ${
              isDarkMode ? "bg-[#2d3242]" : "bg-[#efedf8]"
            }`}
          >
            <Text
              className={`text-[10px] font-extrabold tracking-[1.8px] ${
                isDarkMode ? "text-[#e8ecf7]" : "text-[#585563]"
              }`}
            >
              WELCOME BACK
            </Text>
          </View>
          <Text
            className={`mt-3 text-center text-[12px] leading-5 ${
              isDarkMode ? "text-[#d5dae6]" : "text-[#7d7988]"
            }`}
          >
            Select a sign-in option below to continue and securely access your
            account.
          </Text>
        </View>
      </View>

      <View className="mt-8 w-full max-w-[320px]">
        <Text className="text-center text-[12px] text-gun-powder dark:text-gray-suit">
          Continue below to sign in
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SignInScreen;
