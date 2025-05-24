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
import {
  createPlayer,
  getAllPlayers,
  createSession,
  getActiveSession,
  updateSession,
} from "@/firebase";
import { icons } from "@/constants/icons";
import { Link } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import ConfirmForm from "@/components/modals/ConfirmForm";
import { useSessionContext } from "@/contexts/SessionContext";

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
  const { reloadSessions } = useSessionContext();

  const [createPlayerModalVisible, setCreatePlayerModalVisible] =
    useState(false);
  const [
    createSessionConfirmModalVisible,
    setCreateSessionConfirmModalVisible,
  ] = useState(false);
  const [
    archiveSessionConfirmModalVisible,
    setArchiveSessionConfirmModalVisible,
  ] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<(Player | null)[]>(
    Array(8).fill(null),
  );
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      console.log("Checking for an active session...");

      try {
        const response = await getActiveSession();
        if (response) {
          console.log("Active session loaded:", response);
          setSession(response);
        } else {
          console.warn("No active session found.");
          setSession(null);
        }
      } catch (err) {
        console.error("Error loading session:", err);
        setSession(null); // Ensure session is reset on error
      }
    };

    loadSession();
  }, []);

  useEffect(() => {
    if (session?.$id) {
      const loadPlayers = async () => {
        console.log("Checking for an active players...");

        try {
          const response = await getAllPlayers(session.$id);
          setPlayers(response);
        } catch (err) {
          console.error("Error loading players:", err);
        }
      };

      loadPlayers();
    } else {
      console.warn("No session ID available to fetch players.");
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      if (session?.$id) {
        const loadPlayers = async () => {
          console.log("Checking for an active players - useFocusEffect...");

          try {
            const response = await getAllPlayers(session.$id);
            setPlayers(response);
          } catch (err) {
            console.error("Error loading players:", err);
          }
        };

        loadPlayers();
      } else {
        console.warn("No session ID available to fetch players.");
      }
    }, [session]),
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
        <TouchableOpacity className="w-18 h-15 absolute top-10 left-5 m-4 mt-20">
          <Image source={icons.cash} resizeMode="contain" />
        </TouchableOpacity>
      </Link>
    );
  };

  const ArchviceButton = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          setArchiveSessionConfirmModalVisible(true);
        }}
        className="w-18 h-15 absolute top-10 right-5 m-4 mt-20"
      >
        <Image source={icons.sessions} resizeMode="contain" tintColor="white" />
      </TouchableOpacity>
    );
  };

  const handleCreatePlayer = async (data: {
    name: string;
    chips: number;
    seat: number | null;
  }) => {
    if (!session?.$id) {
      console.error("Cannot create player: No active session.");
      alert("Please create or load an active session first.");
      return;
    }

    if (selectedPosition === null) return;

    try {
      const newPlayer = await createPlayer({
        ...data,
        sessionId: session.$id, // Safely use session.$id since it's checked above
      });

      const updated = [...players];
      updated[selectedPosition] = newPlayer;
      setPlayers(updated);
      setCreatePlayerModalVisible(false);
      setSelectedPosition(null);
    } catch (err) {
      console.error("Error creating player:", err);
      alert("Error saving player");
    }
  };

  const handleCreateSession = async () => {
    try {
      const newSession = await createSession({
        date: new Date(),
        isActive: true,
      });
      setCreateSessionConfirmModalVisible(false);
      setSession(newSession);
      reloadSessions(); // Trigger reloadSessions to update the sessions list
    } catch (err) {
      console.error("Error creating session:", err);
      alert("Error creating session");
    }
  };

  const handleArchiveSession = async () => {
    if (!session || !session.$id) {
      console.error(
        "Cannot archive session: Session or session ID is undefined.",
      );
      alert("No active session to archive. Please load or create a session.");
      return;
    }

    const updatedSession = {
      $id: session.$id,
      date: session.date,
      isActive: false,
    };

    try {
      await updateSession(session.$id, updatedSession);
      setSession(null);
      setArchiveSessionConfirmModalVisible(false);
      alert(`Session archived successfully.`);
    } catch (err) {
      console.error("Error archiving session:", err);
      alert("Failed to archive the session.");
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
      <ArchviceButton />

      {session && session.isActive ? (
        <View className="flex-1 justify-center items-center">
          <Image
            source={images.pTable}
            className="w-64 h-64 z-0 rotate-90"
            resizeMode="contain"
            tintColor="white"
          />

          {positions.map((style, i) =>
            !players[i] ? (
              <NewPlayerButton
                key={i}
                onPress={() => {
                  setSelectedPosition(i);
                  setCreatePlayerModalVisible(true);
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
        </View>
      ) : (
        <View className="flex-1 justify-center items-center">
          <NewPlayerButton
            key="newSessionButton"
            onPress={() => {
              setCreateSessionConfirmModalVisible(true);
            }}
          />
        </View>
      )}

      <Modal
        visible={createPlayerModalVisible}
        transparent
        animationType="slide"
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <CreatePlayerForm
            onClose={() => setCreatePlayerModalVisible(false)}
            onSubmit={handleCreatePlayer}
            selectedSeat={selectedPosition}
          />
        </View>
      </Modal>
      <Modal
        visible={createSessionConfirmModalVisible}
        animationType="slide"
        transparent
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <ConfirmForm
            setModalVisible={setCreateSessionConfirmModalVisible}
            onConfirm={handleCreateSession}
          />
        </View>
      </Modal>
      <Modal
        visible={archiveSessionConfirmModalVisible}
        animationType="slide"
        transparent
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <ConfirmForm
            setModalVisible={setArchiveSessionConfirmModalVisible}
            onConfirm={handleArchiveSession}
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
