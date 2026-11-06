export const MIN_SEATS = 2;
export const MAX_SEATS = 10;
export const DEFAULT_SEATS = 8;

/** Clamp a stored/entered seat count into [MIN_SEATS, MAX_SEATS]; legacy sessions without one get the default. */
export const normalizeSeatCount = (count?: number | null): number => {
  if (typeof count !== "number" || !Number.isFinite(count)) return DEFAULT_SEATS;
  return Math.min(MAX_SEATS, Math.max(MIN_SEATS, Math.round(count)));
};

/**
 * Seat centers (relative to the table center) spread at equal arc-length
 * intervals around an ellipse, so spacing looks even on the elongated table.
 * Seat 0 sits at the bottom center and seats continue clockwise, which keeps
 * every layout mirror-symmetric around the table's vertical axis.
 */
const ELLIPSE_SAMPLES = 720;
const layoutCache = new Map<string, { x: number; y: number }[]>();

export const getSeatOffsets = (
  count: number,
  radiusX: number,
  radiusY: number,
): { x: number; y: number }[] => {
  const key = `${count}:${radiusX}:${radiusY}`;
  const cached = layoutCache.get(key);
  if (cached) return cached;

  const startT = Math.PI / 2; // bottom center (screen y grows downward)
  const point = (t: number) => ({
    x: radiusX * Math.cos(t),
    y: radiusY * Math.sin(t),
  });

  // Cumulative arc length along the ellipse, sampled from the start angle.
  const cumulative: number[] = [0];
  let prev = point(startT);
  for (let i = 1; i <= ELLIPSE_SAMPLES; i++) {
    const p = point(startT + (2 * Math.PI * i) / ELLIPSE_SAMPLES);
    cumulative.push(cumulative[i - 1] + Math.hypot(p.x - prev.x, p.y - prev.y));
    prev = p;
  }
  const perimeter = cumulative[ELLIPSE_SAMPLES];

  const offsets: { x: number; y: number }[] = [];
  let j = 0;
  for (let seat = 0; seat < count; seat++) {
    const target = (seat * perimeter) / count;
    while (j < ELLIPSE_SAMPLES - 1 && cumulative[j + 1] < target) j++;
    const segment = cumulative[j + 1] - cumulative[j];
    const fraction = segment > 0 ? (target - cumulative[j]) / segment : 0;
    const t = startT + (2 * Math.PI * (j + fraction)) / ELLIPSE_SAMPLES;
    offsets.push(point(t));
  }

  layoutCache.set(key, offsets);
  return offsets;
};

/**
 * Map occupied seats from a table of `oldCount` seats onto `newCount` seats.
 * Players keep their clockwise order and roughly their angular position, with
 * empty seats spread between them. `occupiedSeats` must be sorted ascending,
 * unique, and no longer than `newCount`. Returns the new seat for each input.
 */
export const redistributeSeats = (
  occupiedSeats: number[],
  oldCount: number,
  newCount: number,
): number[] => {
  const k = occupiedSeats.length;
  if (k > newCount) {
    throw new Error(`Cannot fit ${k} players into ${newCount} seats.`);
  }

  // Forward pass: closest proportional seat, strictly increasing.
  const seats = occupiedSeats.map((s) => Math.round((s * newCount) / oldCount));
  for (let i = 0; i < k; i++) {
    seats[i] = Math.max(seats[i], i === 0 ? 0 : seats[i - 1] + 1);
  }
  // Backward pass: pull anything that overflowed back inside the table.
  for (let i = k - 1; i >= 0; i--) {
    seats[i] = Math.min(seats[i], i === k - 1 ? newCount - 1 : seats[i + 1] - 1);
  }
  return seats;
};
