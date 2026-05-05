import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();

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
        tabBarActiveTintColor: "#1f2937",
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

