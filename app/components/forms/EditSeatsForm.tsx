import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import ButtonRow from "@/app/components/ui/ButtonRow";
import SeatCountStepper from "@/app/components/inputs/SeatCountStepper";

type Props = {
  currentCount: number;
  seatedPlayers: Player[];
  onClose: () => void;
  onSubmit: (seatCount: number, removedPlayerIds: string[]) => void;
};

const EditSeatsForm = ({
  currentCount,
  seatedPlayers,
  onClose,
  onSubmit,
}: Props) => {
  const [seatCount, setSeatCount] = useState(currentCount);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const unchanged = seatCount === currentCount;
  const ready = selectedIds.length === removeCount;

  return (
    <View className="bg-white p-5 rounded-2xl w-4/5">
      <Text className="text-xl font-bold mb-4 text-center">Table Seats</Text>
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
          <ScrollView className="mt-2" style={{ maxHeight: 220 }}>
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
                  <Text className="text-gray-500">{player.chips} chips</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ButtonRow
        onCancel={onClose}
        onSubmit={() => onSubmit(seatCount, selectedIds)}
        submitText={removeCount > 0 ? "Remove & Save" : "Save"}
        submitDisabled={unchanged || !ready}
      />
    </View>
  );
};

export default EditSeatsForm;
