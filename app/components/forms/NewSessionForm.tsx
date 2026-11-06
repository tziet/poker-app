import React, { useState } from "react";
import { View, Text } from "react-native";
import ButtonRow from "@/app/components/ui/ButtonRow";
import SeatCountStepper from "@/app/components/inputs/SeatCountStepper";
import ChipRateInput from "@/app/components/inputs/ChipRateInput";
import EntryUnitToggle from "@/app/components/inputs/EntryUnitToggle";
import { DEFAULT_SEATS } from "@/utils/seatLayout";
import {
  DEFAULT_CHIP_RATE,
  DEFAULT_ENTRY_UNIT,
  EntryUnit,
  parseChipRate,
  showsMoney,
} from "@/utils/money";
import type { SessionSettings } from "@/app/components/forms/SessionSettingsForm";

type Props = {
  onClose: () => void;
  onSubmit: (settings: SessionSettings) => void;
};

const NewSessionForm = ({ onClose, onSubmit }: Props) => {
  const [seatCount, setSeatCount] = useState(DEFAULT_SEATS);
  const [chipRateText, setChipRateText] = useState(String(DEFAULT_CHIP_RATE));
  const [entryUnit, setEntryUnit] = useState<EntryUnit>(DEFAULT_ENTRY_UNIT);
  const chipRate = parseChipRate(chipRateText);

  return (
    <View className="bg-white p-5 rounded-2xl w-4/5">
      <Text className="text-xl font-bold mb-4 text-center">New Session</Text>
      <SeatCountStepper value={seatCount} onChange={setSeatCount} />
      <ChipRateInput value={chipRateText} onChangeText={setChipRateText} />
      {chipRate !== null && showsMoney(chipRate) && (
        <EntryUnitToggle value={entryUnit} onChange={setEntryUnit} />
      )}
      <ButtonRow
        onCancel={onClose}
        onSubmit={() =>
          chipRate !== null && onSubmit({ seatCount, chipRate, entryUnit })
        }
        submitText="Create Session"
        submitDisabled={chipRate === null}
      />
    </View>
  );
};

export default NewSessionForm;
