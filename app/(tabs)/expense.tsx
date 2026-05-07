import SafeAreaView from "@/components/SafeAreaView";
import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
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

const buildDeleteApiCandidates = (id: string) => {
  const encoded = encodeURIComponent(id);
  const candidates = new Set<string>();

  for (const endpoint of buildApiCandidates()) {
    candidates.add(`${endpoint}/${encoded}`);

    if (endpoint.endsWith("/index")) {
      candidates.add(`${endpoint.slice(0, -"/index".length)}/${encoded}`);
    }
  }

  return [...candidates];
};

const parseExpenseDate = (input: string) => {
  const match = input.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;

  const [, mm, dd, yyyy] = match;
  const month = Number(mm);
  const day = Number(dd);
  const year = Number(yyyy);

  if (!Number.isInteger(month) || !Number.isInteger(day) || !Number.isInteger(year)) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const formatDateLabel = (input: string) => {
  const parsed = parseExpenseDate(input);
  if (!parsed) return input;

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
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

const ExpenseScreen = () => {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [items, setItems] = React.useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [searchText, setSearchText] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const loadExpenses = React.useCallback(async (isRefresh = false) => {
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
          const payload = (await response.json()) as { message?: string };
          if (payload?.message) {
            message = payload.message;
          }
        } catch {
          // Keep default message when response isn't JSON.
        }

        throw new Error(message);
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
          : "Failed to load expenses. Check your API and DB connection.";
      setErrorMessage(message);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  React.useEffect(() => {
    loadExpenses().catch(() => undefined);
  }, [loadExpenses]);

  const categories = React.useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category.trim()).filter(Boolean)));
    unique.sort((a, b) => a.localeCompare(b));
    return ["All", ...unique];
  }, [items]);

  const filteredItems = React.useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      const matchesSearch =
        !search ||
        item.title.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [items, searchText, selectedCategory]);

  const totals = React.useMemo(() => {
    const totalSpent = filteredItems.reduce((sum, item) => sum + Number(item.amount), 0);

    const now = new Date();
    const thisMonthTotal = filteredItems.reduce((sum, item) => {
      const parsed = parseExpenseDate(item.expense_date);

      if (!parsed) return sum;
      if (parsed.getFullYear() !== now.getFullYear() || parsed.getMonth() !== now.getMonth()) {
        return sum;
      }

      return sum + Number(item.amount);
    }, 0);

    return {
      totalSpent,
      thisMonthTotal,
      count: filteredItems.length,
    };
  }, [filteredItems]);

  const handleDeleteExpense = React.useCallback(
    async (item: ExpenseItem) => {
      setDeletingId(item.id);

      try {
        let response: Response | null = null;

        for (const endpoint of buildDeleteApiCandidates(item.id)) {
          const current = await fetch(endpoint, { method: "DELETE" });

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
            const payload = (await response.json()) as { message?: string };
            if (payload?.message) {
              message = payload.message;
            }
          } catch {
            // Keep default when response isn't JSON.
          }

          throw new Error(message);
        }

        setItems((current) => current.filter((entry) => entry.id !== item.id));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete expense.";
        Alert.alert("Delete Failed", message);
      } finally {
        setDeletingId(null);
      }
    },
    [],
  );

  const requestDelete = (item: ExpenseItem) => {
    Alert.alert(
      "Delete Expense",
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            handleDeleteExpense(item).catch(() => undefined);
          },
        },
      ],
    );
  };

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
            Expense
          </Text>
          <Pressable
            onPress={() => router.push("/Add")}
            className="rounded-xl bg-[#6c63ff] px-3 py-2"
          >
            <Text className="text-[12px] font-semibold text-white">+ Add</Text>
          </Pressable>
        </View>

        <View className="rounded-2xl border border-[#dbe2f0] bg-white p-4 dark:border-[#26283a] dark:bg-shark">
          <Text className="text-[11px] font-semibold uppercase tracking-[1.4px] text-[#6b7280] dark:text-gray-suit">
            Search
          </Text>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by title or category"
            placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
            className="mt-2 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-3 py-3 text-[14px] text-[#111827] dark:border-[#2b3142] dark:bg-[#141a27] dark:text-white"
          />

          <Text className="mt-4 text-[11px] font-semibold uppercase tracking-[1.4px] text-[#6b7280] dark:text-gray-suit">
            Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
            {categories.map((category, index) => {
              const isActive = category === selectedCategory;
              return (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`rounded-full border px-3 py-2 ${isActive ? "border-[#8b8fff] bg-[#6c63ff]" : "border-[#d1d5db] bg-[#f8fafc] dark:border-[#2b3142] dark:bg-[#141a27]"} ${index !== categories.length - 1 ? "mr-2" : ""}`}
                >
                  <Text
                    className={`text-[12px] font-semibold ${isActive ? "text-white" : "text-[#374151] dark:text-gray-suit"}`}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="mt-4 flex-row">
          <View className="mr-2 flex-1 rounded-2xl border border-[#dbe2f0] bg-white p-3 dark:border-[#26283a] dark:bg-shark">
            <Text className="text-[11px] uppercase tracking-[1.2px] text-[#6b7280] dark:text-gray-suit">
              Total
            </Text>
            <Text className="mt-1 text-[16px] font-extrabold text-[#4f46e5] dark:text-[#d9deff]">
              {formatMoney(totals.totalSpent)}
            </Text>
          </View>
          <View className="mr-2 flex-1 rounded-2xl border border-[#dbe2f0] bg-white p-3 dark:border-[#26283a] dark:bg-shark">
            <Text className="text-[11px] uppercase tracking-[1.2px] text-[#6b7280] dark:text-gray-suit">
              This Month
            </Text>
            <Text className="mt-1 text-[16px] font-extrabold text-[#4f46e5] dark:text-[#d9deff]">
              {formatMoney(totals.thisMonthTotal)}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl border border-[#dbe2f0] bg-white p-3 dark:border-[#26283a] dark:bg-shark">
            <Text className="text-[11px] uppercase tracking-[1.2px] text-[#6b7280] dark:text-gray-suit">
              Count
            </Text>
            <Text className="mt-1 text-[16px] font-extrabold text-[#4f46e5] dark:text-[#d9deff]">
              {totals.count}
            </Text>
          </View>
        </View>

        <View className="mt-5 rounded-2xl border border-[#dbe2f0] bg-white p-4 dark:border-[#26283a] dark:bg-shark">
          <Text className="mb-2 text-[16px] font-bold text-[#111827] dark:text-white">
            All Transactions
          </Text>

          {isLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator color="#9ea5ff" />
              <Text className="mt-2 text-[12px] text-[#6b7280] dark:text-gray-suit">
                Loading expenses...
              </Text>
            </View>
          ) : errorMessage ? (
            <View className="rounded-xl border border-[#f1c5d3] bg-[#fdf2f8] p-3 dark:border-[#45324f] dark:bg-[#2a1d31]">
              <Text className="text-[12px] text-[#9f1239] dark:text-[#f6b5c7]">
                {errorMessage}
              </Text>
              <Pressable
                onPress={() => {
                  loadExpenses().catch(() => undefined);
                }}
                className="mt-3 self-start rounded-lg bg-[#be123c] px-3 py-2"
              >
                <Text className="text-[12px] font-semibold text-white">
                  Retry
                </Text>
              </Pressable>
            </View>
          ) : filteredItems.length === 0 ? (
            <View className="items-center rounded-xl border border-dashed border-[#d1d5db] px-4 py-8 dark:border-[#3a3f55]">
              <Text className="text-[13px] font-semibold text-[#374151] dark:text-[#cfd3e6]">
                No expenses found.
              </Text>
              <Text className="mt-1 text-[12px] text-[#6b7280] dark:text-gray-suit">
                Change the filters or add a new expense.
              </Text>
            </View>
          ) : (
            filteredItems.map((item, index) => (
              <View
                key={item.id}
                className={`flex-row items-center py-3 ${index !== filteredItems.length - 1 ? "border-b border-[#e5e7eb] dark:border-[#25283a]" : ""}`}
              >
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#e8ebff] dark:bg-[#1f2233]">
                  <FontAwesome5
                    name={categoryIcon(item.category)}
                    size={15}
                    color={isDarkMode ? "#f7d56b" : "#4f46e5"}
                  />
                </View>

                <View className="flex-1 pr-3">
                  <Text className="text-[14px] font-semibold text-[#111827] dark:text-white">
                    {item.title}
                  </Text>
                  <Text className="mt-[2px] text-[11px] text-[#6b7280] dark:text-gray-suit">
                    {formatDateLabel(item.expense_date)} | {item.category}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className="text-[13px] font-extrabold text-[#4f46e5] dark:text-[#d9deff]">
                    {formatMoney(Number(item.amount))}
                  </Text>
                  <Pressable
                    onPress={() => requestDelete(item)}
                    disabled={deletingId === item.id}
                    className={`mt-1 flex-row items-center ${deletingId === item.id ? "opacity-60" : "opacity-100"}`}
                  >
                    {deletingId === item.id ? (
                      <ActivityIndicator size="small" color={isDarkMode ? "#fca5a5" : "#be123c"} />
                    ) : (
                      <FontAwesome5
                        name="trash-alt"
                        size={12}
                        color={isDarkMode ? "#fca5a5" : "#be123c"}
                      />
                    )}
                    <Text className="ml-1 text-[11px] font-semibold text-[#be123c] dark:text-[#fca5a5]">
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExpenseScreen;
