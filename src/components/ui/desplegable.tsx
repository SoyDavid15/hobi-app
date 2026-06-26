import { Pressable, StyleSheet, Text, View } from "react-native";
import { NotificationChallenge } from "../notificationChallenge";

interface DesplegableProps {
  onAccept: () => void;
  onClose: () => void;
}

export const Desplegable = ({ onAccept, onClose }: DesplegableProps) => {
  return (
    <View style={styles.container}>
      <NotificationChallenge />
      <View style={styles.buttonWrapper}>
        <Pressable onPress={onAccept} style={styles.buttonAccept}>
          <Text style={styles.Text}>Aceptar reto</Text>
        </Pressable>
        <Pressable onPress={onClose} style={styles.buttonClose}>
          <Text style={styles.Text}>Cerrar</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Desplegable;

const styles = StyleSheet.create({
  container: {
    width: "90%",
    height: "70%",
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
    zIndex: 10,
    position: "absolute",
  },
  Text: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  buttonWrapper: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  buttonAccept: {
    backgroundColor: "#00CF37",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: "70%",
    alignItems: "center",
    shadowColor: "#00CF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonClose: {
    backgroundColor: "#ffa500",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: "30%",
    alignItems: "center",
    shadowColor: "#ffa500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
});
