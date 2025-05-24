import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

type ButtonRowProps = {
  onCancel: () => void;
  onSubmit: () => void;
};

const ButtonRow = ({ onCancel, onSubmit }: ButtonRowProps) => (
  <View className="flex-row justify-between mt-4">
    <TouchableOpacity
      onPress={onCancel}
      className="px-4 py-2 bg-gray-200 rounded-lg"
    >
      <Text className="text-gray-700">Cancel</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={onSubmit}
      className="px-4 py-2 bg-blue-500 rounded-lg"
    >
      <Text className="text-white font-bold">Confirm</Text>
    </TouchableOpacity>
  </View>
);

export default ButtonRow;