import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import Home from "@/components/home";
import { useUserProgress } from "@/hooks/user-progress";
import { useAuth } from "@/providers/auth-provider";

export default function HomeScreen() {
  const { session, loading } = useAuth();

  const { dailyChallenge } = useUserProgress();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return session ? (
    <Home />
  ) : (
    <Redirect href="/login" />
  );
}