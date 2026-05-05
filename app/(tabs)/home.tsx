import SafeAreaView from "@/components/SafeAreaView";
import { Feather } from "@expo/vector-icons";
import { useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Pressable, Text, View } from "react-native";

const HomeScreen = () => {
  const { signOut } = useClerk();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const handleLogout = async () => {
    await signOut();
    router.replace("/sign-up");
  };

  return (
    <SafeAreaView className="flex-1 bg-magnolia px-5 pt-3 dark:bg-cinder">
      <View className="flex-row items-center justify-between">
        <Text className="text-[22px] font-extrabold text-[#161a23] dark:text-white">
          Home
        </Text>

        <Pressable
          onPress={handleLogout}
          className="h-11 w-11 items-center justify-center rounded-full border border-[#d5dbea] bg-white dark:border-[#2d3344] dark:bg-[#171d2a]"
        >
          <Feather name="log-out" size={18} color={isDarkMode ? "#e5e7eb" : "#1f2937"} />
        </Pressable>
      </View>

      <View className="mt-8">
        <Text className="text-[16px] text-[#4b5563] dark:text-[#d1d5db]">
          Welcome to MoneyMap.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
