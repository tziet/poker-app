import React, { useState } from "react";
import { View, Text } from "react-native";
import ButtonRow from "@/app/components/ui/ButtonRow";
import SeatCountStepper from "@/app/components/inputs/SeatCountStepper";
import { DEFAULT_SEATS } from "@/utils/seatLayout";

type Props = {
  onClose: () => void;
  onSubmit: (seatCount: number) => void;
};

const NewSessionForm = ({ onClose, onSubmit }: Props) => {
  const [seatCount, setSeatCount] = useState(DEFAULT_SEATS);

  return (
    <View className="bg-white p-5 rounded-2xl w-4/5">
      <Text className="text-xl font-bold mb-4 text-center">New Session</Text>
      <SeatCountStepper value={seatCount} onChange={setSeatCount} />
      <ButtonRow
        onCancel={onClose}
        onSubmit={() => onSubmit(seatCount)}
        submitText="Create Session"
      />
    </View>
  );
};

export default NewSessionForm;
