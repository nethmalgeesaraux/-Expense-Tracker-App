import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-up" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDarkMode ? "#e5e7eb" : "#1f2937",
        tabBarInactiveTintColor: isDarkMode ? "#9ca3af" : "#6b7280",
        tabBarStyle: {
          backgroundColor: isDarkMode ? "#11131b" : "#ffffff",
          borderTopColor: isDarkMode ? "#26283a" : "#e5e7eb",
        },
      }}
      initialRouteName="home"
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Add"
        options={{
          title: "Add",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="plus-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expense"
        options={{
          title: "Expense",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
