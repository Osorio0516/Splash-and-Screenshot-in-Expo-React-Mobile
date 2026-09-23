import { useEffect, useState, useCallback } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import AnimatedSplash from "../components/AnimatedSplash";

// Keep the native splash visible while we prep the app
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // 👉 load fonts, fetch initial data, etc. here
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync(); // hide native splash
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  if (showAnimatedSplash) {
    return (
      <AnimatedSplash
        onFinish={() => setShowAnimatedSplash(false)}
        onReady={onLayoutRootView}
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}