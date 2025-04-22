import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

type Props = {
  onClose: () => void;
  onSubmit: (data: NewPlayer) => void;
  selectedSeat: number | null;
};

const CreatePlayerForm = ({ onClose, onSubmit, selectedSeat }: Props) => {
  const [name, setName] = useState("");
  const [chips, setChips] = useState("");

  const handleSubmit = () => {
    const chipsNumber = parseInt(chips, 10);
    if (name.trim() && !isNaN(chipsNumber)) {
      onSubmit({
        name,
        chips: chipsNumber,
        seat: selectedSeat,
      }); // ✨ pass clean data to parent
      setName("");
      setChips("");
    } else {
      alert("Please fill out all fields correctly.");
    }
  };

  return (
    <View className="bg-white p-6 rounded-2xl w-4/5">
      <Text className="text-xl font-bold mb-4 text-center">
        Create New Player
      </Text>

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
          onPress={handleSubmit}
          className="px-4 py-2 rounded-lg bg-blue-500"
        >
          <Text className="text-white font-bold">Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreatePlayerForm;
