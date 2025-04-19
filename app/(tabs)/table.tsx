import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { images } from "@/constants/images";

const Table = () => {
  return (
    <View className="flex-1 bg-primary justify-center items-center">
      <Image
        source={images.pTable}
        className="z-0 rotate-90"
        resizeMode="contain"
        tintColor="white"
      />
    </View>
  );
};

export default Table;
