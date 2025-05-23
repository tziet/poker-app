import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { getPlayerDetails } from "@/firebase";

type EditFormProps = {
  id: string;
  onClose: () => void;
  onSubmit: (name: string, chips: number) => void;
};

const EditAttributeForm = ({ id, onClose, onSubmit }: EditFormProps) => {
  const [name, setName] = useState("");
  const [chips, setChips] = useState("");

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      const details = await getPlayerDetails(id);
      if (details) {
        setName(details.name);
        setChips(details.chips.toString());
      } else {
        console.warn("No player found for this ID:", id);
      }
    };

    fetchPlayerDetails();
  }, [id]);

  return (
    <View className="bg-white p-6 rounded-2xl w-4/5">
      <Text className="text-xl font-bold mb-4 text-center">Update Player</Text>

      <Text className="text-sm text-gray-700 mb-1">Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Messi"
        className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
      />

      <Text className="text-sm text-gray-700 mb-1">Chips</Text>
      <TextInput
        value={chips}
        onChangeText={setChips}
        placeholder="e.g. 1000"
        keyboardType="numeric"
        className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
      />

      <View className="flex-row justify-between mt-4">
        <TouchableOpacity
          onPress={onClose}
          className="px-4 py-2 rounded-lg bg-gray-200"
        >
          <Text className="text-gray-700">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSubmit(name, parseInt(chips, 10) || 0)}
          className="px-4 py-2 rounded-lg bg-blue-500"
        >
          <Text className="text-white font-bold">Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditAttributeForm;
