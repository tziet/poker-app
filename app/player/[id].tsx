import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import GoBackButton from "@/app/components/GoBackButton";
import ConfirmForm from "@/app/components/modals/ConfirmForm";
import EditAttributeForm from "@/app/components/modals/EditAttributeForm";
import {
  deletePlayer,
  getPlayerDetails,
  updatePlayer,
} from "@/services/firebase";
import { icons } from "@/constants/icons";

const PlayerDetails = () => {
  const { id } = useLocalSearchParams();
  const playerId = typeof id === "string" ? id : id?.[0] || "";

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [modalState, setModalState] = useState({
    editPlayer: false,
    deletePlayer: false,
  });
  const openModal = (type: keyof typeof modalState) =>
    setModalState({ ...modalState, [type]: true });
  const closeModal = (type: keyof typeof modalState) =>
    setModalState({ ...modalState, [type]: false });

  /** Fetch Player Details */

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      try {
        const details = await getPlayerDetails(playerId);
        setPlayer(details ?? null);
      } catch (error) {
        console.error("Failed to fetch player details:", error);
        alert("Error loading player details.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayerDetails();
  }, [playerId]);

  /** Handle Delete */
  const handleDeletePlayer = async () => {
    try {
      if (player) {
        await deletePlayer(playerId);
        alert(`Player ${player.name} has been deleted.`);
        router.back();
      }
    } catch (error) {
      console.error("Error deleting player:", error);
      alert("Failed to delete player.");
    } finally {
      setDeleteModalVisible(false);
    }
  };

  /** Handle Edit */
  const handleEditPlayer = async (
    updatedName: string,
    endgameChips: number,
  ) => {
    try {
      const updatedPlayer = {
        ...player,
        name: updatedName,
        chips: endgameChips,
      } as Player;

      await updatePlayer(playerId, updatedPlayer);
      setPlayer(updatedPlayer);
      alert("Player updated successfully.");
    } catch (error) {
      console.error("Error updating player:", error);
      alert("Failed to update player.");
    } finally {
      setEditModalVisible(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      {/* Header */}
      <View className="items-center mt-10">
        <Image
          source={icons.user}
          className="w-12 h-10 mt-5"
          resizeMode="contain"
          tintColor="#fff"
        />
        <Text className="text-white text-2xl font-bold mt-2">
          {player?.name || "Player Details"}
        </Text>
      </View>

      {/* Player Info */}
      <View className="px-5 py-4 mt-10">
        <PlayerInfo
          label="Name"
          value={player?.name}
          onEdit={() => openModal("editPlayer")}
        />
        <PlayerInfo
          label="Buy-In Chips"
          value={player?.chips?.toString()}
          onEdit={() => openModal("editPlayer")}
        />
        <PlayerInfo
          label="Seat"
          value={player?.seat != null ? (player.seat + 1).toString() : "N/A"}
        />
      </View>

      {/* Buttons */}
      <View className="mt-8 px-5">
        <ActionButton
          onPress={() => openModal("editPlayer")}
          color="orange-500"
          icon={icons.edit}
          text="Edit Player"
        />
        <ActionButton
          onPress={() => openModal("deletePlayer")}
          color="red-900"
          icon={icons.removeUser}
          text="Delete Player"
        />
      </View>

      {/* Modals */}
      <CustomModal visible={modalState.deletePlayer}>
        <ConfirmForm
          onClose={() => closeModal("deletePlayer")}
          onSubmit={handleDeletePlayer}
        />
      </CustomModal>

      <CustomModal visible={modalState.editPlayer}>
        <EditAttributeForm
          id={playerId}
          onClose={() => closeModal("editPlayer")}
          onSubmit={handleEditPlayer}
        />
      </CustomModal>

      <GoBackButton />
    </View>
  );
};

/** Player Info Component */
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
        className="bg-blue-500 px-3 py-2 rounded-md mt-2 self-start"
        onPress={onEdit}
      >
        <Text className="text-white text-sm">Edit</Text>
      </TouchableOpacity>
    )}
  </View>
);

/** Reusable Action Button */
const ActionButton = ({
  onPress,
  color,
  icon,
  text,
}: {
  onPress: () => void;
  color: string;
  icon: any;
  text: string;
}) => (
  <TouchableOpacity
    className={`bg-${color} rounded-lg py-3 mb-4 flex-row items-center justify-center`}
    onPress={onPress}
  >
    <Image source={icon} className="w-5 h-5 mr-1" tintColor="#fff" />
    <Text className="text-white font-semibold text-lg">{text}</Text>
  </TouchableOpacity>
);

/** Reusable Modal Wrapper */
const CustomModal = ({
  visible,
  children,
}: {
  visible: boolean;
  children: React.ReactNode;
}) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View className="flex-1 justify-center items-center bg-black/70">
      <View className="bg-white p-6 rounded-xl w-4/5">{children}</View>
    </View>
  </Modal>
);

export default PlayerDetails;
