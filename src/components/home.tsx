import { useEffect, useRef } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ChallengeCard } from "@/components/challenge-card";
import { useAuth } from "@/providers/auth-provider";

const Home = () => {
  const { session, signOut } = useAuth();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!session) {
      signOut();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [session, signOut]);

  return (
    <ThemedView style={styles.container} type="backgroundElement">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.textContainer} type="background">
          <ThemedText style={styles.text} themeColor="textSecondary">
            Hola, soy
          </ThemedText>
          <ThemedText style={styles.textTitle}>Hobi</ThemedText>
        </ThemedView>
        <ChallengeCard />
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  textContainer: {
    backgroundColor: "transparent",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 10,
    width: "90%",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
});

export default Home;