import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { deletePlayer } from "@/services/appwrite";

type ConfirmFormProps = {
  id: string;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: (id: string) => void;
};

const ConfirmForm: React.FC<ConfirmFormProps> = (data: ConfirmFormProps) => {
  return (
    <View className="bg-white p-6 rounded-2xl w-4/5">
      <View className="flex-row justify-between mt-4">
        <TouchableOpacity
          onPress={() => data.setModalVisible(false)}
          className="px-4 py-2 rounded-lg bg-gray-200"
        >
          <Text className="text-gray-700">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => data.onConfirm(data.id)}
          className="px-4 py-2 rounded-lg bg-blue-500"
        >
          <Text className="text-white font-bold">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConfirmForm;
