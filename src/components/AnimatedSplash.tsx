import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, Easing, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  onFinish: () => void;
  onReady: () => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SPLASH_DURATION = 2400; // ms
const TEAL = "#39C5BB";
const CYAN_ACCENT = "#00F2FE";

export default function AnimatedSplash({ onFinish, onReady }: Props) {
  // Main screen animations
  const containerFade = useRef(new Animated.Value(1)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(14)).current;

  // Ambient pulse rings
  const pulseRing = useRef(new Animated.Value(0.85)).current;
  const pulseOpacity = useRef(new Animated.Value(0.5)).current;

  // Progress bar fill
  const progress = useRef(new Animated.Value(0)).current;

  // Animated equalizer bars (5 bars bouncing at different speeds)
  const eqBars = useRef([
    new Animated.Value(0.4),
    new Animated.Value(0.7),
    new Animated.Value(1.0),
    new Animated.Value(0.6),
    new Animated.Value(0.3),
  ]).current;

  useEffect(() => {
    onReady();

    // 1. Entrance Choreography (Logo -> Text)
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoFade, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 2. Ambient Backdrop Pulsing Ring
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseRing, {
            toValue: 1.25,
            duration: 1100,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseRing, {
            toValue: 0.85,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.15,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.5,
            duration: 1100,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // 3. Dynamic Equalizer Sound Wave Loops
    const createEqAnimation = (bar: Animated.Value, min: number, max: number, speed: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: max,
            duration: speed,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: min,
            duration: speed,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const eqAnimations = [
      createEqAnimation(eqBars[0], 0.3, 0.95, 300),
      createEqAnimation(eqBars[1], 0.4, 1.15, 240),
      createEqAnimation(eqBars[2], 0.5, 1.3, 360),
      createEqAnimation(eqBars[3], 0.35, 1.05, 270),
      createEqAnimation(eqBars[4], 0.25, 0.85, 330),
    ];

    eqAnimations.forEach((anim) => anim.start());

    // 4. Progress bar timing
    Animated.timing(progress, {
      toValue: 1,
      duration: SPLASH_DURATION,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();

    // 5. Exit sequence
    const timer = setTimeout(() => {
      Animated.timing(containerFade, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => onFinish());
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.root, { opacity: containerFade }]}>
      <LinearGradient
        colors={["#000c0f", "#011f26", "#00323a"]}
        style={styles.container}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* Pulsing Ambient Backdrop Ring */}
        <Animated.View
          style={[
            styles.pulseGlow,
            {
              opacity: pulseOpacity,
              transform: [{ scale: pulseRing }],
            },
          ]}
        />

        {/* Central Logo Emblem */}
        <Animated.View
          style={{
            opacity: logoFade,
            transform: [{ scale: logoScale }],
            alignItems: "center",
          }}
        >
          <View style={styles.badgeOuter}>
            <View style={styles.badgeInner}>
              <View style={styles.soundWaveContainer}>
                {eqBars.map((animVal, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.eqBar,
                      { transform: [{ scaleY: animVal }] },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Title & Subtitle with Accent Lines */}
        <Animated.View
          style={{
            opacity: textFade,
            transform: [{ translateY: textTranslateY }],
            alignItems: "center",
            marginTop: 28,
          }}
        >
          <Text style={styles.title}>SPLASH SCREEN</Text>
          <View style={styles.subtitleRow}>
            <View style={styles.accentLine} />
            <Text style={styles.subtitle}>T U N E  I N</Text>
            <View style={styles.accentLine} />
          </View>
        </Animated.View>

        {/* Cyber Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: barWidth }]}>
              <View style={styles.progressGlowHead} />
            </Animated.View>
          </View>
          <Text style={styles.loadingText}>INITIALIZING AUDIO</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: TEAL,
    opacity: 0.3,
  },
  badgeOuter: {
    width: 124,
    height: 124,
    borderRadius: 62,
    padding: 2,
    backgroundColor: "rgba(57, 197, 187, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(57, 197, 187, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 12,
  },
  badgeInner: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    backgroundColor: "#012028",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: TEAL,
  },
  soundWaveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    gap: 6,
  },
  eqBar: {
    width: 5,
    height: 38,
    borderRadius: 3,
    backgroundColor: TEAL,
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2.5,
    textShadowColor: "rgba(57, 197, 187, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 10,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: TEAL,
    letterSpacing: 3,
  },
  accentLine: {
    width: 20,
    height: 1,
    backgroundColor: "rgba(57, 197, 187, 0.4)",
  },
  progressContainer: {
    position: "absolute",
    bottom: 54,
    alignItems: "center",
  },
  progressTrack: {
    width: SCREEN_WIDTH * 0.55,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(57, 197, 187, 0.12)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: TEAL,
    borderRadius: 2,
    position: "relative",
  },
  progressGlowHead: {
    position: "absolute",
    right: 0,
    top: -2,
    width: 6,
    height: 7,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(57, 197, 187, 0.6)",
    letterSpacing: 2,
  },
});