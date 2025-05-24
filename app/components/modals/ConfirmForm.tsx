import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { deletePlayer } from "@/app/services/firebase";

type ConfirmFormProps = {
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: () => void;
};

const ConfirmForm: React.FC<ConfirmFormProps> = (data: ConfirmFormProps) => {
  return (
    <View className="bg-white p-6 rounded-2xl w-4/5">
      <Text className="text-gray-700">Are you sure?</Text>

      <View className="flex-row justify-between mt-4">
        <TouchableOpacity
          onPress={() => data.setModalVisible(false)}
          className="px-4 py-2 rounded-lg bg-gray-200"
        >
          <Text className="text-gray-700">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => data.onConfirm()}
          className="px-4 py-2 rounded-lg bg-blue-500"
        >
          <Text className="text-white font-bold">Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConfirmForm;
