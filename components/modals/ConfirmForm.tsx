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

type ChildComponentProps = {
  id: string;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const ConfirmForm: React.FC<ChildComponentProps> = ({
  id,
  setModalVisible,
}: ChildComponentProps) => {
  const handleDeletePlayer = async ({
    id,
    setModalVisible,
  }: ChildComponentProps) => {
    try {
      await deletePlayer(id);
      router.back();
      alert("Player has been deleted");
      setModalVisible(false);
    } catch (err) {
      console.error("Error deleting player:", err);
      alert("Error deleting player");
    }
  };

  return (
    <View className="bg-white p-6 rounded-2xl w-4/5">
      <View className="flex-row justify-between mt-4">
        <TouchableOpacity
          onPress={() => setModalVisible(false)}
          className="px-4 py-2 rounded-lg bg-gray-200"
        >
          <Text className="text-gray-700">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDeletePlayer({ id, setModalVisible })}
          className="px-4 py-2 rounded-lg bg-blue-500"
        >
          <Text className="text-white font-bold">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConfirmForm;
