import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import ButtonRow from "@/app/components/ui/ButtonRow";
import SeatCountStepper from "@/app/components/inputs/SeatCountStepper";
import ChipRateInput from "@/app/components/inputs/ChipRateInput";
import EntryUnitToggle from "@/app/components/inputs/EntryUnitToggle";
import {
  DEFAULT_ENTRY_UNIT,
  EntryUnit,
  formatChips,
  parseChipRate,
  showsMoney,
} from "@/utils/money";

export type SessionSettings = {
  seatCount: number;
  chipRate: number;
  entryUnit: EntryUnit;
};

type Props = {
  current: SessionSettings;
  seatedPlayers: Player[];
  onClose: () => void;
  onSubmit: (settings: SessionSettings, removedPlayerIds: string[]) => void;
};

const SessionSettingsForm = ({
  current,
  seatedPlayers,
  onClose,
  onSubmit,
}: Props) => {
  const [seatCount, setSeatCount] = useState(current.seatCount);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [chipRateText, setChipRateText] = useState(String(current.chipRate));
  const chipRate = parseChipRate(chipRateText);
  // A 1:1 session effectively uses chips, so when the rate is changed away
  // from 1:1 here, start the switch on money (the default) instead.
  const [entryUnit, setEntryUnit] = useState<EntryUnit>(
    showsMoney(current.chipRate) ? current.entryUnit : DEFAULT_ENTRY_UNIT,
  );
  const showEntryUnit = chipRate !== null && showsMoney(chipRate);

  // Players that must leave because there aren't enough seats for everyone.
  const removeCount = Math.max(0, seatedPlayers.length - seatCount);

  const changeSeatCount = (value: number) => {
    setSeatCount(value);
    const needed = Math.max(0, seatedPlayers.length - value);
    // Keep the earliest picks if the requirement shrinks.
    setSelectedIds((ids) => ids.slice(0, needed));
  };

  const togglePlayer = (id: string) => {
    setSelectedIds((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id);
      if (removeCount === 1) return [id]; // single pick: just swap the selection
      return ids.length < removeCount ? [...ids, id] : ids;
    });
  };

  const unchanged =
    seatCount === current.seatCount &&
    chipRate === current.chipRate &&
    (!showEntryUnit || entryUnit === current.entryUnit);
  const ready = selectedIds.length === removeCount && chipRate !== null;

  return (
    <View className="bg-white p-5 rounded-2xl w-4/5">
      <Text className="text-xl font-bold mb-4 text-center">
        Session Settings
      </Text>
      <SeatCountStepper
        label="Seats at the table"
        value={seatCount}
        onChange={changeSeatCount}
      />

      {removeCount > 0 && (
        <View className="mt-3">
          <Text className="text-sm text-gray-700 font-semibold">
            All seats are taken. Choose {removeCount} player
            {removeCount > 1 ? "s" : ""} to remove ({selectedIds.length}/
            {removeCount}):
          </Text>
          <Text className="text-xs text-red-500 mt-1">
            Removed players are deleted from this session, including their
            buy-in.
          </Text>
          <ScrollView className="mt-2" style={{ maxHeight: 180 }}>
            {seatedPlayers.map((player) => {
              const selected = selectedIds.includes(player.$id);
              return (
                <TouchableOpacity
                  key={player.$id}
                  onPress={() => togglePlayer(player.$id)}
                  className={`flex-row justify-between items-center px-3 py-2 mb-2 rounded-lg border ${selected ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                >
                  <Text
                    className={selected ? "text-red-600 font-bold" : "text-black"}
                  >
                    {player.name}
                  </Text>
                  <Text className="text-gray-500">
                    {formatChips(player.chips, current.chipRate)} chips
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ChipRateInput value={chipRateText} onChangeText={setChipRateText} />
      {showEntryUnit && (
        <EntryUnitToggle value={entryUnit} onChange={setEntryUnit} />
      )}

      <ButtonRow
        onCancel={onClose}
        onSubmit={() =>
          chipRate !== null &&
          onSubmit({ seatCount, chipRate, entryUnit }, selectedIds)
        }
        submitText={removeCount > 0 ? "Remove & Save" : "Save"}
        submitDisabled={unchanged || !ready}
      />
    </View>
  );
};

export default SessionSettingsForm;
