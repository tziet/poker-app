import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CURRENCY, EntryUnit } from "@/utils/money";

type EntryUnitToggleProps = {
  value: EntryUnit;
  onChange: (unit: EntryUnit) => void;
  label?: string;
  /** Tighter spacing for use inside a form, right above the amount input. */
  compact?: boolean;
};

const OPTIONS: { unit: EntryUnit; label: string }[] = [
  { unit: "money", label: `Money (${CURRENCY})` },
  { unit: "chips", label: "Chips" },
];

/** Segmented control: whether amounts are typed in money or chips. */
const EntryUnitToggle = ({
  value,
  onChange,
  label = "Enter amounts in",
  compact = false,
}: EntryUnitToggleProps) => (
  <View className={compact ? "mb-3" : "mt-4"}>
    <Text
      className={`text-sm text-gray-700 mb-2 ${compact ? "" : "text-center"}`}
    >
      {label}
    </Text>
    <View className="flex-row bg-gray-100 rounded-lg p-1">
      {OPTIONS.map(({ unit, label }) => {
        const selected = value === unit;
        return (
          <TouchableOpacity
            key={unit}
            onPress={() => onChange(unit)}
            style={{ flex: 1 }}
            className={`py-2 rounded-md items-center ${selected ? "bg-blue-500" : ""}`}
          >
            <Text
              className={selected ? "text-white font-bold" : "text-gray-700"}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

export default EntryUnitToggle;
