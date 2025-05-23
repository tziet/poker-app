import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import GoBackButton from "@/components/GoBackButton";
import ConfirmForm from "@/components/modals/ConfirmForm";
import EditAttributeForm from "@/components/modals/EditAttributeForm";
import { deletePlayer, getPlayerDetails, updatePlayer } from "@/firebase";
import { icons } from "@/constants/icons";

const PlayerDetails = () => {
  const { id } = useLocalSearchParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const playerId = typeof id === "string" ? id : id?.[0] || "";

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      const details = await getPlayerDetails(playerId);
      if (details) {
        setPlayer(details);
      }
    };
    fetchPlayerDetails();
  }, [id]);

  const handleDeletePlayer = async () => {
    try {
      await deletePlayer(playerId);
      router.back();
      setConfirmModalVisible(false);
      alert(`Player ${player?.name} has been deleted.`);
    } catch (err) {
      console.error("Error deleting player:", err);
      alert("Error deleting player!");
    }
  };

  const handleEditPlayer = async (
    updatedName: string,
    updatedChips: number,
  ) => {
    const updatedPlayer = {
      ...player,
      name: updatedName,
      chips: updatedChips,
      $id: player!.$id,
      seat: player?.seat ?? null,
    };

    try {
      await updatePlayer(playerId, updatedPlayer);
      setPlayer(updatedPlayer);
      setEditModalVisible(false);
      alert(`Player ${player?.name} updated successfully.`);
    } catch (err) {
      console.error("Error updating player:", err);
      alert("Failed to update player.");
    }
  };

  return (
    <View className="flex-1 bg-primary">
      {/* Header and Icon */}
      <View className="items-center mt-10">
        <Image
          source={icons.user}
          className="w-16 h-16"
          resizeMode="contain"
          tintColor="#fff"
        />
        <Text className="text-white text-2xl font-bold mt-2">
          {player?.name || "Player Details"}
        </Text>
      </View>

      {/* Player Info Section */}
      <View className="px-5 py-4 mt-10">
        <PlayerInfo
          label="Name"
          value={player?.name}
          onEdit={() => setEditModalVisible(true)}
        />
        <PlayerInfo
          label="Chips"
          value={player?.chips?.toString()}
          onEdit={() => setEditModalVisible(true)}
        />
        <PlayerInfo
          label="Seat"
          value={player?.seat != null ? (player.seat + 1).toString() : "N/A"}
        />
      </View>

      {/* Actions */}
      <View className="mt-8 px-5">
        <TouchableOpacity
          className="bg-orange-500 rounded-lg py-3 mb-4 flex-row items-center justify-center"
          onPress={() => setEditModalVisible(true)}
        >
          <Image
            source={icons.edit}
            className="w-5 h-5 mr-1"
            tintColor="#fff"
          />
          <Text className="text-white font-semibold text-lg">Edit Player</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-900 rounded-lg py-3 mb-6 flex-row items-center justify-center"
          onPress={() => setConfirmModalVisible(true)}
        >
          <Image
            source={icons.removeUser}
            className="w-6 h-6 mr-2"
            tintColor="#fff"
          />
          <Text className="text-white font-bold text-lg">Delete Player</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <Modal visible={confirmModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black/70">
          <ConfirmForm
            setModalVisible={setConfirmModalVisible}
            onConfirm={handleDeletePlayer}
          />
        </View>
      </Modal>

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black/70">
          <EditAttributeForm
            id={playerId}
            onClose={() => setEditModalVisible(false)}
            onSubmit={handleEditPlayer}
          />
        </View>
      </Modal>

      <GoBackButton />
    </View>
  );
};

const PlayerInfo = ({
  label,
  value,
  onEdit,
}: {
  label: string;
  value?: string;
  onEdit?: () => void;
}) => (
  <View className="bg-gray-800 rounded-lg p-4 mb-4 shadow-lg">
    <Text className="text-white font-semibold text-lg mb-1">{label}</Text>
    <Text className="text-white text-base">{value || "N/A"}</Text>
    {onEdit && (
      <TouchableOpacity
        onPress={onEdit}
        className="bg-blue-500 px-3 py-2 rounded-md mt-2 self-start"
      >
        <Text className="text-white text-sm">Edit</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default PlayerDetails;
