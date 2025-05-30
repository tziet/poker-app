import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { loginWithEmailPassword } from "@/services/auth";
import { authStyles } from "@/styles/auth.styles";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (isLoading) return;

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmailPassword(email, password);
      // The AuthContext will automatically redirect to main app
    } catch (err: any) {
      setError(err.message);
      Alert.alert("Error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      {error && <Text style={authStyles.error}>{error}</Text>}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={authStyles.input}
        placeholderTextColor="#666"
        selectionColor="white"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={authStyles.input}
        placeholderTextColor="#666"
        selectionColor="white"
      />

      <View style={authStyles.buttonContainer}>
        <TouchableOpacity
          disabled={isLoading}
          style={authStyles.button}
          onPress={handleLogin}
        >
          <Text style={authStyles.buttonText}>
            {isLoading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={authStyles.button}
          onPress={() => router.back()}
        >
          <Text style={authStyles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
