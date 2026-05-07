import SafeAreaView from "@/components/SafeAreaView";
import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type CreateExpenseResponse = {
  success: boolean;
  message?: string;
  details?: string[];
};

const categories = ["Food", "Transport", "Groceries", "Entertainment", "Bills"];

const iconChoices: { key: string; icon: React.ComponentProps<typeof FontAwesome5>["name"] }[] = [
  { key: "general", icon: "th-large" },
  { key: "travel", icon: "plane" },
  { key: "shopping", icon: "shopping-bag" },
  { key: "movie", icon: "film" },
  { key: "money", icon: "coins" },
];

const resolveApiUrl = () => {
  const explicitBase = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (explicitBase) {
    return `${explicitBase.replace(/\/$/, "")}/api`;
  }

  return "/api";
};

const buildApiCandidates = () => {
  const primary = resolveApiUrl().replace(/\/$/, "");
  const withIndex = `${primary}/index`;

  if (withIndex === primary) {
    return [primary];
  }

  return [primary, withIndex];
};

const formatToday = () => {
  const now = new Date();
  const mm = `${now.getMonth() + 1}`.padStart(2, "0");
  const dd = `${now.getDate()}`.padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
};

const AddScreen = () => {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [amountText, setAmountText] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedIcon, setSelectedIcon] = useState(iconChoices[0].key);
  const [dateText, setDateText] = useState(formatToday());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amountPreview = useMemo(() => Number(amountText || 0), [amountText]);

  const onAmountChange = (value: string) => {
    const digitsOnly = value.replace(/[^\d]/g, "");
    setAmountText(digitsOnly);
  };

  const onDateChange = (value: string) => {
    const clean = value.replace(/[^\d-]/g, "");
    setDateText(clean);
  };

  const validateForm = () => {
    if (!amountText || Number(amountText) <= 0) {
      return "Please enter a valid amount.";
    }

    if (!title.trim()) {
      return "Please enter a title.";
    }

    if (!/^\d{2}-\d{2}-\d{4}$/.test(dateText)) {
      return "Date must be in MM-DD-YYYY format.";
    }

    return null;
  };

  const handleAddExpense = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert("Validation", validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        category: selectedCategory,
        amount: Number(amountText),
        expense_date: dateText,
      };

      const candidates = buildApiCandidates();
      let response: Response | null = null;

      for (const endpoint of candidates) {
        const current = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (current.status === 404) {
          response = current;
          continue;
        }

        response = current;
        break;
      }

      if (!response) {
        throw new Error("No API response received.");
      }

      if (!response.ok) {
        let message = `Failed with status ${response.status}`;
        try {
          const failed = (await response.json()) as CreateExpenseResponse;
          if (failed.message) {
            message = failed.message;
          }
          if (failed.details?.length) {
            message = `${message}\n${failed.details.join("\n")}`;
          }
        } catch {
          // keep fallback message
        }

        throw new Error(message);
      }

      setAmountText("");
      setTitle("");
      setSelectedCategory(categories[0]);
      setSelectedIcon(iconChoices[0].key);
      setDateText(formatToday());

      Alert.alert("Success", "Expense added successfully.");
      router.replace("/home");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add expense.";
      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-magnolia dark:bg-cinder">
      <ScrollView className="flex-1 px-5 pt-3" contentContainerStyle={{ paddingBottom: 24 }}>
        <Text className="text-[22px] font-extrabold text-[#111827] dark:text-white">
          Add
        </Text>

        <View className="mt-5 rounded-2xl border border-[#dbe2f0] bg-white p-4 dark:border-[#26283a] dark:bg-shark">
          <Text className="text-[11px] font-semibold uppercase tracking-[1.4px] text-[#6b7280] dark:text-gray-suit">
            Enter Amount
          </Text>
          <View className="mt-2 flex-row items-center">
            <Text className="mr-2 text-[34px] font-black text-[#4f46e5] dark:text-[#d9deff]">
              $
            </Text>
            <TextInput
              value={amountText}
              onChangeText={onAmountChange}
              placeholder="0"
              placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
              keyboardType="numeric"
              className="flex-1 text-[40px] font-black text-[#111827] dark:text-white"
            />
          </View>
          <Text className="mt-1 text-[12px] text-[#6b7280] dark:text-gray-suit">
            Preview: ${amountPreview.toLocaleString()}
          </Text>

          <Text className="mt-5 text-[11px] font-semibold uppercase tracking-[1.4px] text-[#6b7280] dark:text-gray-suit">
            Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Movie Tickets"
            placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
            className="mt-2 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-3 py-3 text-[15px] text-[#111827] dark:border-[#2b3142] dark:bg-[#141a27] dark:text-white"
          />

          <Text className="mt-5 text-[11px] font-semibold uppercase tracking-[1.4px] text-[#6b7280] dark:text-gray-suit">
            Category
          </Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = category === selectedCategory;
              return (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`rounded-full border px-3 py-2 ${isActive ? "border-[#8b8fff] bg-[#6c63ff]" : "border-[#d1d5db] bg-[#f8fafc] dark:border-[#2b3142] dark:bg-[#141a27]"}`}
                >
                  <Text
                    className={`text-[12px] font-semibold ${isActive ? "text-white" : "text-[#374151] dark:text-gray-suit"}`}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="mt-5 text-[11px] font-semibold uppercase tracking-[1.4px] text-[#6b7280] dark:text-gray-suit">
            Icon
          </Text>
          <View className="mt-2 flex-row">
            {iconChoices.map((choice) => {
              const isActive = choice.key === selectedIcon;
              return (
                <Pressable
                  key={choice.key}
                  onPress={() => setSelectedIcon(choice.key)}
                  className={`mr-2 h-10 w-10 items-center justify-center rounded-lg border ${isActive ? "border-[#6c63ff] bg-[#6c63ff]" : "border-[#d1d5db] bg-[#f8fafc] dark:border-[#2b3142] dark:bg-[#141a27]"}`}
                >
                  <FontAwesome5
                    name={choice.icon}
                    size={14}
                    color={isActive ? "#ffffff" : isDarkMode ? "#d1d5db" : "#374151"}
                  />
                </Pressable>
              );
            })}
          </View>

          <Text className="mt-5 text-[11px] font-semibold uppercase tracking-[1.4px] text-[#6b7280] dark:text-gray-suit">
            Date
          </Text>
          <TextInput
            value={dateText}
            onChangeText={onDateChange}
            placeholder="MM-DD-YYYY"
            placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
            className="mt-2 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-3 py-3 text-[15px] font-semibold text-[#111827] dark:border-[#2b3142] dark:bg-[#141a27] dark:text-white"
          />

          <Pressable
            onPress={() => {
              handleAddExpense().catch(() => undefined);
            }}
            disabled={isSubmitting}
            className={`mt-6 h-12 items-center justify-center rounded-xl ${isSubmitting ? "bg-[#9fa8ff]" : "bg-[#6c63ff]"}`}
          >
            {isSubmitting ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#fff" />
                <Text className="ml-2 text-[15px] font-bold text-white">
                  Adding...
                </Text>
              </View>
            ) : (
              <Text className="text-[15px] font-bold text-white">Add Expense</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddScreen;
