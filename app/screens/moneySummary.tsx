import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getActiveSession,
  getAllPlayers,
  getTableMoneySum,
  updatePlayer,
} from "@/services/firebase";
import { icons } from "@/constants/icons";
import GoBackButton from "@/app/components/ui/GoBackButton";
import { useAuth } from "@/contexts/AuthContext";
import useActiveSession from "@/hooks/useSession";

type MoneySummaryState = {
  session: Session | null;
  moneySum: number;
  players: (Player | null)[];
  debts: { lender: string; borrower: string; amount: number }[];
};

const MoneySummary = () => {
  const [state, setState] = useState<MoneySummaryState>({
    session: null,
    moneySum: 0,
    players: Array<Player | null>(8).fill(null),
    debts: [],
  });

  const { user } = useAuth();
  const { session, loading, error, refetch } = useActiveSession();

  const loadSession = useCallback(async () => {
    if (!user) return;
    try {
      const session = await getActiveSession(user.uid);
      if (session) {
        console.log("Active session loaded:", session);
        fetchTableData(session);
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

      setState((prev) => ({
        ...prev,
        moneySum,
        players: players || [],
      }));
    } catch (err) {
      console.error("Error fetching table data:", err);
    }
  };

  const calculateTransactions = useCallback(() => {
    const { players } = state;
    const playersWithAmounts = players
      .filter((player): player is Player => player !== null)
      .map((player) => ({
        playerName: player.name,
        netChange: player.endgameChips - player.chips,
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
  }, [state.players]);

  useEffect(() => {
    const debts = calculateTransactions();
    setState((prev) => ({
      ...prev,
      debts,
    }));
  }, [state.players, calculateTransactions]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleEndgameChipsChange = (id: string, value: string) => {
    const parsedValue = parseInt(value, 10) || 0;
    setState((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player && player.$id === id
          ? { ...player, endgameChips: parsedValue }
          : player,
      ),
    }));
  };

  const handleSaveChips = async () => {
    const { players } = state;

    // Filter out null players and those with unchanged `endgameChips`
    const playersToUpdate = players.filter(
      (player) => player && player.endgameChips !== player.chips,
    ) as Player[];

    if (playersToUpdate.length === 0) {
      Alert.alert("No Changes", "No chips were updated.");
      return;
    }

    try {
      for (const player of playersToUpdate) {
        await updatePlayer(player.$id, {
          ...player,
          endgameChips: player.endgameChips,
        });
      }

      Alert.alert("Success", "Updated chips saved successfully.");
      console.log("Updated chips saved:", playersToUpdate);

      // Refresh the table data
      if (state.session) fetchTableData(state.session);
    } catch (error) {
      console.error("Error saving updated chips:", error);
      Alert.alert(
        "Error",
        "Failed to save the updated chips. Please try again.",
      );
    }
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

        {/* Save Button */}
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
