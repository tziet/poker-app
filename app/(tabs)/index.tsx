import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
} from "react";
import {
  View,
  Image,
  Dimensions,
  Text,
  TouchableOpacity,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, router, Link } from "expo-router";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import {
  createPlayer,
  getAllPlayers,
  createSession,
  updateSession,
  resizeSessionSeats,
  updatePlayer,
  deletePlayer,
} from "@/services/firebase";
import PlayerQuickActions, {
  PopupAnchor,
} from "@/app/components/ui/PlayerQuickActions";
import CreatePlayerForm from "@/app/components/forms/CreatePlayerForm";
import ConfirmForm from "@/app/components/forms/ConfirmForm";
import NewSessionForm from "@/app/components/forms/NewSessionForm";
import EditSeatsForm from "@/app/components/forms/EditSeatsForm";
import {
  DEFAULT_SEATS,
  getSeatOffsets,
  normalizeSeatCount,
  redistributeSeats,
} from "@/utils/seatLayout";
import { useSessionContext } from "@/contexts/SessionContext";
import useActiveSession from "@/hooks/useSession";
import ShowModal from "@/app/components/ui/ShowModal";
import { useAuth } from "@/contexts/AuthContext";

/** Native node behind a seat button; used to measure where the popup should point. */
type SeatNode = React.ComponentRef<typeof View>;

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
      className='absolute'
    >
      {topText && (
        <Text
          className='text-white text-sm mb-1'
          numberOfLines={1}
          ellipsizeMode='tail'
        >
          {topText}
        </Text>
      )}
      <Image
        source={icon}
        className='w-6 h-6'
        resizeMode='contain'
        tintColor={noTintColor ? undefined : "white"}
      />
      {bottomText && (
        <Text className='text-white mt-2 text-sm'>{bottomText}</Text>
      )}
    </TouchableOpacity>
  ),
);

const Table = () => {
  const { user } = useAuth();
  const { session, loading, error, refetch } = useActiveSession();
  const { reloadSessions } = useSessionContext(); // Fetch reloadSessions from SessionContext

  const [modalState, setModalState] = useState({
    createPlayer: false,
    createSession: false,
    archiveSession: false,
    editSeats: false,
  });
  // Bumped on every open so forms start fresh instead of keeping stale input.
  const [formKey, setFormKey] = useState(0);
  const openModal = (type: keyof typeof modalState) => {
    setFormKey((k) => k + 1);
    setModalState((prev) => ({ ...prev, [type]: true }));
  };
  const closeModal = (type: keyof typeof modalState) =>
    setModalState((prev) => ({ ...prev, [type]: false }));

  const [players, setPlayers] = useState<(Player | null)[]>(
    Array(DEFAULT_SEATS).fill(null),
  );
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  // Seat count saved locally after a resize. It is tied to the fetched session
  // object, so it is ignored as soon as the session is refetched from Firestore.
  const [seatCountOverride, setSeatCountOverride] = useState<{
    session: Session;
    count: number;
  } | null>(null);
  const seatCount = normalizeSeatCount(
    seatCountOverride && seatCountOverride.session === session
      ? seatCountOverride.count
      : session?.seatCount,
  );
  const positions = useMemo(() => getSeatStyles(seatCount), [seatCount]);

  const loadPlayers = useCallback(async () => {
    if (!session?.$id) {
      console.warn("Session ID is missing. Cannot fetch players.");
      return;
    }
    try {
      const sessionPlayers = (await getAllPlayers(session.$id)) as Player[];

      const updatedPlayers = Array(seatCount).fill(null);

      sessionPlayers.forEach((player) => {
        if (
          player.seat !== null &&
          player.seat >= 0 &&
          player.seat < seatCount
        ) {
          updatedPlayers[player.seat] = player;
        }
      });

      setPlayers(updatedPlayers);
    } catch (error) {
      console.error("Failed to load players:", error);
      alert("Unable to load players. Please try again.");
    }
  }, [session?.$id, seatCount]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        const loadData = async () => {
          await Promise.all([reloadSessions(), refetch()]);
        };
        loadData();
      }
    }, [user]),
  );

  useEffect(() => {
    if (session?.$id) {
      loadPlayers();
    }
  }, [session?.$id]);

  useFocusEffect(
    useCallback(() => {
      if (session?.$id) {
        loadPlayers();
      }
    }, [session?.$id, loadPlayers]),
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

  const handleCreateSession = async (newSeatCount: number) => {
    if (!session && user) {
      try {
        await createSession({
          date: new Date(),
          isActive: true,
          userId: user.uid,
          seatCount: normalizeSeatCount(newSeatCount),
        });
        closeModal("createSession");
        setPlayers([]);
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
        await updateSession(session.$id, { isActive: false });
        closeModal("archiveSession");
        setPlayers([]);
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

  // Quick-actions popup for a seated player. The data is kept after closing so
  // the popup's content stays visible while it fades out.
  const seatRefs = useRef<(SeatNode | null)[]>([]);
  const [quickActions, setQuickActions] = useState<{
    player: Player;
    anchor: PopupAnchor | null;
  } | null>(null);
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);

  const openQuickActions = (seat: number) => {
    const player = players[seat];
    if (!player) return;
    const show = (anchor: PopupAnchor | null) => {
      setFormKey((k) => k + 1); // fresh chip counter each time
      setQuickActions({ player, anchor });
      setQuickActionsVisible(true);
    };
    const node = seatRefs.current[seat];
    if (!node) return show(null);
    node.measureInWindow((x, y, width, height) =>
      show({ x, y, width, height }),
    );
  };
  const closeQuickActions = () => setQuickActionsVisible(false);

  const replacePlayer = (playerId: string, next: Player | null) =>
    setPlayers((prev) => prev.map((p) => (p?.$id === playerId ? next : p)));

  const handleQuickSaveChips = async (chips: number) => {
    const player = quickActions?.player;
    if (!player) return;
    try {
      const updatedPlayer = { ...player, chips };
      await updatePlayer(player.$id, updatedPlayer);
      replacePlayer(player.$id, updatedPlayer);
      closeQuickActions();
    } catch (error) {
      console.error("Error updating chips:", error);
      alert("Failed to update chips. Please try again.");
    }
  };

  const handleQuickEdit = () => {
    const player = quickActions?.player;
    if (!player) return;
    closeQuickActions();
    router.push(`/player/${player.$id}`);
  };

  // Same behaviour as the Delete Player button on the player screen.
  const handleQuickDelete = async () => {
    const player = quickActions?.player;
    if (!player) return;
    try {
      await deletePlayer(player.$id);
      replacePlayer(player.$id, null);
      closeQuickActions();
      alert(`Player ${player.name} has been deleted.`);
    } catch (error) {
      console.error("Error deleting player:", error);
      alert("Failed to delete player.");
    }
  };

  const seatedPlayers = players.filter((p): p is Player => !!p);

  const handleResizeSeats = async (
    newSeatCount: number,
    removedPlayerIds: string[],
  ) => {
    if (!session) return;
    const newCount = normalizeSeatCount(newSeatCount);

    // `players` is indexed by seat, so this is already in clockwise seat order.
    const remaining = players
      .map((player, seat) => ({ player, seat }))
      .filter(
        (entry): entry is { player: Player; seat: number } =>
          !!entry.player && !removedPlayerIds.includes(entry.player.$id),
      );
    if (remaining.length > newCount) {
      alert("Not enough seats for the remaining players.");
      return;
    }

    const newSeats = redistributeSeats(
      remaining.map((entry) => entry.seat),
      seatCount,
      newCount,
    );

    try {
      await resizeSessionSeats(
        session.$id,
        newCount,
        remaining
          .map((entry, i) => ({ playerId: entry.player.$id, seat: newSeats[i] }))
          .filter((change, i) => change.seat !== remaining[i].player.seat),
        removedPlayerIds,
      );

      const updatedPlayers: (Player | null)[] = Array(newCount).fill(null);
      remaining.forEach((entry, i) => {
        updatedPlayers[newSeats[i]] = { ...entry.player, seat: newSeats[i] };
      });
      setPlayers(updatedPlayers);
      setSeatCountOverride({ session, count: newCount });
      closeModal("editSeats");
    } catch (error) {
      console.error("Error updating seats:", error);
      alert("Failed to update seats. Please try again.");
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
              <NewSessionForm
                key={`new-session-${formKey}`}
                onClose={() => closeModal("createSession")}
                onSubmit={handleCreateSession}
              />
            ),
          },
          {
            visible: modalState.editSeats,
            form: (
              <EditSeatsForm
                key={`edit-seats-${formKey}`}
                currentCount={seatCount}
                seatedPlayers={seatedPlayers}
                onClose={() => closeModal("editSeats")}
                onSubmit={handleResizeSeats}
              />
            ),
          },
          {
            visible: modalState.archiveSession,
            form: (
              <ConfirmForm
                onClose={() => closeModal("archiveSession")}
                onSubmit={handleArchiveSession}
                submitText='Archive Session'
                text='Are you sure you want to archive this session?'
              />
            ),
          },
        ]}
      />
    );
  };

  return (
    <View className='flex-1 bg-primary relative'>
      <Image
        source={icons.logo}
        className='w-12 h-10 absolute mt-20 mx-auto self-center'
        resizeMode='contain'
        tintColor='white'
      />
      {loading ? (
        <ActivityIndicator
          size='large'
          color='#0000ff'
          className='flex-1 self-center justify-center'
        />
      ) : error ? (
        <View className='flex-1 justify-center items-center'>
          <Text>Error loading session: {error.message}</Text>
        </View>
      ) : session?.isActive ? (
        <View className='flex-1 justify-center items-center'>
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
          {/* Seat count editor, next to the archive button in the top bar */}
          <ActionButton
            onPress={() => openModal("editSeats")}
            style={{ top: 100, right: 90 }}
            icon={icons.edit}
            bottomText={`${seatCount} seats`}
          />
          <Image
            source={images.pTable}
            className='w-64 h-64 z-0 rotate-90'
            resizeMode='contain'
            tintColor='white'
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
              <ActionButton
                key={`player-${i}`}
                ref={(node: SeatNode | null) => {
                  seatRefs.current[i] = node;
                }}
                style={style}
                icon={icons.user}
                topText={players[i]?.name}
                bottomText={`${players[i]?.chips || 0}`}
                onPress={() => openQuickActions(i)}
              />
            ),
          )}
        </View>
      ) : (
        <View className='flex-1 justify-center items-center'>
          <ActionButton
            onPress={() => openModal("createSession")}
            style={{ alignItems: "center" }}
            icon={icons.plus}
            bottomText='New Session'
          />
        </View>
      )}

      {renderModals()}
      <PlayerQuickActions
        key={`quick-actions-${formKey}`}
        visible={quickActionsVisible}
        player={quickActions?.player ?? null}
        anchor={quickActions?.anchor ?? null}
        onClose={closeQuickActions}
        onSaveChips={handleQuickSaveChips}
        onEditDetails={handleQuickEdit}
        onDelete={handleQuickDelete}
      />
    </View>
  );
};

/** Positioning Logic */
const iconSize = 24;
const centerX = Dimensions.get("window").width / 2 - 15;
const centerY = 445;
const radiusX = 130;
const radiusY = 240;

/** Seats evenly spaced (by arc length) around the table, symmetric for any count. */
const getSeatStyles = (count: number): ViewStyle[] =>
  getSeatOffsets(count, radiusX, radiusY).map(({ x, y }) => ({
    position: "absolute",
    justifyContent: "center", // Ensures internal content is centered
    alignItems: "center", // Horizontal centering
    top: centerY + y - iconSize / 2,
    left: centerX + x - iconSize / 2,
    width: iconSize + 30, // Match icon size
    height: iconSize, // Match icon size
  }));
export default Table;
