import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import TextInputField from "@/app/components/inputs/TextInputField";
import ButtonRow from "@/app/components/ui/ButtonRow";
import { getPlayerDetails } from "@/services/firebase";

interface EditFormProps {
  id: string;
  onClose: () => void;
  onSubmit: (name: string, chips: number) => void;
}

const EditAttributeForm = ({ id, onClose, onSubmit }: EditFormProps) => {
  const [name, setName] = useState("");
  const [chips, setChips] = useState("");

  useEffect(() => {
    const loadPlayerDetails = async () => {
      try {
        const details = await getPlayerDetails(id);
        if (details) {
          console.log("Player details loaded:", details);
          setName(details.name);
          setChips(details.chips.toString());
        } else {
          console.warn("No player found for this ID:", id);
        }
      } catch (error) {
        console.error("Failed to load player details:", error);
        alert("Failed to load player details. Please try again.");
      }
    };
    loadPlayerDetails();
  }, [id]);

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
      <TextInputField
        label="Name"
        value={name}
        onChangeText={setName}
        maxLength={10}
      />
      <TextInputField
        label="Buy-In Chips"
        value={chips}
        onChangeText={setChips}
        keyboardType="numeric"
        maxLength={6}
      />
      <ButtonRow onCancel={onClose} onSubmit={handleSubmit} />
    </View>
  );
};

export default EditAttributeForm;
