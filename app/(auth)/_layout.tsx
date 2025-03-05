import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function AuthLayout() {
  const [loaded] = useFonts({
    RobotoBold: require("../../assets/fonts/Roboto-Bold.ttf"),
    RobotoSemiBold: require("../../assets/fonts/Roboto-SemiBold.ttf"),
    RobotoMedium: require("../../assets/fonts/Roboto-Medium.ttf"),
    RobotoRegular: require("../../assets/fonts/Roboto-Regular.ttf"),
    RobotoLight: require("../../assets/fonts/Roboto-Light.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
