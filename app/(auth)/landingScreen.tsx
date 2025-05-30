import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "react-native";
import { icons } from "@/constants/icons";
import GoogleSignInButton from "@/app/components/ui/GoogleSignInButton";
import * as WebBrowser from "expo-web-browser";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { authStyles } from "@/styles/auth.styles";

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
    <View style={authStyles.container}>
      <View style={authStyles.header}>
        <Image
          source={icons.logo}
          style={authStyles.logo}
          resizeMode="contain"
          tintColor="white"
        />
      </View>

      <View style={authStyles.buttonContainer}>
        <TouchableOpacity
          style={authStyles.button}
          onPress={() => router.push("/login")}
        >
          <Text style={authStyles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[authStyles.button, authStyles.registerButton]}
          onPress={() => router.push("/register")}
        >
          <Text style={authStyles.buttonText}>Register</Text>
        </TouchableOpacity>

        <GoogleSignInButton onPress={handleGoogleSignIn} disabled={isLoading} />
      </View>
    </View>
  );
};

export default LandingScreen;
