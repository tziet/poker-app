/** Currency symbol used across the app. */
export const CURRENCY = "₪";

/** Chips that equal one unit of money (₪1) when a session has no chip rate saved. */
export const DEFAULT_CHIP_RATE = 1;

/** A session's chip rate (chips per ₪1); missing or invalid values fall back to 1:1. */
export const normalizeChipRate = (rate?: number | null): number =>
  typeof rate === "number" && Number.isFinite(rate) && rate > 0
    ? rate
    : DEFAULT_CHIP_RATE;

/** Parse a chip rate typed by the user ("10", "0.5", "2,5"); null if invalid. */
export const parseChipRate = (text: string): number | null => {
  const value = Number(text.trim().replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : null;
};

/** At most 2 decimals, no trailing zeros, no thousands separators (as before). */
const trimNumber = (value: number) => String(Number(value.toFixed(2)));

/** A plain chip count, e.g. "1250" or "12.5". */
export const formatChipCount = trimNumber;

const round2 = (value: number) => Math.round(value * 100) / 100;

export const chipsToMoney = (chips: number, rate?: number | null) =>
  chips / normalizeChipRate(rate);

/** "₪12.5", "-₪3" */
export const formatMoney = (amount: number) =>
  `${amount < 0 ? "-" : ""}${CURRENCY}${trimNumber(Math.abs(amount))}`;

/** Money value of a chip amount, e.g. "₪12.5". */
export const formatChipsAsMoney = (chips: number, rate?: number | null) =>
  formatMoney(chipsToMoney(chips, rate));

/** Whether chip amounts need their money value shown next to them. */
export const showsMoney = (rate?: number | null) =>
  normalizeChipRate(rate) !== DEFAULT_CHIP_RATE;

/**
 * A chip amount for display: just the chips at 1:1, otherwise the chips with
 * their money value in brackets, e.g. "1000 (₪100)".
 */
export const formatChips = (chips: number, rate?: number | null) =>
  showsMoney(rate)
    ? `${trimNumber(chips)} (${formatChipsAsMoney(chips, rate)})`
    : trimNumber(chips);

/* ---------- Entering amounts: in chips or in money ---------- */

/** What the user types amounts in. Chips are always what gets stored. */
export type EntryUnit = "money" | "chips";
export const DEFAULT_ENTRY_UNIT: EntryUnit = "money";

/**
 * The unit amounts are typed in for a session. At 1:1 chips and money are the
 * same thing, so it's always chips; otherwise the session's choice (default money).
 */
export const resolveEntryUnit = (
  rate?: number | null,
  unit?: EntryUnit | null,
): EntryUnit =>
  showsMoney(rate) ? (unit === "chips" ? "chips" : DEFAULT_ENTRY_UNIT) : "chips";

/** Convert stored chips into the unit the user edits in. */
export const chipsToEntry = (
  chips: number,
  rate: number | null | undefined,
  unit: EntryUnit,
) => (unit === "money" ? round2(chipsToMoney(chips, rate)) : chips);

/** Convert an amount the user entered back into chips for storage. */
export const entryToChips = (
  value: number,
  rate: number | null | undefined,
  unit: EntryUnit,
) => (unit === "money" ? round2(value * normalizeChipRate(rate)) : value);

/** Parse a typed amount ("150", "12.5", "12,5"); null if empty, invalid or negative. */
export const parseAmount = (text: string): number | null => {
  if (!text.trim()) return null;
  const value = Number(text.trim().replace(",", "."));
  return Number.isFinite(value) && value >= 0 ? value : null;
};

/**
 * Re-express typed text in another unit when the user flips chips ⇄ money,
 * so the amount stays the same ("200" ₪ at 5 chips/₪ → "1000" chips).
 * Empty or invalid text is left as is.
 */
export const convertEntryText = (
  text: string,
  rate: number | null | undefined,
  from: EntryUnit,
  to: EntryUnit,
) => {
  const value = parseAmount(text);
  if (value === null || from === to) return text;
  return String(chipsToEntry(entryToChips(value, rate, from), rate, to));
};

/** An amount in the entry unit: "₪12.5" for money, "1250" for chips. */
export const formatEntry = (value: number, unit: EntryUnit) =>
  unit === "money" ? formatMoney(value) : trimNumber(value);

/** Input label, e.g. "Buy-In (₪)" or "Buy-In Chips". */
export const entryLabel = (base: string, unit: EntryUnit) =>
  unit === "money" ? `${base} (${CURRENCY})` : `${base} Chips`;

/**
 * Helper text under an amount input showing the other unit ("= 1250 chips" or
 * "= ₪12.5"); undefined at 1:1 or while the text isn't a valid amount.
 */
export const entryHint = (
  text: string,
  rate: number | null | undefined,
  unit: EntryUnit,
) => {
  const value = parseAmount(text);
  if (!showsMoney(rate) || value === null) return undefined;
  return unit === "money"
    ? `= ${trimNumber(entryToChips(value, rate, unit))} chips`
    : `= ${formatChipsAsMoney(value, rate)}`;
};