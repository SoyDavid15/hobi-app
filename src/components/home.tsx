import { useState, useEffect } from "react";
import { Text, StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { HobiCharacter } from "@/components/hobi-character";
import { ChallengeCard } from "@/components/challenge-card";
import { supabase } from "../../supabaseClient";

const Home = () => {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const [activeSlide, setActiveSlide] = useState(0);

    // Validación automática: si el usuario no existe en la BD, forzamos salida
    useEffect(() => {
        const verifySession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                await supabase.auth.signOut();
            }
        };
        verifySession();
    }, []);

    const slideWidth = Math.min(screenWidth, 500);
    const carouselHeight = screenHeight < 680 ? 250 : 320;
    const verticalPadding = screenHeight < 680 ? 20 : 40;

    return (
        <ThemedView style={styles.container}>
            <ScrollView 
                contentContainerStyle={[styles.scrollContent, { paddingVertical: verticalPadding }]}
                showsVerticalScrollIndicator={false}
            >
                <ThemedView style={styles.textContainer}>
                    <Text style={styles.text}>Hola, soy</Text>
                    <Text style={styles.textTitle}>Hobi</Text>
                </ThemedView>
                <ChallengeCard />
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f0f2f5", // Light gray background
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        backgroundColor: "transparent",
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 10,
        width: "90%",
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: "#95a5a6",
    },
    textTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: "#4f4f4f",
    },
});

export default Home;