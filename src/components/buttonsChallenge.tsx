import { useState } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import Desplegable from "./ui/desplegable";

const ButtonsChallenge = () => {
  // Animated values for fluid spring button press effects
  const [scale1] = useState(() => new Animated.Value(1));
  const [translateY1] = useState(() => new Animated.Value(0));

  const [scale2] = useState(() => new Animated.Value(1));
  const [translateY2] = useState(() => new Animated.Value(0));

  const handlePressIn = (scale: Animated.Value, translateY: Animated.Value) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.spring(translateY, {
        toValue: 3,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
    ]).start();
  };

  const handlePressOut = (
    scale: Animated.Value,
    translateY: Animated.Value,
  ) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 8,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 30,
        bounciness: 8,
      }),
    ]).start();
  };

  const [mostrarReto, setMostrarReto] = useState(false);

  return (
    <>
      {/* Animated Button 1 */}
      <Animated.View
        style={[
          styles.animatedButtonContainer,
          { transform: [{ scale: scale1 }, { translateY: translateY1 }] },
        ]}
      >
        <Pressable
          onPressIn={() => handlePressIn(scale1, translateY1)}
          onPressOut={() => handlePressOut(scale1, translateY1)}
          onPress={() => {}}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Reto diario</Text>
        </Pressable>
      </Animated.View>

      {/* Animated Button 2 */}
      <Animated.View
        style={[
          styles.animatedButtonContainer,
          { transform: [{ scale: scale2 }, { translateY: translateY2 }] },
        ]}
      >
        <Pressable
          onPressIn={() => handlePressIn(scale2, translateY2)}
          onPressOut={() => handlePressOut(scale2, translateY2)}
          onPress={() => setMostrarReto(true)}
          style={styles.button2}
        >
          <Text style={styles.buttonText}>Sorprendeme</Text>
        </Pressable>
      </Animated.View>

      {/* El estado controla el renderizado y el hijo puede cerrarse solo */}
      {mostrarReto && (
        <Desplegable
          onAccept={() => {}}
          onClose={() => setMostrarReto(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  animatedButtonContainer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  button: {
    backgroundColor: "#00CF37",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: "90%",
    maxWidth: 320,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#00CF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  button2: {
    backgroundColor: "#ffa500",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: "90%",
    maxWidth: 320,
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#ffa500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
});

export default ButtonsChallenge;
