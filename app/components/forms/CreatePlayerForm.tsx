import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import TextInputField from "@/app/components/inputs/TextInputField";
import ButtonRow from "@/app/components/ui/ButtonRow";

type Props = {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    chips: number;
    endgameChips: number;
    seat: number | null;
  }) => void;
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
        endgameChips: chipsNumber,
        seat: selectedSeat,
      }); // ✨ pass clean data to parent
      setName("");
      setChips("");
    } else {
      alert("Please fill out all fields correctly.");
    }
  };

  return (
    <View className="bg-white p-5 rounded-2xl w-4/5">
      <Text className="text-xl font-bold mb-4 text-center">
        Create New Player
      </Text>
      <TextInputField
        label="Name"
        value={name}
        onChangeText={setName}
        maxLength={10}
        placeholder="e.g. Namer Hakesef"
      />
      <TextInputField
        label="Buy-In Chips"
        value={chips}
        onChangeText={setChips}
        keyboardType="numeric"
        maxLength={6}
        placeholder="e.g. 100"
      />
      <ButtonRow onCancel={onClose} onSubmit={handleSubmit} />
    </View>
  );
};

export default CreatePlayerForm;
