import React from "react";
import { View, Text, Image, TextInput, Button } from "react-native";
import { icons } from "@/constants/icons";

interface Props {
  placeholder: string;
  onPress: () => void;
}

const SearchBar = ({ placeholder, onPress }: Props) => {
  return (
    <View className="flex-row items-center bg-dark-200 rounded-full px-5 py-4">
      <Image
        source={icons.search}
        className="size-5"
        resizeMode="contain"
        tintColor="white"
      />
      <TextInput
        onPress={onPress}
        placeholder={placeholder}
        value=""
        onChangeText={() => {}}
        placeholderTextColor="white"
        className="flex-1 ml-2 text-white"
      />
      {/*<Button onPress={onPress} title="New Game" />*/}
    </View>
  );
};

export default SearchBar;
