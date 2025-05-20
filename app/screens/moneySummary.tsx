import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TextInput } from "react-native";
import { icons } from "@/constants/icons";
import GoBackButton from "@/components/GoBackButton";
import { getAllPlayers, getTableMoneySum } from "@/services/appwrite";
import { Query } from "appwrite";

const MoneySummary = () => {
  const [moneySum, setMoneySum] = useState<number>(0);
  const [players, setPlayers] = useState<(Player | null)[]>(
    Array(8).fill(null),
  );
  const [currentChips, setCurrentChips] = useState<{ [id: string]: number }>(
    {},
  );

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const moneyResponse = await getTableMoneySum();
        setMoneySum(moneyResponse);

        const playersResponse = await getAllPlayers([Query.orderAsc("seat")]);
        setPlayers(playersResponse);

        const initialCurrentChips: { [id: string]: number } = {};
        playersResponse.forEach((player) => {
          if (player) initialCurrentChips[player.$id] = player.chips;
        });

        setCurrentChips(initialCurrentChips);
      } catch (err) {
        console.error("Error loading table data:", err);
      }
    };

    fetchTableData();
  }, []);

  const handleCurrentChipsChange = (id: string, value: string) => {
    const sanitizedValue = parseInt(value, 10) || 0; // Ensure numeric input
    setCurrentChips((prev) => ({
      ...prev,
      [id]: sanitizedValue,
    }));
  };

  return (
    <View className="flex-1 bg-primary">
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
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
          <Text className="text-white text-lg font-bold mt-5">Players</Text>
          <Text className="text-white text-lg font-bold mt-5">
            Current Chips
          </Text>
        </View>

        {players.map(
          (player, index) =>
            player && (
              <View
                key={player.$id}
                className="flex-row items-center justify-between mt-3 bg-secondary p-4 rounded"
              >
                <View>
                  <Text className="text-white text-base">{player.name}</Text>
                  <Text className="text-white text-sm">
                    Starting Chips: {player.chips}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <TextInput
                    style={{
                      backgroundColor: "#333",
                      color: "white",
                      padding: 5,
                      width: 60,
                      textAlign: "center",
                      borderRadius: 4,
                    }}
                    keyboardType="numeric"
                    value={currentChips[player.$id]?.toString() || ""}
                    onChangeText={(value) =>
                      handleCurrentChipsChange(player.$id, value)
                    }
                    placeholder="Chips"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            ),
        )}
      </ScrollView>
      <GoBackButton />
    </View>
  );
};

export default MoneySummary;
