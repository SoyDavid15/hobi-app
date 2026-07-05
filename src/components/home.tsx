import { useEffect, useRef, useState, useCallback } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ChallengeCard } from "@/components/challenge-card";
import { useAuth } from "@/providers/auth-provider";

const SELECTED_HOBBIES_KEY = "@hobi-selected-hobbies";

const Home = () => {
  const { session, signOut } = useAuth();
  const mountedRef = useRef(true);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);

  useEffect(() => {
    mountedRef.current = true;

    if (!session) {
      signOut();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [session, signOut]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(SELECTED_HOBBIES_KEY).then((saved) => {
        if (mountedRef.current) {
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setSelectedHobbies(Array.isArray(parsed) ? parsed : []);
            } catch {
              setSelectedHobbies([saved]);
            }
          } else {
            setSelectedHobbies([]);
          }
        }
      });
    }, [])
  );

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

        <ChallengeCard selectedCategories={selectedHobbies} />
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