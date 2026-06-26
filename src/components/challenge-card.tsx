import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";
import { NotificationChallenge } from "./notificationChallenge";

export function ChallengeCard() {
  return (
    <ThemedView style={styles.card}>
      <NotificationChallenge />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "90%",
    height: "100%",
    backgroundColor: "#f5f6fa",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e1e4e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00000072",
    textAlign: "center",
  },
  cardBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#00CF3720",
    color: "#00CF37",
    fontSize: 12,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2f3640",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    marginBottom: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f2f5",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f3640",
  },
  statLabel: {
    fontSize: 12,
    color: "#95a5a6",
    marginTop: 4,
  },
  progressContainer: {
    backgroundColor: "transparent",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#e1e4e8",
    borderRadius: 4,
    width: "100%",
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBarFill: {
    height: "100%",
    width: "33%",
    backgroundColor: "#ffa500",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#95a5a6",
    textAlign: "right",
  },
});
