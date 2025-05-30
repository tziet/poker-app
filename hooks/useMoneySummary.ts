import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import {
  getActiveSession,
  getAllPlayers,
  getTableMoneySum,
  updatePlayer,
} from "@/services/firebase";

export const useMoneySummary = () => {
  const [state, setState] = useState<{
    session: Session | null;
    moneySum: number;
    players: (Player | null)[];
    debts: { lender: string; borrower: string; amount: number }[];
    loading: boolean;
    error: Error | null;
  }>({
    session: null,
    moneySum: 0,
    players: Array<Player | null>(8).fill(null),
    debts: [],
    loading: true,
    error: null,
  });

  const { user } = useAuth();

  const fetchTableData = async (session: Session) => {
    try {
      const [moneySum, players] = await Promise.all([
        getTableMoneySum(session),
        getAllPlayers(session.$id) as Promise<Player[]>,
      ]);

      setState((prev) => ({
        ...prev,
        moneySum,
        players: players || [],
        loading: false,
        error: null,
      }));
    } catch (err) {
      console.error("Error fetching table data:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error ? err : new Error("Failed to fetch table data"),
      }));
    }
  };

  const loadSession = useCallback(async () => {
    if (!user) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const session = await getActiveSession(user.uid);
      if (session) {
        console.log("Active session loaded:", session);
        setState((prev) => ({
          ...prev,
          session,
        }));
        fetchTableData(session);
      } else {
        console.warn("No active session found.");
        setState((prev) => ({
          ...prev,
          loading: false,
          error: new Error("No active session found"),
        }));
      }
    } catch (err) {
      console.error("Error loading session:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err : new Error("Failed to load session"),
      }));
    }
  }, [user]);

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
    const { players, session } = state;
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
      if (session) fetchTableData(session);
    } catch (error) {
      console.error("Error saving updated chips:", error);
      Alert.alert(
        "Error",
        "Failed to save the updated chips. Please try again.",
      );
    }
  };

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    const debts = calculateTransactions();
    setState((prev) => ({
      ...prev,
      debts,
    }));
  }, [state.players, calculateTransactions]);

  return {
    ...state,
    handleEndgameChipsChange,
    handleSaveChips,
  };
};
