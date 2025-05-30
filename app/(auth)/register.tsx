import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { signUpWithEmailPassword } from "@/services/auth";
import { authStyles } from "@/styles/auth.styles";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (isLoading) return;

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmailPassword(email, password);
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

      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={authStyles.input}
        placeholderTextColor="#666"
        selectionColor="white"
      />

      <View style={authStyles.buttonContainer}>
        <TouchableOpacity
          disabled={isLoading}
          style={authStyles.button}
          onPress={handleRegister}
        >
          <Text style={authStyles.buttonText}>
            {isLoading ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={authStyles.button}
          onPress={() => router.back()}
        >
          <Text style={authStyles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={authStyles.footer}>
        <Text style={authStyles.text}>Already have an account? </Text>
        <Link href="/(auth)/login" style={authStyles.link}>
          Login
        </Link>
      </View>
    </View>
  );
};

export default RegisterScreen;
