import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { icons } from "@/constants/icons";
import GoBackButton from "@/app/components/ui/GoBackButton";
import { useMoneySummary } from "@/hooks/useMoneySummary";

const MoneySummary = () => {
  const {
    moneySum,
    players,
    debts,
    loading,
    error,
    handleEndgameChipsChange,
    handleSaveChips,
  } = useMoneySummary();

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-primary justify-center items-center px-4">
        <Text className="text-red-500 text-center">
          {error.message || "An error occurred while loading the data"}
        </Text>
        <GoBackButton />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      >
        <Image
          source={icons.cash}
          className="w-12 h-10 mt-20 mx-auto self-center z-50"
          resizeMode="contain"
        />
        <Text className="text-white text-center text-xl font-bold">
          Money at the table: {moneySum}
        </Text>

        <View className="flex-row items-center justify-between mt-3 bg-secondary p-4 rounded">
          <Text className="text-white text-lg font-bold">Players</Text>
          <Text className="text-white text-lg font-bold">Updated Chips</Text>
        </View>

        {players.map(
          (player) =>
            player && (
              <View
                key={player.$id}
                className="flex-row items-center justify-between mt-3 bg-secondary p-4 rounded"
              >
                <View>
                  <Text className="text-white text-base">{player.name}</Text>
                  <Text className="text-white text-sm">
                    Buy-In Chips: {player.chips}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <TextInput
                    className="rounded px-2 text-white bg-dark-200"
                    keyboardType="numeric"
                    value={player.endgameChips?.toString() || ""}
                    onChangeText={(value) =>
                      handleEndgameChipsChange(player.$id, value)
                    }
                    maxLength={6}
                  />
                </View>
              </View>
            ),
        )}

        <View className="mt-5">
          <Text className="text-white text-lg font-bold text-center">
            Transactions Summary
          </Text>

          {debts.length > 0 ? (
            debts.map((debt, index) => (
              <View
                key={index}
                className="flex-row justify-between bg-secondary p-3 rounded mt-2"
              >
                <View className="flex-row items-center">
                  <Text className="text-red-500">{debt.borrower}</Text>
                  <Ionicons
                    name="arrow-forward-outline"
                    size={20}
                    color="white"
                    style={{ marginHorizontal: 8 }}
                  />
                  <Text className="text-green-500">{debt.lender}</Text>
                </View>
                <Text className="text-white font-bold">₪{debt.amount}</Text>
              </View>
            ))
          ) : (
            <Text className="text-center text-white">
              No transactions to show
            </Text>
          )}
        </View>

        <TouchableOpacity
          className="bg-blue-500 rounded-lg p-4 mt-6 mx-4"
          onPress={handleSaveChips}
        >
          <Text className="text-white text-center text-lg font-bold">Save</Text>
        </TouchableOpacity>
        <GoBackButton />
      </ScrollView>
    </View>
  );
};

export default MoneySummary;
