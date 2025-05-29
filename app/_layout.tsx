import { Stack } from "expo-router";
import "./globals.css";
import { StatusBar } from "expo-status-bar";
import { SessionProvider } from "@/contexts/SessionContext"; // Adjust the import path based on your project structure

export default function RootLayout() {
  return (
    <SessionProvider>
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
    </SessionProvider>
  );
}

// import { Stack } from "expo-router";
// import { AuthProvider } from "@/contexts/AuthContext";
// import { SessionProvider } from "@/contexts/SessionContext";
// import { StatusBar } from "expo-status-bar";
//
// export default function RootLayout() {
//   return (
//     <AuthProvider>
//       <SessionProvider>
//         <StatusBar style="light" />
//         <Stack>
//           <Stack.Screen name="(auth)" options={{ headerShown: false }} />
//           <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//           <Stack.Screen
//             name="player/[id]"
//             options={{
//               headerShown: false,
//             }}
//           />
//           <Stack.Screen
//             name="screens/moneySummary"
//             options={{
//               headerShown: false,
//             }}
//           />
//         </Stack>
//       </SessionProvider>
//     </AuthProvider>
//   );
// }
