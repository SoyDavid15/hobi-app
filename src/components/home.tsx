import { useState, useEffect } from "react";
import { StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
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
        <ThemedView style={styles.container} type="backgroundElement">
            <ScrollView 
                contentContainerStyle={[styles.scrollContent, { paddingVertical: verticalPadding }]}
                showsVerticalScrollIndicator={false}
            >
                <ThemedView style={styles.textContainer} type="background">
                    <ThemedText style={styles.text} themeColor="textSecondary">Hola, soy</ThemedText>
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
    },
    textTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
});

export default Home;