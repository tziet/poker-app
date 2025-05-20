import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TextInput } from "react-native";
import { icons } from "@/constants/icons";
import GoBackButton from "@/components/GoBackButton";
import { getAllPlayers, getTableMoneySum } from "@/services/appwrite";
import { Query } from "appwrite";
import { Ionicons } from "@expo/vector-icons";

const MoneySummary = () => {
  const [moneySum, setMoneySum] = useState<number>(0);
  const [players, setPlayers] = useState<(Player | null)[]>(
    Array(8).fill(null),
  );
  const [currentChips, setCurrentChips] = useState<{ [id: string]: number }>(
    {},
  );

  const [debts, setDebts] = useState<
    { lender: string; borrower: string; amount: number }[]
  >([]);

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

  useEffect(() => {
    const calculateTransactions = () => {
      const playersWithAmounts = players
        .map((player) => {
          if (player) {
            const netChange = currentChips[player.$id] - player.chips; // Net difference in chips
            return { playerName: player.name, netChange, id: player.$id };
          }
          return null;
        })
        .filter((p) => p !== null) as {
        playerName: string;
        netChange: number;
        id: string;
      }[];

      const lenders = playersWithAmounts.filter((p) => p.netChange > 0); // Players with positive changes
      const borrowers = playersWithAmounts.filter((p) => p.netChange < 0); // Players with negative changes

      const transactions: {
        lender: string;
        borrower: string;
        amount: number;
      }[] = [];

      let i = 0,
        j = 0;

      // Match debts between lenders and borrowers
      while (i < lenders.length && j < borrowers.length) {
        const lender = lenders[i];
        const borrower = borrowers[j];

        const amountToSettle = Math.min(
          lender.netChange,
          Math.abs(borrower.netChange),
        );

        transactions.push({
          lender: lender.playerName,
          borrower: borrower.playerName,
          amount: amountToSettle,
        });

        // Update the amounts
        lenders[i].netChange -= amountToSettle;
        borrowers[j].netChange += amountToSettle;

        // Move on to the next lender or borrower if their balance is settled
        if (lenders[i].netChange === 0) i++;
        if (borrowers[j].netChange === 0) j++;
      }

      return transactions;
    };

    // Calculate and update the debts state
    const transactionDetails = calculateTransactions();
    setDebts(transactionDetails);
  }, [currentChips, players]);

  return (
    <View className="flex-1 bg-primary">
      {/* This container ensures appropriate space allocation */}
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 80, // Add space to avoid overlap with GoBackButton
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
                <Text className="text-lg font-bold text-white">
                  ₪{debt.amount}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-white text-center mt-3">
              No transactions to show.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* GoBackButton is fixed at the bottom */}
      <GoBackButton />
    </View>
  );
};

export default MoneySummary;
