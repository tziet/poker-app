import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import TextInputField from "@/app/components/inputs/TextInputField";
import EntryUnitToggle from "@/app/components/inputs/EntryUnitToggle";
import ButtonRow from "@/app/components/ui/ButtonRow";
import { getPlayerDetails } from "@/services/firebase";
import {
  EntryUnit,
  chipsToEntry,
  convertEntryText,
  entryHint,
  entryLabel,
  entryToChips,
  parseAmount,
  showsMoney,
} from "@/utils/money";

type EditFormProps = {
  id: string;
  /** Session chip rate; when not 1:1 the other unit is shown under the input. */
  chipRate?: number;
  /** Starting unit for the buy-in (the session's choice); the user can switch it. */
  entryUnit?: EntryUnit;
  onClose: () => void;
  onSubmit: (name: string, chips: number) => void;
};

const EditAttributeForm = ({
  id,
  chipRate,
  entryUnit: initialUnit = "chips",
  onClose,
  onSubmit,
}: EditFormProps) => {
  const [name, setName] = useState("");
  const [chips, setChips] = useState("");
  const [entryUnit, setEntryUnit] = useState<EntryUnit>(initialUnit);
  // Chips as loaded, so an untouched amount saves the exact original value
  // (₪33.33 × 3 would otherwise turn 100 chips into 99.99).
  const [loadedChips, setLoadedChips] = useState<number | null>(null);

  useEffect(() => {
    const loadPlayerDetails = async () => {
      try {
        const details = await getPlayerDetails(id);
        if (details) {
          setName(details.name);
          setEntryUnit(initialUnit);
          setChips(String(chipsToEntry(details.chips, chipRate, initialUnit)));
          setLoadedChips(details.chips);
        } else {
          console.warn("No player found for this ID:", id);
        }
      } catch (error) {
        console.error("Failed to load player details:", error);
        alert("Failed to load player details. Please try again.");
      }
    };
    loadPlayerDetails();
  }, [id, chipRate, initialUnit]);

  const switchUnit = (unit: EntryUnit) => {
    setChips((text) => convertEntryText(text, chipRate, entryUnit, unit));
    setEntryUnit(unit);
  };

  const handleSubmit = () => {
    const amount = parseAmount(chips);
    if (name.trim() && amount !== null) {
      const untouched =
        loadedChips !== null &&
        chips === String(chipsToEntry(loadedChips, chipRate, entryUnit));
      onSubmit(
        name,
        untouched
          ? loadedChips
          : entryToChips(amount, chipRate, entryUnit),
      );
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
        hint={entryHint(chips, chipRate, entryUnit)}
      />
      <ButtonRow onCancel={onClose} onSubmit={handleSubmit} />
    </View>
  );
};

export default EditAttributeForm;
