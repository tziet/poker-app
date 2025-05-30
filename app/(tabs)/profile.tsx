import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { icons } from "@/constants/icons";
import { logout, signOutGoogle } from "@/services/auth";
import { useRouter } from "expo-router";

const Profile = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      // The AuthContext will automatically redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOutGoogle();
      // Navigation will be handled automatically by AuthContext
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-primary" style={{ paddingBottom: 100 }}>
      <Image
        source={icons.logo}
        className="w-12 h-10 mt-20 mx-auto self-center absolute"
        resizeMode="contain"
        tintColor="white"
      />

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-900 px-6 py-3 rounded-lg mx-4 mt-auto mb-8"
      >
        <Text className="text-primary text-center font-semibold text-lg">
          Logout
        </Text>
      </TouchableOpacity>
      {/*<TouchableOpacity*/}
      {/*  onPress={handleGoogleSignOut}*/}
      {/*  className="bg-red-900 px-6 py-3 rounded-lg mx-4 mt-auto mb-8"*/}
      {/*>*/}
      {/*  <Text className="text-primary text-center font-semibold text-lg">*/}
      {/*    Sign Out GOOGLE*/}
      {/*  </Text>*/}
      {/*</TouchableOpacity>*/}
    </View>
  );
};

export default Profile;
