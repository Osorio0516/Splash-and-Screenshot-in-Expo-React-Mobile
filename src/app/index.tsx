import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Animated,
  Easing,
} from "react-native";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library/legacy";

export default function Index() {
  const viewShotRef = useRef<any>(null);
  const [saving, setSaving] = useState(false);

  // One entrance animation for the whole content block
  const enter = useRef(new Animated.Value(0)).current;
  // Button press feedback
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const animatePress = (to: number) =>
    Animated.spring(press, {
      toValue: to,
      speed: 40,
      bounciness: 6,
      useNativeDriver: true,
    }).start();

  const handleScreenshot = async () => {
    try {
      setSaving(true);

      // Ask for permission to save to the gallery
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow photo library access to save screenshots."
        );
        setSaving(false);
        return;
      }

      // Capture the view as an image URI
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) throw new Error("Failed to capture screenshot");

      // Save it to the device's gallery
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Application", asset, false);

      Alert.alert("Saved!", "Screenshot saved to your gallery.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong while saving the screenshot.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ViewShot
      ref={viewShotRef}
      style={styles.container}
      options={{ format: "png", quality: 1 }}
    >
      {/* Soft background glows */}
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: enter,
            transform: [
              {
                translateY: enter.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Lens-style badge: concentric rings around the camera */}
        <View style={styles.ringOuter}>
          <View style={styles.ringInner}>
            <Text style={styles.badgeEmoji}>📸</Text>
          </View>
        </View>

        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>
          Capture this screen and save it straight to your gallery.
        </Text>

        <Animated.View style={{ transform: [{ scale: press }] }}>
          <Pressable
            onPress={handleScreenshot}
            onPressIn={() => animatePress(0.96)}
            onPressOut={() => animatePress(1)}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Save screenshot"
            style={[styles.button, saving && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {saving ? "Saving…" : "Save screenshot"}
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </ViewShot>
  );
}

const TEAL = "#39C5BB";
const BG = "#00181c";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
    overflow: "hidden",
  },

  // Background glows
  glow: {
    position: "absolute",
    backgroundColor: TEAL,
  },
  glowTop: {
    width: 340,
    height: 340,
    borderRadius: 170,
    top: -110,
    right: -120,
    opacity: 0.09,
  },
  glowBottom: {
    width: 280,
    height: 280,
    borderRadius: 140,
    bottom: -90,
    left: -100,
    opacity: 0.06,
  },

  content: {
    alignItems: "center",
    paddingHorizontal: 32,
  },

  // Badge
  ringOuter: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1,
    borderColor: "rgba(57, 197, 187, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  ringInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: "rgba(57, 197, 187, 0.6)",
    backgroundColor: "rgba(57, 197, 187, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: TEAL,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  badgeEmoji: {
    fontSize: 40,
  },

  // Text
  title: {
    color: "#E8FFFD",
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    color: "rgba(232, 255, 253, 0.6)",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 280,
    marginBottom: 40,
  },

  // Button
  button: {
    backgroundColor: TEAL,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 999,
    minWidth: 220,
    alignItems: "center",
    shadowColor: TEAL,
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: BG,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});