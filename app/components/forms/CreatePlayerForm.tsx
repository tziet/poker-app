import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import TextInputField from "@/app/components/inputs/TextInputField";
import ButtonRow from "@/app/components/ui/ButtonRow";
import EntryUnitToggle from "@/app/components/inputs/EntryUnitToggle";
import {
  EntryUnit,
  convertEntryText,
  entryHint,
  entryLabel,
  entryToChips,
  parseAmount,
  showsMoney,
} from "@/utils/money";

type Props = {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    chips: number;
    endgameChips: number;
    seat: number | null;
  }) => void;
  selectedSeat: number | null;
  /** Session chip rate; when not 1:1 the other unit is shown under the input. */
  chipRate?: number;
  /** Starting unit for the buy-in (the session's choice); the user can switch it. */
  entryUnit?: EntryUnit;
};

const CreatePlayerForm = ({
  onClose,
  onSubmit,
  selectedSeat,
  chipRate,
  entryUnit: initialUnit = "chips",
}: Props) => {
  const [name, setName] = useState("");
  const [chips, setChips] = useState("");
  const [entryUnit, setEntryUnit] = useState<EntryUnit>(initialUnit);

  const switchUnit = (unit: EntryUnit) => {
    setChips((text) => convertEntryText(text, chipRate, entryUnit, unit));
    setEntryUnit(unit);
  };

  const handleSubmit = () => {
    const amount = parseAmount(chips);
    if (name.trim() && amount !== null) {
      const chipsNumber = entryToChips(amount, chipRate, entryUnit);
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
      {showsMoney(chipRate) && (
        <EntryUnitToggle
          compact
          label="Enter buy-in in"
          value={entryUnit}
          onChange={switchUnit}
        />
      )}
      <TextInputField
        label={entryLabel("Buy-In", entryUnit)}
        value={chips}
        onChangeText={setChips}
        keyboardType={entryUnit === "money" ? "decimal-pad" : "numeric"}
        maxLength={entryUnit === "money" ? 8 : 6}
        placeholder="e.g. 100"
        hint={entryHint(chips, chipRate, entryUnit)}
      />
      <ButtonRow onCancel={onClose} onSubmit={handleSubmit} />
    </View>
  );
};

export default CreatePlayerForm;
