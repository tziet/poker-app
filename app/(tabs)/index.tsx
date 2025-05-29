import React, { useCallback, useState, useEffect, forwardRef } from "react";
import {
  View,
  Image,
  Dimensions,
  Text,
  TouchableOpacity,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Link } from "expo-router";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import {
  createPlayer,
  getAllPlayers,
  createSession,
  updateSession,
} from "@/services/firebase";
import CreatePlayerForm from "@/app/components/forms/CreatePlayerForm";
import ConfirmForm from "@/app/components/forms/ConfirmForm";
import { useSessionContext } from "@/contexts/SessionContext";
import useActiveSession from "@/hooks/useSession";
import ShowModal from "@/app/components/ui/ShowModal";

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
      ref={ref}
      onPress={onPress}
      style={[style, { justifyContent: "center", alignItems: "center" }]}
      className="absolute"
    >
      {topText && (
        <Text
          className="text-white text-sm mb-1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {topText}
        </Text>
      )}
      <Image
        source={icon}
        className="w-6 h-6"
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
  const { session, loading, error, refetch } = useActiveSession();
  const { reloadSessions } = useSessionContext(); // Fetch reloadSessions from SessionContext

  const [modalState, setModalState] = useState({
    createPlayer: false,
    createSession: false,
    archiveSession: false,
  });
  const openModal = (type: keyof typeof modalState) =>
    setModalState({ ...modalState, [type]: true });
  const closeModal = (type: keyof typeof modalState) =>
    setModalState({ ...modalState, [type]: false });

  const [players, setPlayers] = useState<(Player | null)[]>(
    Array(8).fill(null),
  );
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  const loadPlayers = useCallback(async () => {
    if (!session?.$id) {
      console.warn("Session ID is missing. Cannot fetch players.");
      return;
    }
    try {
      const sessionPlayers = (await getAllPlayers(session.$id)) as Player[];

      const updatedPlayers = Array(positions.length).fill(null);

      sessionPlayers.forEach((player) => {
        if (
          player.seat !== null &&
          player.seat >= 0 &&
          player.seat < positions.length
        ) {
          updatedPlayers[player.seat] = player;
        }
      });

      setPlayers(updatedPlayers);
    } catch (error) {
      console.error("Failed to load players:", error);
      alert("Unable to load players. Please try again.");
    }
  }, [session]);

  useEffect(() => {
    if (session) loadPlayers();
  }, [session, loadPlayers]);

  useFocusEffect(
    useCallback(() => {
      if (session) loadPlayers();
    }, [session, loadPlayers]),
  );

  const handleCreatePlayer = async (data: {
    name: string;
    chips: number;
    endgameChips: number;
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

  const handleCreateSession = async () => {
    if (!session) {
      try {
        await createSession({
          date: new Date(),
          isActive: true,
        });
        closeModal("createSession");
      } catch (error) {
        console.error("Error creating session:", error);
        alert("Could not create session. Try again.");
      }
      reloadSessions(); // Update SessionContext
      refetch(); // Refresh the session after creation
    } else {
      alert("You already have an active session.");
    }
  };

  const handleArchiveSession = async () => {
    if (session) {
      try {
        await updateSession(session.$id, { ...session, isActive: false });
        closeModal("archiveSession");
        alert("Session successfully archived.");
      } catch (error) {
        console.error("Error archiving session:", error);
        alert("Failed to archive session. Try again.");
      }
      reloadSessions(); // Update SessionContext
      refetch(); // Refresh session after archiving
    } else {
      alert("No current session to archive.");
    }
  };

  const renderModals = () => {
    return (
      <ShowModal
        modals={[
          {
            visible: modalState.createPlayer,
            form: (
              <CreatePlayerForm
                onClose={() => closeModal("createPlayer")}
                onSubmit={handleCreatePlayer}
                selectedSeat={selectedPosition}
              />
            ),
          },
          {
            visible: modalState.createSession,
            form: (
              <ConfirmForm
                onClose={() => closeModal("createSession")}
                onSubmit={handleCreateSession}
                submitText="Create Session"
                text="Are you sure you want to create a new session?"
              />
            ),
          },
          {
            visible: modalState.archiveSession,
            form: (
              <ConfirmForm
                onClose={() => closeModal("archiveSession")}
                onSubmit={handleArchiveSession}
                submitText="Archive Session"
                text="Are you sure you want to archive this session?"
              />
            ),
          },
        ]}
      />
    );
  };

  return (
    <View className="flex-1 bg-primary relative">
      <Image
        source={icons.logo}
        className="w-12 h-10 absolute mt-20 mx-auto self-center"
        resizeMode="contain"
        tintColor="white"
      />
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          className="flex-1 self-center justify-center"
        />
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text>Error loading session: {error.message}</Text>
        </View>
      ) : session?.isActive ? (
        <View className="flex-1 justify-center items-center">
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
                  bottomText={`${players[i]?.chips || 0}`}
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
const centerX = Dimensions.get("window").width / 2 - 15;
const centerY = 445;
const radiusX = 130;
const radiusY = 240;

const positions: ViewStyle[] = Array.from({ length: 8 }).map((_, i) => {
  const angle = (i * 360) / 8;
  const rad = (angle * Math.PI) / 180;
  return {
    position: "absolute",
    justifyContent: "center", // Ensures internal content is centered
    alignItems: "center", // Horizontal centering
    top: centerY + radiusY * Math.sin(rad) - iconSize / 2,
    left: centerX + radiusX * Math.cos(rad) - iconSize / 2,
    width: iconSize + 30, // Match icon size
    height: iconSize, // Match icon size
  };
});

export default Table;
