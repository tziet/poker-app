import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

type TextInputFieldProps = TextInputProps & {
  label: string;
  /** Optional helper line under the input (e.g. the money value of chips). */
  hint?: string;
};

const TextInputField = ({ label, hint, ...props }: TextInputFieldProps) => {
  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-700 mb-1">{label}</Text>
      <TextInput
        {...props}
        className="border border-gray-300 rounded-lg px-3 py-2 text-black"
        placeholderTextColor="#999"
      />
      {hint ? <Text className="text-xs text-gray-500 mt-1">{hint}</Text> : null}
    </View>
  );
};

export default TextInputField;
