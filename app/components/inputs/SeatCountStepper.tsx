import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MAX_SEATS, MIN_SEATS } from "@/utils/seatLayout";

type SeatCountStepperProps = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
};

const StepButton = ({
  symbol,
  disabled,
  onPress,
}: {
  symbol: string;
  disabled: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`w-11 h-11 rounded-full items-center justify-center ${disabled ? "bg-gray-100" : "bg-blue-500"}`}
  >
    <Text
      className={`text-2xl font-bold ${disabled ? "text-gray-300" : "text-white"}`}
    >
      {symbol}
    </Text>
  </TouchableOpacity>
);

const SeatCountStepper = ({
  label = "Number of players",
  value,
  onChange,
}: SeatCountStepperProps) => (
  <View className="mb-2">
    <Text className="text-sm text-gray-700 mb-2 text-center">{label}</Text>
    <View className="flex-row items-center justify-center">
      <StepButton
        symbol="−"
        disabled={value <= MIN_SEATS}
        onPress={() => onChange(Math.max(MIN_SEATS, value - 1))}
      />
      <Text className="text-3xl font-bold text-black w-16 text-center">
        {value}
      </Text>
      <StepButton
        symbol="+"
        disabled={value >= MAX_SEATS}
        onPress={() => onChange(Math.min(MAX_SEATS, value + 1))}
      />
    </View>
    <Text className="text-xs text-gray-400 mt-2 text-center">
      {MIN_SEATS}–{MAX_SEATS} seats
    </Text>
  </View>
);

export default SeatCountStepper;
