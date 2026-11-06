import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { icons } from "@/constants/icons";
import {
  EntryUnit,
  chipsToEntry,
  entryToChips,
  formatChipCount,
  formatChipsAsMoney,
  formatEntry,
  showsMoney,
} from "@/utils/money";

export type PopupAnchor = { x: number; y: number; width: number; height: number };

type Props = {
  visible: boolean;
  player: Player | null;
  /** Window-relative frame of the tapped seat; the popup points at it. */
  anchor: PopupAnchor | null;
  /** Session chip rate (chips per ₪1); money is shown when it isn't 1:1. */
  chipRate: number;
  /** Unit the buy-in is edited in; the ±50 steps are in this unit. */
  entryUnit: EntryUnit;
  onClose: () => void;
  onSaveChips: (chips: number) => Promise<void>;
  onEditDetails: () => void;
  onDelete: () => Promise<void>;
};

/** Step size in the unit being edited (₪50 or 50 chips). */
const STEP = 50;
const CARD_WIDTH = 260;
const EDGE_MARGIN = 12;
const ARROW_SIZE = 12;
// The seat's touch box is icon-sized; its name/chip labels overflow above and
// below it, so keep the popup clear of them.
const GAP_ABOVE = 30;
const GAP_BELOW = 36;

const StepButton = ({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`w-16 h-11 rounded-full items-center justify-center ${disabled ? "bg-gray-100" : "bg-blue-500"}`}
  >
    <Text
      className={`text-base font-bold ${disabled ? "text-gray-300" : "text-white"}`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const PlayerQuickActions = ({
  visible,
  player,
  anchor,
  chipRate,
  entryUnit,
  onClose,
  onSaveChips,
  onEditDetails,
  onDelete,
}: Props) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [chips, setChips] = useState(player?.chips ?? 0);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cardHeight, setCardHeight] = useState(0);

  if (!player) return null;

  const originalChips = player.chips ?? 0;
  const diff = chips - originalChips;

  // Amounts are kept in chips; shown and stepped in the entry unit.
  const stepChips = entryToChips(STEP, chipRate, entryUnit);
  const stepLabel = formatEntry(STEP, entryUnit);
  const withMoney = showsMoney(chipRate);
  const primary = (c: number) => formatEntry(chipsToEntry(c, chipRate, entryUnit), entryUnit);
  const secondary = (c: number) =>
    entryUnit === "money"
      ? `${formatChipCount(c)} chips`
      : formatChipsAsMoney(c, chipRate);
  const signed = (text: string, value: number) =>
    value > 0 ? `+${text}` : text;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  // Place the card above the seat when it fits, otherwise below it.
  const anchorCenterX = anchor
    ? anchor.x + anchor.width / 2
    : screenWidth / 2;
  const anchorTop = anchor?.y ?? screenHeight / 2;
  const anchorBottom = anchor ? anchor.y + anchor.height : screenHeight / 2;
  const fitsAbove =
    anchorTop - GAP_ABOVE - cardHeight >= insets.top + EDGE_MARGIN;
  const top = fitsAbove
    ? anchorTop - GAP_ABOVE - cardHeight
    : Math.min(
        anchorBottom + GAP_BELOW,
        screenHeight - insets.bottom - EDGE_MARGIN - cardHeight,
      );
  const left = Math.min(
    Math.max(anchorCenterX - CARD_WIDTH / 2, EDGE_MARGIN),
    screenWidth - CARD_WIDTH - EDGE_MARGIN,
  );
  const arrowLeft = Math.min(
    Math.max(anchorCenterX - left - ARROW_SIZE / 2, 16),
    CARD_WIDTH - 16 - ARROW_SIZE,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        className='absolute inset-0 bg-black/40'
        onPress={busy ? undefined : onClose}
      />
      <View
        onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
        style={{
          position: "absolute",
          top,
          left,
          width: CARD_WIDTH,
          opacity: cardHeight ? 1 : 0, // hide until measured to avoid a jump
        }}
      >
        {/* Arrow pointing at the seat */}
        <View
          className='bg-white absolute'
          style={{
            width: ARROW_SIZE,
            height: ARROW_SIZE,
            left: arrowLeft,
            transform: [{ rotate: "45deg" }],
            ...(fitsAbove
              ? { bottom: -ARROW_SIZE / 2 }
              : { top: -ARROW_SIZE / 2 }),
          }}
        />
        <View className='bg-white rounded-2xl p-4'>
          <View className='flex-row items-center justify-between mb-3'>
            <Text
              className='text-lg font-bold text-black flex-1'
              numberOfLines={1}
            >
              {player.name}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={busy} hitSlop={10}>
              <Text className='text-gray-400 text-xl'>✕</Text>
            </TouchableOpacity>
          </View>

          {confirmingDelete ? (
            <>
              <Text className='text-gray-700'>
                Are you sure you want to delete this player?
              </Text>
              <View className='flex-row justify-between mt-4'>
                <TouchableOpacity
                  onPress={() => setConfirmingDelete(false)}
                  disabled={busy}
                  className='px-4 py-2 rounded-lg bg-gray-200'
                >
                  <Text className='text-gray-700'>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => run(onDelete)}
                  disabled={busy}
                  className='px-4 py-2 rounded-lg bg-red-700 flex-row items-center'
                >
                  {busy && (
                    <ActivityIndicator size='small' color='#fff' className='mr-2' />
                  )}
                  <Text className='text-white font-bold'>Delete Player</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text className='text-xs text-gray-500 text-center mb-2'>
                {entryUnit === "money" ? "Buy-in" : "Buy-in chips"}
              </Text>
              <View className='flex-row items-center justify-between'>
                <StepButton
                  label={`−${stepLabel}`}
                  disabled={busy || chips - stepChips < 0}
                  onPress={() => setChips((c) => Math.max(0, c - stepChips))}
                />
                <View className='items-center'>
                  <Text className='text-2xl font-bold text-black'>
                    {primary(chips)}
                  </Text>
                  {withMoney && (
                    <Text className='text-sm text-gray-500'>
                      ({secondary(chips)})
                    </Text>
                  )}
                  {diff !== 0 && (
                    <Text
                      className={`text-xs font-semibold ${diff > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {signed(primary(diff), diff)}
                      {withMoney && ` (${signed(secondary(diff), diff)})`}
                    </Text>
                  )}
                </View>
                <StepButton
                  label={`+${stepLabel}`}
                  disabled={busy}
                  onPress={() => setChips((c) => c + stepChips)}
                />
              </View>
              {diff !== 0 && (
                <TouchableOpacity
                  onPress={() => run(() => onSaveChips(chips))}
                  disabled={busy}
                  className='mt-3 py-2 rounded-lg bg-green-600 flex-row items-center justify-center'
                >
                  {busy && (
                    <ActivityIndicator size='small' color='#fff' className='mr-2' />
                  )}
                  <Text className='text-white font-bold'>Save</Text>
                </TouchableOpacity>
              )}

              <View className='flex-row mt-4 gap-2'>
                <TouchableOpacity
                  onPress={onEditDetails}
                  disabled={busy}
                  className='flex-1 py-2 rounded-lg bg-orange-500 flex-row items-center justify-center'
                >
                  <Image
                    source={icons.edit}
                    className='w-4 h-4 mr-1'
                    tintColor='#fff'
                  />
                  <Text className='text-white font-semibold'>Edit player</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setConfirmingDelete(true)}
                  disabled={busy}
                  className='flex-1 py-2 rounded-lg bg-red-900 flex-row items-center justify-center'
                >
                  <Image
                    source={icons.removeUser}
                    className='w-4 h-4 mr-1'
                    tintColor='#fff'
                  />
                  <Text className='text-white font-semibold'>Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PlayerQuickActions;
