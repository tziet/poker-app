import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

type TextInputFieldProps = TextInputProps & {
  label: string;
};

const TextInputField = ({ label, ...props }: TextInputFieldProps) => {
  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-700 mb-1">{label}</Text>
      <TextInput
        {...props}
        className="border border-gray-300 rounded-lg px-3 py-2 text-black"
        placeholderTextColor="#999"
      />
    </View>
  );
};

export default TextInputField;