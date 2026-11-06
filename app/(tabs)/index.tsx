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
  updateSessionSettings,
  updatePlayer,
  deletePlayer,
} from "@/services/firebase";
import PlayerQuickActions, {
  PopupAnchor,
} from "@/app/components/ui/PlayerQuickActions";
import CreatePlayerForm from "@/app/components/forms/CreatePlayerForm";
import ConfirmForm from "@/app/components/forms/ConfirmForm";
import NewSessionForm from "@/app/components/forms/NewSessionForm";
import SessionSettingsForm, {
  SessionSettings,
} from "@/app/components/forms/SessionSettingsForm";
import { Ionicons } from "@expo/vector-icons";
import {
  formatChips,
  normalizeChipRate,
  resolveEntryUnit,
} from "@/utils/money";
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
        <Text className='text-white mt-2 text-sm' numberOfLines={1}>
          {bottomText}
        </Text>
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
    sessionSettings: false,
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

  // Settings saved locally after editing them. They are tied to the fetched
  // session object, so they're ignored once the session is refetched.
  const [settingsOverride, setSettingsOverride] = useState<{
    session: Session;
    settings: SessionSettings;
  } | null>(null);
  const savedSettings =
    settingsOverride && settingsOverride.session === session
      ? settingsOverride.settings
      : null;
  const seatCount = normalizeSeatCount(
    savedSettings?.seatCount ?? session?.seatCount,
  );
  const chipRate = normalizeChipRate(
    savedSettings?.chipRate ?? session?.chipRate,
  );
  const entryUnit = resolveEntryUnit(
    chipRate,
    savedSettings?.entryUnit ?? session?.entryUnit,
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

  const handleCreateSession = async (settings: SessionSettings) => {
    if (!session && user) {
      try {
        await createSession({
          date: new Date(),
          isActive: true,
          userId: user.uid,
          seatCount: normalizeSeatCount(settings.seatCount),
          chipRate: normalizeChipRate(settings.chipRate),
          entryUnit: settings.entryUnit,
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

  const handleSaveSettings = async (
    settings: SessionSettings,
    removedPlayerIds: string[],
  ) => {
    if (!session) return;
    const newCount = normalizeSeatCount(settings.seatCount);
    const newChipRate = normalizeChipRate(settings.chipRate);
    const newSettings: SessionSettings = {
      seatCount: newCount,
      chipRate: newChipRate,
      entryUnit: settings.entryUnit,
    };

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
      await updateSessionSettings(
        session.$id,
        newSettings,
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
      setSettingsOverride({
        session,
        settings: newSettings,
      });
      closeModal("sessionSettings");
    } catch (error) {
      console.error("Error updating session settings:", error);
      alert("Failed to update session settings. Please try again.");
    }
  };

  const tableChips = seatedPlayers.reduce((sum, p) => sum + (p.chips || 0), 0);
  const showSessionControls = !loading && !error && !!session?.isActive;

  const renderModals = () => {
    return (
      <ShowModal
        modals={[
          {
            visible: modalState.createPlayer,
            form: (
              <CreatePlayerForm
                key={`create-player-${formKey}`}
                onClose={() => closeModal("createPlayer")}
                onSubmit={handleCreatePlayer}
                selectedSeat={selectedPosition}
                chipRate={chipRate}
                entryUnit={entryUnit}
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
            visible: modalState.sessionSettings,
            form: (
              <SessionSettingsForm
                key={`session-settings-${formKey}`}
                current={{ seatCount, chipRate, entryUnit }}
                seatedPlayers={seatedPlayers}
                onClose={() => closeModal("sessionSettings")}
                onSubmit={handleSaveSettings}
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
          <Image
            source={images.pTable}
            style={tableImageStyle}
            resizeMode='contain'
            tintColor='white'
          />
          {/* Money at the table and the settings button, below the table */}
          <View style={tableTotalStyle} pointerEvents='box-none'>
            <Text className='text-gray-300 text-xs'>Money at the table</Text>
            <Text className='text-white text-lg font-bold' numberOfLines={1}>
              {formatChips(tableChips, chipRate)}
            </Text>
            <TouchableOpacity
              hitSlop={12}
              onPress={() => openModal("sessionSettings")}
              style={{ marginTop: 14 }}
            >
              <Ionicons name='settings-outline' size={28} color='white' />
            </TouchableOpacity>
          </View>
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
                bottomText={formatChips(players[i]?.chips || 0, chipRate)}
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

      {/* Top bar: cash | logo | archive, all on the logo's centre line.
          Plain styles (not classNames) so the layout can't silently drop. */}
      <View style={topBarStyle} pointerEvents='box-none'>
        <View style={[topBarSlotStyle, { alignItems: "flex-start" }]}>
          {showSessionControls && (
            <Link href='/screens/moneySummary' asChild>
              <TouchableOpacity hitSlop={12}>
                <Image
                  source={icons.cash}
                  style={topBarIconStyle}
                  resizeMode='contain'
                />
              </TouchableOpacity>
            </Link>
          )}
        </View>
        <Image
          source={icons.logo}
          style={{ width: 48, height: 40 }}
          resizeMode='contain'
          tintColor='white'
        />
        <View style={[topBarSlotStyle, { alignItems: "flex-end" }]}>
          {showSessionControls && (
            <TouchableOpacity
              hitSlop={12}
              onPress={() => openModal("archiveSession")}
            >
              <Image
                source={icons.sessions}
                style={topBarIconStyle}
                resizeMode='contain'
                tintColor='white'
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {renderModals()}
      <PlayerQuickActions
        key={`quick-actions-${formKey}`}
        visible={quickActionsVisible}
        player={quickActions?.player ?? null}
        anchor={quickActions?.anchor ?? null}
        chipRate={chipRate}
        entryUnit={entryUnit}
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

// Wide enough for "1000 (₪100)" under the icon; the box stays centred on the seat.
const seatWidth = 96;

/** Seats evenly spaced (by arc length) around the table, symmetric for any count. */
const getSeatStyles = (count: number): ViewStyle[] =>
  getSeatOffsets(count, radiusX, radiusY).map(({ x, y }) => ({
    position: "absolute",
    justifyContent: "center", // Ensures internal content is centered
    alignItems: "center", // Horizontal centering
    top: centerY + y - iconSize / 2,
    left: centerX + 15 + x - seatWidth / 2,
    width: seatWidth,
    height: iconSize, // Match icon size
  }));

// The table drawing sits on the same centre point as the seats (not the screen
// centre, which varies by phone height).
const tableImageSize = 256;
const tableImageStyle = {
  position: "absolute" as const,
  top: centerY - tableImageSize / 2,
  left: centerX + 15 - tableImageSize / 2,
  width: tableImageSize,
  height: tableImageSize,
  transform: [{ rotate: "90deg" }],
};

// Below the bottom seat, clear of its name/chips labels; settings button under it.
const tableTotalWidth = 240;
const tableTotalStyle: ViewStyle = {
  position: "absolute",
  top: centerY + radiusY + 48,
  left: centerX + 15 - tableTotalWidth / 2,
  width: tableTotalWidth,
  alignItems: "center",
};

// Same vertical centre as the old logo (top 80, 40 tall).
const topBarStyle: ViewStyle = {
  position: "absolute",
  top: 80,
  left: 0,
  right: 0,
  height: 40,
  paddingHorizontal: 32,
  flexDirection: "row",
  alignItems: "center",
};
// Equal-width side slots keep the logo exactly centred.
const topBarSlotStyle: ViewStyle = { flex: 1, justifyContent: "center" };
const topBarIconStyle = { width: 28, height: 28 };
export default Table;
