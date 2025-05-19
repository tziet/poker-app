import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { icons } from "@/constants/icons";
import GoBackButton from "@/components/GoBackButton";

const MoneySummary = () => {
  return (
    <View className="flex-1 bg-primary">
      <Image
        source={icons.logo}
        className="w-12 h-10 mt-20 mb-5 mx-auto self-center"
        resizeMode="contain"
        tintColor="white"
      />
      <Text className="text-white text-center text-xl font-bold">Hello</Text>

      <GoBackButton />
    </View>
  );
};

export default MoneySummary;
