import { StyleSheet } from "react-native";
import { ThemedView, ThemedImage } from "@/components/themed-view";

interface HobiCharacterProps {
    size?: number;
}

export function HobiCharacter({ size }: HobiCharacterProps) {
    return (
        <ThemedView style={styles.container}>
            <ThemedImage
                source={require("@/assets/images/hobiCharacter.png")}
                style={[styles.image, size ? { height: size } : null]}
                contentFit="contain"
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    image: {
        width: "90%",
        height: 320,
    },
});
