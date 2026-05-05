import SafeAreaView from "@/components/SafeAreaView";
import React from "react";
import { Text, View } from "react-native";

const HomeScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-magnolia px-5 pt-3 dark:bg-cinder">
      <View className="flex-row items-center">
        <Text className="text-[22px] font-extrabold text-[#161a23] dark:text-white">
          Home
        </Text>
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
