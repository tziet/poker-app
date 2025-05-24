import React, { useState } from "react";
import { View, Text } from "react-native";
import TextInputField from "@/app/components/inputs/TextInputField";
import ButtonRow from "@/app/components/ui/ButtonRow";

interface EditFormProps {
  id: string;
  onClose: () => void;
  onSubmit: (name: string, chips: number) => void;
}

const EditAttributeForm = ({ id, onClose, onSubmit }: EditFormProps) => {
  const [name, setName] = useState("");
  const [chips, setChips] = useState("");

  const handleSubmit = () => {
    if (name.trim() && !isNaN(parseInt(chips))) {
      onSubmit(name, parseInt(chips, 10));
      onClose();
    } else {
      alert("Invalid data");
    }
  };

  return (
    <View className="bg-white p-6 rounded-2xl w-4/5">
      <Text className="text-xl font-bold mb-4 text-center">Update Player</Text>
      <TextInputField label="Name" value={name} onChangeText={setName} />
      <TextInputField
        label="Chips"
        value={chips}
        onChangeText={setChips}
        keyboardType="numeric"
      />
      <ButtonRow onCancel={onClose} onSubmit={handleSubmit} />
    </View>
  );
};

export default EditAttributeForm;
