import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "react-native";
import { icons } from "@/constants/icons";
import { signInWithGoogle } from "@/services/auth";
import GoogleSignInButton from "@/app/components/ui/GoogleSignInButton";
import * as WebBrowser from "expo-web-browser";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

WebBrowser.maybeCompleteAuthSession();

const LandingScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { promptAsync, error } = useGoogleAuth();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await promptAsync();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show error if there is one
  React.useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={icons.logo}
          style={styles.logo}
          resizeMode="contain"
          tintColor="white"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <GoogleSignInButton onPress={handleGoogleSignIn} disabled={isLoading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0D23",
    padding: 20,
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 100,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#1E1B38",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  registerButton: {
    backgroundColor: "#2D2A47",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LandingScreen;
