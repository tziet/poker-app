import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type ConfirmFormProps = {
  onClose: () => void;
  onSubmit: () => void;
  text?: string;
};

const ConfirmForm: React.FC<ConfirmFormProps> = ({
  onClose,
  onSubmit,
  text,
}: ConfirmFormProps) => {
  return (
    <View className="bg-white p-6 rounded-2xl w-4/5">
      <Text className="text-gray-700">{text ? text : "Are you sure?"}</Text>

      <View className="flex-row justify-between mt-4">
        <TouchableOpacity
          onPress={onClose}
          className="px-4 py-2 rounded-lg bg-gray-200"
        >
          <Text className="text-gray-700">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSubmit}
          className="px-4 py-2 rounded-lg bg-blue-500"
        >
          <Text className="text-white font-bold">Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConfirmForm;
