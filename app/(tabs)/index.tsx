import React, { useCallback, useState, useEffect, forwardRef } from "react";
import {
  View,
  Image,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Link } from "expo-router";

import { images } from "@/app/constants/images";
import { icons } from "@/app/constants/icons";
import {
  createPlayer,
  getActiveSession,
  getAllPlayers,
  createSession,
  updateSession,
} from "@/app/services/firebase";
import CreatePlayerForm from "@/app/components/modals/CreatePlayerForm";
import ConfirmForm from "@/app/components/modals/ConfirmForm";
import { useSessionContext } from "@/app/contexts/SessionContext";

type ActionButtonProps = {
  onPress: () => void;
  style?: ViewStyle;
  icon: any;
  topText?: string;
  bottomText?: string;
  noTintColor?: boolean;
};

const ActionButton = forwardRef(
  (
    {
      onPress,
      style,
      icon,
      topText,
      bottomText,
      noTintColor,
    }: ActionButtonProps,
    ref: React.Ref<any>,
  ) => (
    <TouchableOpacity
      ref={ref} // forward the ref
      onPress={onPress}
      style={style}
      className="absolute items-center"
    >
      {topText && <Text className="text-white text-sm mb-1">{topText}</Text>}
      <Image
        source={icon}
        className="w-6 h-6 text-white"
        resizeMode="contain"
        tintColor={noTintColor ? undefined : "white"}
      />
      {bottomText && (
        <Text className="text-white mt-2 text-sm">{bottomText}</Text>
      )}
    </TouchableOpacity>
  ),
);

const Table = () => {
  const { reloadSessions } = useSessionContext();

  const [modalState, setModalState] = useState({
    createPlayer: false,
    createSession: false,
    archiveSession: false,
  });

  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<(Player | null)[]>(
    Array(8).fill(null),
  );
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  /** Fetch and Load Session */
  const loadSession = useCallback(async () => {
    try {
      const activeSession = await getActiveSession();
      if (activeSession) {
        setSession(activeSession);
      } else {
        console.warn("No active session found.");
        setSession(null);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      alert("Failed to load session. Please try again.");
    }
  }, []);

  /** Fetch and Load Players */
  const loadPlayers = useCallback(async () => {
    if (!session?.$id) {
      console.warn("Session ID is missing. Cannot fetch players.");
      return;
    }
    try {
      const sessionPlayers = (await getAllPlayers(session.$id)) as Player[];

      // Create an array of 8 seats initialized with null
      const updatedPlayers = Array(positions.length).fill(null);

      // Map players to their respective seat positions (replace `seat` with the correct property)
      sessionPlayers.forEach((player) => {
        if (
          player.seat !== null &&
          player.seat >= 0 &&
          player.seat < positions.length
        ) {
          updatedPlayers[player.seat] = player; // Place player in the correct seat
        }
      });

      setPlayers(updatedPlayers);
    } catch (error) {
      console.error("Failed to load players:", error);
      alert("Unable to load players. Please try again.");
    }
  }, [session]);

  /** Effects for Loading Data */
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (session) loadPlayers();
  }, [session, loadPlayers]);

  useFocusEffect(
    useCallback(() => {
      if (session) loadPlayers();
    }, [session, loadPlayers]),
  );

  /** Create Player */
  const handleCreatePlayer = async (data: {
    name: string;
    chips: number;
    seat: number | null;
  }) => {
    if (!session?.$id || selectedPosition === null) {
      alert(
        "Cannot create the player. Please select a position or create a session.",
      );
      return;
    }
    try {
      const newPlayer = await createPlayer({ ...data, sessionId: session.$id });
      const updatedPlayers = [...players];
      updatedPlayers[selectedPosition] = newPlayer;
      setPlayers(updatedPlayers);
      closeModal("createPlayer");
    } catch (error) {
      console.error("Error creating player:", error);
      alert("Failed to create the player. Please try again.");
    }
  };

  /** Create a New Session */
  const handleCreateSession = async () => {
    try {
      const newSession = await createSession({
        date: new Date(),
        isActive: true,
      });
      setSession(newSession);
      reloadSessions(); // Refresh session list
      closeModal("createSession");
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Could not create session. Try again.");
    }
  };

  /** Archive Current Session */
  const handleArchiveSession = async () => {
    if (!session?.$id) {
      alert("No current session to archive.");
      return;
    }
    try {
      await updateSession(session.$id, { ...session, isActive: false });
      setSession(null);
      reloadSessions();
      closeModal("archiveSession");
      alert("Session successfully archived.");
    } catch (error) {
      console.error("Error archiving session:", error);
      alert("Failed to archive session. Try again.");
    }
  };

  /** Handle Modal Open/Close */
  const openModal = (type: keyof typeof modalState) =>
    setModalState({ ...modalState, [type]: true });
  const closeModal = (type: keyof typeof modalState) =>
    setModalState({ ...modalState, [type]: false });

  /** Modal Renderer */
  const renderModals = () => (
    <>
      {/* Create Player Modal */}
      <Modal
        visible={modalState.createPlayer}
        transparent
        animationType="slide"
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <CreatePlayerForm
            onClose={() => closeModal("createPlayer")}
            onSubmit={handleCreatePlayer}
            selectedSeat={selectedPosition}
          />
        </View>
      </Modal>

      {/* Create Session Modal */}
      <Modal
        visible={modalState.createSession}
        transparent
        animationType="slide"
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <ConfirmForm
            setModalVisible={() => closeModal("createSession")}
            onConfirm={handleCreateSession}
          />
        </View>
      </Modal>

      {/* Archive Session Modal */}
      <Modal
        visible={modalState.archiveSession}
        transparent
        animationType="slide"
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <ConfirmForm
            setModalVisible={() => closeModal("archiveSession")}
            onConfirm={handleArchiveSession}
          />
        </View>
      </Modal>
    </>
  );

  return (
    <View className="flex-1 bg-primary relative">
      {/* Logo */}
      <Image
        source={icons.logo}
        className="w-12 h-10 absolute mt-20 mx-auto self-center"
        resizeMode="contain"
        tintColor="white"
      />

      {/* Action Buttons */}
      <Link key={`moneyButton`} href={"/screens/moneySummary"} asChild>
        <ActionButton
          style={{ top: 100, left: 40 }}
          icon={icons.cash}
          onPress={() => {}}
          noTintColor={true}
        />
      </Link>
      <ActionButton
        onPress={() => openModal("archiveSession")}
        style={{ top: 100, right: 40 }}
        icon={icons.sessions}
      />

      {/* Table and Players */}
      {session?.isActive ? (
        <View className="flex-1 justify-center items-center">
          <Image
            source={images.pTable}
            className="w-64 h-64 z-0 rotate-90"
            resizeMode="contain"
            tintColor="white"
          />
          {/* Player Slots */}
          {positions.map((style, i) =>
            !players[i] ? (
              <ActionButton
                key={`slot-${i}`}
                onPress={() => {
                  setSelectedPosition(i);
                  openModal("createPlayer");
                }}
                style={style}
                icon={icons.plus}
              />
            ) : (
              <Link
                key={`player-${i}`}
                href={`/player/${players[i]?.$id}`}
                asChild
              >
                <ActionButton
                  style={style}
                  icon={icons.user}
                  topText={players[i]?.name}
                  bottomText={`Chips: ${players[i]?.chips || 0}`}
                  onPress={() => {}}
                />
              </Link>
            ),
          )}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center">
          <ActionButton
            onPress={() => openModal("createSession")}
            style={{ alignItems: "center" }}
            icon={icons.plus}
            bottomText="New Session"
          />
        </View>
      )}

      {renderModals()}
    </View>
  );
};

/** Positioning Logic */
const iconSize = 24;
const centerX = Dimensions.get("window").width / 2;
const centerY = 450;
const radiusX = 130;
const radiusY = 240;

const positions: ViewStyle[] = Array.from({ length: 8 }).map((_, i) => {
  const angle = (i * 360) / 8;
  const rad = (angle * Math.PI) / 180;
  return {
    position: "absolute",
    top: centerY + radiusY * Math.sin(rad) - iconSize / 2,
    left: centerX + radiusX * Math.cos(rad) - iconSize / 2,
  };
});

export default Table;
