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
import { deletePlayer, getPlayerDetails } from "@/services/appwrite";
import GoBackButton from "@/components/GoBackButton";
import CreatePlayerForm from "@/components/modals/CreatePlayerForm";
import ConfirmForm from "@/components/modals/ConfirmForm";

interface PlayerInfoProps {
  label: string;
  value?: string | number | null;
  isEditable?: boolean;
}

const PlayerInfo = ({ label, value, isEditable }: PlayerInfoProps) => {
  return (
    <View className="flex-col items-start justify-center mt-5">
      <Text className="text-white font-bold text-xl underline">{label}</Text>
      <Text className="text-white font-normal text-xl mt-1">
        {value || "N/A"}
      </Text>
      {isEditable && (
        <TouchableOpacity
          className="left-0 right-0 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center "
          // onPress={router.back}
        >
          <Image
            source={icons.edit}
            className="size-5 mr-1 mt-0.5 rotate-180"
            tintColor="#fff"
          />
          <Text className="text-black font-semibold text-base">Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const Details = () => {
  const { id } = useLocalSearchParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  let playerId: string = "";
  if (id) {
    playerId = Array.isArray(id) ? id[0] : id;
  }

  const handleDeletePlayer = async (id: string) => {
    try {
      await deletePlayer(id);
      router.back();
      alert("Player has been deleted");
    } catch (err) {
      console.error("Error deleting player:", err);
      alert("Error deleting player");
    }
  };

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      const details = await getPlayerDetails(playerId);
      if (details && details.length > 0) {
        setPlayer(details[0]);
      } else {
        console.warn("No player found for this ID:", playerId);
      }
    };

    fetchPlayerDetails();
  }, [id]);

  return (
    <View className="flex-1 bg-primary">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={icons.user}
            tintColor="white"
            className="w-12 h-10 mt-20 mb-5 mx-auto"
            resizeMode="contain"
          />
        </View>
        <View className="flex-col items-start justify-center mt-5 px-5">
          <PlayerInfo label="Name" value={player?.name} isEditable={true} />
          <PlayerInfo label="Chips" value={player?.chips} isEditable={true} />
          <PlayerInfo
            label="Seat"
            value={player?.seat != null ? player.seat + 1 : "N/A"}
          />
        </View>
        <TouchableOpacity
          className="left-0 right-0 bg-red-900 rounded-lg py-3.5 flex flex-row items-center justify-center mt-20"
          onPress={() => setModalVisible(true)}
        >
          <Image
            source={icons.removeUser}
            tintColor="white"
            className="w-12 h-10 mt-20 mb-5 mx-auto"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </ScrollView>

      <GoBackButton />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/60">
          <ConfirmForm id={playerId} setModalVisible={setModalVisible} />
        </View>
      </Modal>
    </View>
  );
};

export default Details;

const styles = StyleSheet.create({});
