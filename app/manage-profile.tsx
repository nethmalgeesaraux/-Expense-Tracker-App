import SafeAreaView from "@/components/SafeAreaView";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type FormKey = "name" | "email" | "password" | null;

const ManageProfileScreen = () => {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<FormKey>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const openForm = (form: Exclude<FormKey, null>) => {
    setActiveForm(form);
    setMessage(null);
  };

  const handleSaveName = () => {
    if (!fullName.trim()) {
      setMessage("Please enter your name.");
      return;
    }
    setMessage("Name changes saved locally.");
    setActiveForm(null);
  };

  const handleSaveEmail = () => {
    if (!email.includes("@")) {
      setMessage("Please enter a valid email.");
      return;
    }
    setMessage("Email changes saved locally.");
    setActiveForm(null);
  };

  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password must match.");
      return;
    }
    setMessage("Password changes saved locally.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setActiveForm(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-magnolia px-5 pt-3 dark:bg-cinder">
      <View className="flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full border border-[#d5dbea] bg-white dark:border-[#2d3344] dark:bg-[#171d2a]"
        >
          <Feather name="arrow-left" size={18} color="#1f2937" />
        </Pressable>
        <Text className="text-[22px] font-extrabold text-[#161a23] dark:text-white">
          Manage Profile
        </Text>
      </View>

      <View className="mt-8 rounded-2xl border border-[#d5dbea] bg-white p-5 dark:border-[#2d3344] dark:bg-[#171d2a]">
        <Text className="text-[16px] font-semibold text-[#111827] dark:text-[#f9fafb]">
          Profile Options
        </Text>
        <Text className="mt-2 text-[14px] text-[#6b7280] dark:text-[#9ca3af]">
          You can add your own profile edit actions here.
        </Text>

        <Pressable
          onPress={() => openForm("name")}
          className="mt-4 flex-row items-center justify-between rounded-xl border border-[#e5e7eb] p-4 dark:border-[#374151]"
        >
          <View>
            <Text className="font-semibold text-[#111827] dark:text-[#f9fafb]">Name</Text>
            <Text className="mt-1 text-[14px] text-[#6b7280] dark:text-[#9ca3af]">
              Update display name
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color="#6b7280" />
        </Pressable>

        <Pressable
          onPress={() => openForm("email")}
          className="mt-3 flex-row items-center justify-between rounded-xl border border-[#e5e7eb] p-4 dark:border-[#374151]"
        >
          <View>
            <Text className="font-semibold text-[#111827] dark:text-[#f9fafb]">Email</Text>
            <Text className="mt-1 text-[14px] text-[#6b7280] dark:text-[#9ca3af]">
              Update email address
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color="#6b7280" />
        </Pressable>

        <Pressable
          onPress={() => openForm("password")}
          className="mt-3 flex-row items-center justify-between rounded-xl border border-[#e5e7eb] p-4 dark:border-[#374151]"
        >
          <View>
            <Text className="font-semibold text-[#111827] dark:text-[#f9fafb]">Password</Text>
            <Text className="mt-1 text-[14px] text-[#6b7280] dark:text-[#9ca3af]">Change password</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#6b7280" />
        </Pressable>

        {activeForm === "name" && (
          <View className="mt-4 rounded-xl border border-[#e5e7eb] p-4 dark:border-[#374151]">
            <Text className="mb-2 font-semibold text-[#111827] dark:text-[#f9fafb]">Edit Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your name"
              className="rounded-lg border border-[#d1d5db] px-3 py-2 text-[#111827] dark:border-[#4b5563] dark:text-[#f9fafb]"
              placeholderTextColor="#9ca3af"
            />
            <Pressable
              onPress={handleSaveName}
              className="mt-3 items-center rounded-lg bg-[#111827] px-4 py-2 dark:bg-[#e5e7eb]"
            >
              <Text className="font-semibold text-[#f9fafb] dark:text-[#111827]">Save Name</Text>
            </Pressable>
          </View>
        )}

        {activeForm === "email" && (
          <View className="mt-4 rounded-xl border border-[#e5e7eb] p-4 dark:border-[#374151]">
            <Text className="mb-2 font-semibold text-[#111827] dark:text-[#f9fafb]">Edit Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              className="rounded-lg border border-[#d1d5db] px-3 py-2 text-[#111827] dark:border-[#4b5563] dark:text-[#f9fafb]"
              placeholderTextColor="#9ca3af"
            />
            <Pressable
              onPress={handleSaveEmail}
              className="mt-3 items-center rounded-lg bg-[#111827] px-4 py-2 dark:bg-[#e5e7eb]"
            >
              <Text className="font-semibold text-[#f9fafb] dark:text-[#111827]">Save Email</Text>
            </Pressable>
          </View>
        )}

        {activeForm === "password" && (
          <View className="mt-4 rounded-xl border border-[#e5e7eb] p-4 dark:border-[#374151]">
            <Text className="mb-2 font-semibold text-[#111827] dark:text-[#f9fafb]">Change Password</Text>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current password"
              secureTextEntry
              className="rounded-lg border border-[#d1d5db] px-3 py-2 text-[#111827] dark:border-[#4b5563] dark:text-[#f9fafb]"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password"
              secureTextEntry
              className="mt-2 rounded-lg border border-[#d1d5db] px-3 py-2 text-[#111827] dark:border-[#4b5563] dark:text-[#f9fafb]"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry
              className="mt-2 rounded-lg border border-[#d1d5db] px-3 py-2 text-[#111827] dark:border-[#4b5563] dark:text-[#f9fafb]"
              placeholderTextColor="#9ca3af"
            />
            <Pressable
              onPress={handleSavePassword}
              className="mt-3 items-center rounded-lg bg-[#111827] px-4 py-2 dark:bg-[#e5e7eb]"
            >
              <Text className="font-semibold text-[#f9fafb] dark:text-[#111827]">Save Password</Text>
            </Pressable>
          </View>
        )}

        {message && (
          <Text className="mt-3 text-[13px] text-[#374151] dark:text-[#d1d5db]">
            {message}
          </Text>
        )}

        <Pressable
          onPress={() => router.back()}
          className="mt-5 items-center rounded-xl bg-[#111827] px-4 py-3 dark:bg-[#e5e7eb]"
        >
          <Text className="font-semibold text-[#f9fafb] dark:text-[#111827]">
            Go Back
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default ManageProfileScreen;
