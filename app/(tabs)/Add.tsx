import SafeAreaView from "@/components/SafeAreaView";
import React from "react";
import { Text, View } from "react-native";

const AddScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-magnolia px-5 pt-3 dark:bg-cinder">
      <View className="flex-1">
        <Text className="text-[22px] font-extrabold text-[#161a23] dark:text-white">
          Add
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default AddScreen;
