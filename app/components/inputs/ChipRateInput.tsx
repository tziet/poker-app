import React from "react";
import { View, Text, TextInput } from "react-native";
import { CURRENCY, parseChipRate } from "@/utils/money";

type ChipRateInputProps = {
  /** Raw text so the user can type decimals freely; parse with parseChipRate. */
  value: string;
  onChangeText: (text: string) => void;
};

const ChipRateInput = ({ value, onChangeText }: ChipRateInputProps) => {
  const invalid = parseChipRate(value) === null;
  return (
    <View className="mt-4">
      <Text className="text-sm text-gray-700 mb-2 text-center">Chip rate</Text>
      <View className="flex-row items-center justify-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          maxLength={8}
          selectTextOnFocus
          className={`border rounded-lg px-3 py-2 text-black text-lg text-center w-24 ${invalid ? "border-red-500" : "border-gray-300"}`}
        />
        <Text className="text-lg text-black ml-2">
          chips = {CURRENCY}1
        </Text>
      </View>
      <Text
        className={`text-xs mt-2 text-center ${invalid ? "text-red-500" : "text-gray-400"}`}
      >
        {invalid
          ? "Enter a number greater than 0"
          : `How many chips are worth ${CURRENCY}1 (1 = chips are money)`}
      </Text>
    </View>
  );
};

export default ChipRateInput;
