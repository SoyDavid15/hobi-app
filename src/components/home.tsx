import { useState, useEffect } from "react";
import { Text, StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { HobiCharacter } from "@/components/hobi-character";
import { ChallengeCard } from "@/components/challenge-card";
import ButtonsChallenge from "@/components/buttonsChallenge";
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

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / slideWidth);
        setActiveSlide(index);
    };

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

                <ThemedView style={[styles.carouselWrapper, { width: slideWidth, height: carouselHeight }]}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        snapToInterval={slideWidth}
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        contentContainerStyle={styles.carouselContent}
                    >
                        <ThemedView style={[styles.slide, { width: slideWidth }]}>
                            <HobiCharacter size={carouselHeight * 0.85} />
                        </ThemedView>

                        <ThemedView style={[styles.slide, { width: slideWidth }]}>
                            <ChallengeCard />
                        </ThemedView>
                    </ScrollView>
                </ThemedView>

                <ThemedView style={styles.indicatorContainer}>
                    <ThemedView style={[styles.indicatorDot, activeSlide === 0 && styles.indicatorDotActive]} />
                    <ThemedView style={[styles.indicatorDot, activeSlide === 1 && styles.indicatorDotActive]} />
                </ThemedView>

                <ButtonsChallenge />
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#ffffff",
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
        marginBottom: 20,
        width: "90%",
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: "#00000072",
    },
    textTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: "#4f4f4f",
    },
    carouselWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    carouselContent: {
        alignItems: 'center',
    },
    slide: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    indicatorContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
        marginBottom: 20,
        backgroundColor: 'transparent',
    },
    indicatorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#e1e4e8",
    },
    indicatorDotActive: {
        width: 20,
        backgroundColor: "#00CF37",
    },
});

export default Home;