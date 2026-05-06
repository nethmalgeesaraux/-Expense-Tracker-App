import SafeAreaView from "@/components/SafeAreaView";
import { Feather } from "@expo/vector-icons";
import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

const ProfileScreen = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const displayName =
    user?.fullName || user?.firstName || user?.username || "Your Name";
  const displayEmail = user?.primaryEmailAddress?.emailAddress || "No email yet";
  const profileImageUrl = user?.imageUrl;
  const fallbackLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    router.replace("/sign-up");
  };

  const handleManageProfile = () => {
    router.push("/manage-profile");
  };

  return (
    <SafeAreaView className="flex-1 bg-magnolia px-5 pt-3 dark:bg-cinder">
      <View className="flex-1">
        <Text className="text-[22px] font-extrabold text-[#161a23] dark:text-white">
          Profile
        </Text>

        <View className="mt-8 rounded-2xl border border-[#d5dbea] bg-white p-5 dark:border-[#2d3344] dark:bg-[#171d2a]">
          <View className="flex-row items-center">
            {profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl }}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <View className="h-16 w-16 items-center justify-center rounded-full bg-[#dbe4ff] dark:bg-[#2a3552]">
                <Text className="text-[20px] font-bold text-[#1e3a8a] dark:text-[#bfdbfe]">
                  {fallbackLetter}
                </Text>
              </View>
            )}
            <View className="ml-4 flex-1">
              <Text className="text-[17px] font-bold text-[#111827] dark:text-[#f9fafb]">
                {displayName}
              </Text>
              <Text className="mt-1 text-[13px] text-[#6b7280] dark:text-[#9ca3af]">
                {displayEmail}
              </Text>
            </View>
          </View>

          <Text className="mt-4 text-[15px] text-[#4b5563] dark:text-[#d1d5db]">
            Manage your account settings from here.
          </Text>

          <Pressable
            onPress={handleManageProfile}
            className="mt-5 flex-row items-center justify-between rounded-xl border border-[#d5dbea] px-4 py-3 dark:border-[#2d3344]"
          >
            <View className="flex-row items-center">
              <Feather
                name="settings"
                size={18}
                color={isDarkMode ? "#e5e7eb" : "#1f2937"}
              />
              <Text className="ml-2 font-semibold text-[#111827] dark:text-[#f3f4f6]">
                Manage Profile
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={18}
              color={isDarkMode ? "#9ca3af" : "#6b7280"}
            />
          </Pressable>

          <Pressable
            onPress={handleLogout}
            className="mt-5 flex-row items-center justify-center rounded-xl bg-[#111827] px-4 py-3 dark:bg-[#e5e7eb]"
          >
            <Feather
              name="log-out"
              size={18}
              color={isDarkMode ? "#111827" : "#f9fafb"}
            />
            <Text className="ml-2 font-semibold text-[#f9fafb] dark:text-[#111827]">
              Log Out
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
