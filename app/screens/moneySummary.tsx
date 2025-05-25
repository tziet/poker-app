import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getActiveSession,
  getAllPlayers,
  getTableMoneySum,
} from "@/app/services/firebase";
import { icons } from "@/app/constants/icons";
import GoBackButton from "@/app/components/GoBackButton";

const MoneySummary = () => {
  // Explicitly define the state shape
  type MoneySummaryState = {
    session: Session | null;
    moneySum: number;
    players: (Player | null)[];
    currentChips: { [id: string]: number };
    debts: { lender: string; borrower: string; amount: number }[];
  };

  const [state, setState] = useState<MoneySummaryState>({
    session: null,
    moneySum: 0,
    players: Array<Player | null>(8).fill(null),
    currentChips: {},
    debts: [],
  });

  const loadSession = useCallback(async () => {
    try {
      const session = await getActiveSession();
      if (session) {
        console.log("Active session loaded:", session);
        fetchTableData(session);
        // Update the state with the session
        setState((prev) => ({
          ...prev,
          session,
        }));
      } else {
        console.warn("No active session found.");
      }
    } catch (err) {
      console.error("Error loading session:", err);
    }
  }, []);

  const fetchTableData = async (session: Session) => {
    try {
      const [moneySum, players] = await Promise.all([
        getTableMoneySum(session),
        getAllPlayers(session.$id) as Promise<Player[]>,
      ]);

      console.log("Money and players loaded:", { moneySum, players });

      const initialChips = players.reduce(
        (acc, player) => {
          if (player) acc[player.$id] = player.chips;
          return acc;
        },
        {} as { [id: string]: number },
      );

      // Update state with fetched players and table data
      setState((prev) => ({
        ...prev, // Ensures other fields like `debts` and `session` are preserved
        moneySum: moneySum, // Explicitly assigning the value
        players: players as (Player | null)[], // Type assertion ensures compatibility
        currentChips: { ...initialChips }, // Properly typed object for currentChips
      }));
    } catch (err) {
      console.error("Error fetching table data:", err);
    }
  };

  const calculateTransactions = useCallback(() => {
    const { players, currentChips } = state;
    const playersWithAmounts = players
      .filter((player): player is Player => player !== null)
      .map((player) => ({
        playerName: player.name,
        netChange: currentChips[player.$id] - player.chips,
        id: player.$id,
      }));

    const lenders = playersWithAmounts.filter((p) => p.netChange > 0);
    const borrowers = playersWithAmounts.filter((p) => p.netChange < 0);

    const transactions: { lender: string; borrower: string; amount: number }[] =
      [];
    let i = 0,
      j = 0;

    while (i < lenders.length && j < borrowers.length) {
      const amount = Math.min(
        lenders[i].netChange,
        Math.abs(borrowers[j].netChange),
      );

      transactions.push({
        lender: lenders[i].playerName,
        borrower: borrowers[j].playerName,
        amount,
      });

      lenders[i].netChange -= amount;
      borrowers[j].netChange += amount;

      if (lenders[i].netChange === 0) i++;
      if (borrowers[j].netChange === 0) j++;
    }

    return transactions;
  }, [state.players, state.currentChips]);

  useEffect(() => {
    const debts = calculateTransactions();
    // Update state with calculated debts
    setState((prev) => ({
      ...prev,
      debts,
    }));
  }, [state.currentChips, state.players, calculateTransactions]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleCurrentChipsChange = (id: string, value: string) => {
    const parsedValue = parseInt(value, 10) || 0;
    setState((prev) => ({
      ...prev,
      currentChips: {
        ...prev.currentChips,
        [id]: parsedValue,
      },
    }));
  };

  const { moneySum, players, debts } = state;

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
          <Text className="text-white text-lg font-bold">Current Chips</Text>
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
                    Starting Chips: {player.chips}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <TextInput
                    className="rounded px-2 text-white bg-dark-200"
                    keyboardType="numeric"
                    value={state.currentChips[player.$id]?.toString() || ""}
                    onChangeText={(value) =>
                      handleCurrentChipsChange(player.$id, value)
                    }
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
      </ScrollView>

      <GoBackButton />
    </View>
  );
};

export default MoneySummary;
