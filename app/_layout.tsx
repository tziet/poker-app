import { Stack } from "expo-router";
import "./globals.css";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="player/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="screens/moneySummary"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
