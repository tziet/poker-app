import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { icons } from "@/constants/icons";

const Profile = () => {
  return (
    <View className="flex-1 bg-primary">
      <Image
        source={icons.logo}
        className="w-12 h-10 mt-20 mx-auto self-center absolute"
        resizeMode="contain"
        tintColor="white"
      />
    </View>
  );
};

export default Profile;
