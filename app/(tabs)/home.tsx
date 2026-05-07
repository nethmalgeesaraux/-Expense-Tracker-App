import SafeAreaView from "@/components/SafeAreaView";
import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

type ExpenseItem = {
  id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  created_at: number;
};

type ExpensesApiResponse = {
  success: boolean;
  data?: ExpenseItem[];
  message?: string;
};

const monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_TO_SHOW = 6;

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

const parseExpenseDate = (input: string) => {
  const match = input.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;

  const [, mm, dd, yyyy] = match;
  const month = Number(mm) - 1;
  const day = Number(dd);
  const year = Number(yyyy);

  const date = new Date(year, month, day);
  if (Number.isNaN(date.getTime())) return null;

  return date;
};

const formatShortDate = (input: string) => {
  const parsed = parseExpenseDate(input);
  if (!parsed) return input;

  const day = `${parsed.getDate()}`.padStart(2, "0");
  const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
  return `${day}/${month}`;
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

const categoryIcon = (category: string) => {
  const key = category.toLowerCase();

  if (key.includes("food")) return "utensils";
  if (key.includes("transport")) return "car-side";
  if (key.includes("bill")) return "file-invoice-dollar";
  if (key.includes("health")) return "briefcase-medical";
  if (key.includes("education")) return "graduation-cap";
  if (key.includes("shopping")) return "shopping-bag";
  if (key.includes("entertainment")) return "film";

  return "wallet";
};

const HomeScreen = () => {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadExpenses = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const candidates = buildApiCandidates();
      let response: Response | null = null;

      for (const endpoint of candidates) {
        const current = await fetch(endpoint);

        // Try the next candidate only for 404 path mismatches.
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
        let apiMessage = `Failed with status ${response.status}`;
        try {
          const failedPayload = (await response.json()) as {
            message?: string;
          };
          if (failedPayload?.message) {
            apiMessage = failedPayload.message;
          }
        } catch {
          // keep default message if response is not JSON
        }
        throw new Error(apiMessage);
      }

      const payload = (await response.json()) as ExpensesApiResponse;
      if (!payload.success || !Array.isArray(payload.data)) {
        throw new Error(payload.message || "Unexpected API response.");
      }

      setItems(payload.data);
      setErrorMessage(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load expenses. Check API and DB connection.";
      setErrorMessage(message);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadExpenses().catch(() => undefined);
  }, [loadExpenses]);

  const monthlyBars = useMemo(() => {
    const sums = new Map<string, number>();

    for (const item of items) {
      const parsedDate = parseExpenseDate(item.expense_date);
      if (!parsedDate) continue;

      const month = parsedDate.getMonth();
      const year = parsedDate.getFullYear();
      const key = `${year}-${month}`;
      const existing = sums.get(key) ?? 0;
      sums.set(key, existing + Number(item.amount));
    }

    const now = new Date();
    const series = Array.from({ length: MONTHS_TO_SHOW }, (_, index) => {
      const offset = MONTHS_TO_SHOW - 1 - index;
      const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const month = monthDate.getMonth();
      const year = monthDate.getFullYear();
      const key = `${year}-${month}`;

      return {
        label: monthShort[month],
        total: sums.get(key) ?? 0,
        order: year * 12 + month,
      };
    });

    const max = series.reduce((acc, item) => Math.max(acc, item.total), 0);

    return series.map((item) => ({
      ...item,
      height: max > 0 ? Math.max(16, Math.round((item.total / max) * 80)) : 16,
    }));
  }, [items]);

  const recentTransactions = useMemo(() => items.slice(0, 5), [items]);
  const totalSpent = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.amount), 0),
    [items],
  );

  return (
    <SafeAreaView className="flex-1 bg-magnolia dark:bg-cinder">
      <ScrollView
        className="flex-1 px-5 pt-3"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor={isDarkMode ? "#9ea5ff" : "#4f46e5"}
            onRefresh={() => {
              loadExpenses(true).catch(() => undefined);
            }}
          />
        }
      >
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-[22px] font-extrabold text-[#111827] dark:text-white">
            Home
          </Text>
          <Text className="text-[12px] text-[#6b7280] dark:text-gray-suit">
            Total {formatMoney(totalSpent)}
          </Text>
        </View>

        <View
          className="rounded-2xl border border-[#dbe2f0] bg-white p-4 dark:border-[#26283a] dark:bg-shark"
          style={{
            shadowColor: isDarkMode ? "#6f73ff" : "#93a0ff",
            shadowOpacity: isDarkMode ? 0.35 : 0.2,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
            elevation: isDarkMode ? 4 : 2,
          }}
        >
          <Text className="text-[14px] font-semibold text-[#1f2937] dark:text-[#d8dcff]">
            Monthly Spend
          </Text>
          <View className="mt-4 flex-row items-end justify-between">
            {monthlyBars.map((bar) => (
              <View key={`${bar.label}-${bar.order}`} className="items-center">
                <Text className="mb-2 text-[11px] text-[#6b7280] dark:text-gray-suit">
                  {formatMoney(bar.total)}
                </Text>
                <View
                  className="w-9 rounded-t-xl border border-[#8b8fff] bg-royal-blue"
                  style={{ height: bar.height }}
                />
                <Text className="mt-2 text-[12px] font-semibold text-[#4f46e5] dark:text-[#b6bbff]">
                  {bar.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-5 rounded-2xl border border-[#dbe2f0] bg-white p-4 dark:border-[#26283a] dark:bg-shark">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[16px] font-bold text-[#111827] dark:text-white">
              Recent Transaction
            </Text>
            <Pressable onPress={() => router.push("/expense")}>
              <Text className="text-[12px] font-semibold text-[#4f46e5] dark:text-[#c6cbff]">
                View All
              </Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#9ea5ff" />
              <Text className="mt-2 text-[12px] text-[#6b7280] dark:text-gray-suit">
                Loading...
              </Text>
            </View>
          ) : errorMessage ? (
            <View className="rounded-xl border border-[#f1c5d3] bg-[#fdf2f8] p-3 dark:border-[#45324f] dark:bg-[#2a1d31]">
              <Text className="text-[12px] text-[#9f1239] dark:text-[#f6b5c7]">
                {errorMessage}
              </Text>
            </View>
          ) : recentTransactions.length === 0 ? (
            <Text className="text-[13px] text-[#6b7280] dark:text-gray-suit">
              No transactions found.
            </Text>
          ) : (
            recentTransactions.map((item, index) => (
              <View
                key={item.id}
                className={`flex-row items-center py-3 ${index !== recentTransactions.length - 1 ? "border-b border-[#e5e7eb] dark:border-[#25283a]" : ""}`}
              >
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-[#e8ebff] dark:bg-[#1f2233]">
                  <FontAwesome5
                    name={categoryIcon(item.category)}
                    size={14}
                    color={isDarkMode ? "#f7d56b" : "#4f46e5"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-[#111827] dark:text-white">
                    {item.title}
                  </Text>
                  <Text className="text-[11px] text-[#6b7280] dark:text-gray-suit">
                    {formatShortDate(item.expense_date)} | {item.category}
                  </Text>
                </View>
                <Text className="text-[13px] font-extrabold text-[#4f46e5] dark:text-[#d9deff]">
                  {formatMoney(Number(item.amount))}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
