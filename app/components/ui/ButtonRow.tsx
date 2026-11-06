import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

type ButtonRowProps = {
  onCancel: () => void;
  onSubmit: () => void;
  submitText?: string;
  submitDisabled?: boolean;
};

const ButtonRow = ({
  onCancel,
  onSubmit,
  submitText = "Confirm",
  submitDisabled = false,
}: ButtonRowProps) => (
  <View className="flex-row justify-between mt-4">
    <TouchableOpacity
      onPress={onCancel}
      className="px-4 py-2 bg-gray-200 rounded-lg"
    >
      <Text className="text-gray-700">Cancel</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={onSubmit}
      disabled={submitDisabled}
      className={`px-4 py-2 rounded-lg ${submitDisabled ? "bg-blue-300" : "bg-blue-500"}`}
    >
      <Text className="text-white font-bold">{submitText}</Text>
    </TouchableOpacity>
  </View>
);

export default ButtonRow;
