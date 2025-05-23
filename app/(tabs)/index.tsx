import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Image,
  Modal,
  ViewStyle,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import { images } from "@/constants/images";
import CreatePlayerForm from "@/components/modals/CreatePlayerForm";
import { createPlayer, deletePlayer, getAllPlayers } from "@/firebase";
import { icons } from "@/constants/icons";
import { Link, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import useFetch from "@/services/useFetch";

type NewPlayerButtonProps = {
  onPress: () => void;
  style?: ViewStyle;
};

type UserButtonProps = {
  player: Player;
  id: string;
  style?: ViewStyle;
};

const Table = () => {
  const router = useRouter();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [players, setPlayers] = useState<(Player | null)[]>(
    Array(8).fill(null),
  );
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  // const {
  //   data: users,
  //   loading: usersLoading,
  //   error: usersError,
  // } = useFetch(() => getAllPlayers([Query.orderAsc("seat")]));

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const response = await getAllPlayers();
        setPlayers(response);
      } catch (err) {
        console.error("Error loading players:", err);
      }
    };

    loadPlayers();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadPlayers = async () => {
        try {
          const response = await getAllPlayers();
          setPlayers(response);
        } catch (err) {
          console.error("Error loading players:", err);
        }
      };

      loadPlayers();
    }, []),
  );

  const NewPlayerButton = ({ onPress, style }: NewPlayerButtonProps) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={style}
        className="absolute items-center"
      >
        <Image
          source={icons.plus}
          className="w-6 h-6 text-white"
          resizeMode="contain"
          tintColor="white"
        />
      </TouchableOpacity>
    );
  };

  const UserButton = ({ style, player, id }: UserButtonProps) => {
    return (
      <Link href={`/player/${id}`} asChild>
        <TouchableOpacity style={style} className="absolute items-center">
          <Text className="text-white text-xs mb-1 text-center">
            {player.name}
          </Text>
          <Image
            source={icons.user}
            className="w-6 h-6 text-white"
            resizeMode="contain"
            tintColor="white"
          />
          <Text className="text-white text-xs mb-1 text-center mt-5">
            Chips: {player.chips}
          </Text>
        </TouchableOpacity>
      </Link>
    );
  };

  const MoneyButton = () => {
    return (
      <Link href={`/screens/moneySummary`} asChild>
        <TouchableOpacity className="w-18 h-15 absolute mx-auto ">
          <Image
            source={icons.cash}
            className="w-18 h-15 absolute top-10 mt-20 mx-auto "
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Link>
    );
  };

  const handleCreatePlayer = async (data: NewPlayer) => {
    if (selectedPosition === null) return;

    try {
      const newPlayer = await createPlayer(data);

      const updated = [...players];
      updated[selectedPosition] = newPlayer;
      setPlayers(updated);
      setCreateModalVisible(false);
      setSelectedPosition(null);
    } catch (err) {
      console.error("Error creating player:", err);
      alert("Error saving player");
    }
  };

  return (
    <View className="flex-1 bg-primary relative">
      <Image
        source={icons.logo}
        className="w-12 h-10 absolute mt-20 mx-auto self-center"
        resizeMode="contain"
        tintColor="white"
      />

      <MoneyButton />

      <View className="flex-1 justify-center items-center">
        <Image
          source={images.pTable}
          className="w-64 h-64 z-0 rotate-90"
          resizeMode="contain"
          tintColor="white"
        />
      </View>

      {positions.map((style, i) =>
        !players[i] ? (
          <NewPlayerButton
            key={i}
            onPress={() => {
              setSelectedPosition(i);
              setCreateModalVisible(true);
            }}
            style={style}
          />
        ) : (
          <UserButton
            key={i}
            player={players[i]}
            style={style}
            id={players[i].$id}
          />
        ),
      )}

      <Modal visible={createModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/60">
          <CreatePlayerForm
            onClose={() => setCreateModalVisible(false)}
            onSubmit={handleCreatePlayer}
            selectedSeat={selectedPosition}
          />
        </View>
      </Modal>
    </View>
  );
};

const iconSize = 24;

const centerX = Dimensions.get("window").width / 2; // screen center
const centerY = 450; // move this down to center vertically with the table

const radiusX = 130; // fits the horizontal ellipse shape better
const radiusY = 240; // fits the vertical shape better

const positions: ViewStyle[] = Array.from({ length: 8 }).map((_, i) => {
  const angle = (i * 360) / 8;
  const rad = (angle * Math.PI) / 180;

  const left = centerX + radiusX * Math.cos(rad) - iconSize / 2;
  const top = centerY + radiusY * Math.sin(rad) - iconSize / 2;

  return {
    position: "absolute",
    top,
    left,
  };
});

export default Table;
