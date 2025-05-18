import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { icons } from "@/constants/icons";
import {
  deletePlayer,
  getPlayerDetails,
  updatePlayer,
} from "@/services/appwrite";
import GoBackButton from "@/components/GoBackButton";
import ConfirmForm from "@/components/modals/ConfirmForm";
import EditAttributeForm from "@/components/modals/EditAttributeForm";
import { showToastWithGravityAndOffset } from "@/components/toasts";

interface PlayerInfoProps {
  label: string;
  value?: string | number | null;
  isEditable?: boolean;
  setModalVisible?: React.Dispatch<React.SetStateAction<boolean>>;
}

const PlayerInfo = ({
  label,
  value,
  isEditable,
  setModalVisible,
}: PlayerInfoProps) => {
  return (
    <View className="flex-col items-start justify-center mt-5">
      <Text className="text-white font-bold text-xl underline">{label}</Text>
      <Text className="text-white font-normal text-xl mt-1">
        {value || "N/A"}
      </Text>
      {/*{isEditable && setModalVisible && (*/}
      {/*  <TouchableOpacity*/}
      {/*    className="left-0 right-0 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center "*/}
      {/*    onPress={() => setModalVisible(true)}*/}
      {/*  >*/}
      {/*    <Image*/}
      {/*      source={icons.edit}*/}
      {/*      className="size-5 mr-1 mt-0.5 rotate-180"*/}
      {/*      tintColor="#fff"*/}
      {/*    />*/}
      {/*    <Text className="text-black font-semibold text-base">Edit</Text>*/}
      {/*  </TouchableOpacity>*/}
      {/*)}*/}
    </View>
  );
};

const Details = () => {
  const { id } = useLocalSearchParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  let playerId: string = "";
  if (id) {
    playerId = Array.isArray(id) ? id[0] : id;
  }

  const handleDeletePlayer = async (id: string) => {
    try {
      await deletePlayer(id);
      router.back();
      alert(`Player ${player?.name} has been deleted.`);
      setConfirmModalVisible(false);
    } catch (err) {
      console.error("Error deleting player:", err);
      alert("Error deleting player");
    }
  };

  const handleEditPlayer = async (name: string, chips: number) => {
    const updatedPlayer = player;
    if (updatedPlayer) {
      updatedPlayer.name = name;
      updatedPlayer.chips = chips;
      setPlayer(updatedPlayer);
    }

    if (updatedPlayer === null) return;
    try {
      await updatePlayer(playerId, updatedPlayer);
      setEditModalVisible(false);
      alert(`Player ${player?.name} has been updated.`);
    } catch (err) {
      console.error("Error updating player:", err);
      alert("Error updating player");
    }
  };

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      const details = await getPlayerDetails(playerId);
      if (details && details.length > 0) {
        setPlayer(details[0]);
      }
    };

    fetchPlayerDetails();
  }, [id, player]);

  return (
    <View className="flex-1 bg-primary">
      <View>
        <Image
          source={icons.user}
          tintColor="white"
          className="w-12 h-10 mt-20 mb-5 mx-auto"
          resizeMode="contain"
        />
      </View>
      <View className="flex-col items-start justify-center mt-5 px-5">
        <PlayerInfo
          label="Name"
          value={player?.name}
          isEditable={true}
          setModalVisible={setEditModalVisible}
        />
        <PlayerInfo
          label="Chips"
          value={player?.chips}
          isEditable={true}
          setModalVisible={setEditModalVisible}
        />
        <PlayerInfo
          label="Seat"
          value={player?.seat != null ? player.seat + 1 : "N/A"}
        />
        <TouchableOpacity
          className="left-0 right-0 bg-orange-500 rounded-lg py-3.5 flex flex-row items-center justify-center "
          onPress={() => setEditModalVisible(true)}
        >
          <Image
            source={icons.edit}
            className="size-5 mr-1 mt-0.5"
            tintColor="#fff"
          />
          <Text className="text-black font-semibold text-base">Edit</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        className="left-0 right-0 bg-red-900 rounded-lg py-3.5 flex flex-row items-center justify-center mt-20"
        onPress={() => setConfirmModalVisible(true)}
      >
        <Text className="text-white font-bold justify-center items-center self-center">
          Delete
        </Text>
        <Image
          source={icons.removeUser}
          tintColor="white"
          className="w-12 h-10 mt-20 mb-5 mx-auto"
          resizeMode="contain"
        />
      </TouchableOpacity>

      <GoBackButton />

      <Modal
        visible={confirmModalVisible || editModalVisible}
        transparent
        animationType="slide"
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          {confirmModalVisible && (
            <ConfirmForm
              id={playerId}
              setModalVisible={setConfirmModalVisible}
              onConfirm={handleDeletePlayer}
            />
          )}
          {editModalVisible && (
            <EditAttributeForm
              id={playerId}
              onClose={() => setEditModalVisible(false)}
              onSubmit={handleEditPlayer}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default Details;

const styles = StyleSheet.create({});
