// FILE: components/city/layout/tiles.ts
// We use a tight 16x16 grid with indices [0..15].
// Center is (8,8).
// The Loop is drawn from index 5 to 11 to keep it tight.

export const GRID_SIZE = 16;

export type TileType = 
  | { type: "empty" }
  | { type: "road" } 
  | { type: "park" };

const R = (): TileType => ({ type: "road" });
const E: TileType = { type: "empty" };

/* LAYOUT PLAN:
  - Ring Road: Top Row 5, Bottom Row 11, Left Col 3, Right Col 13.
  - Central Cross: Vertical Col 8, Horizontal Row 8.
*/
export const CITY_TILES: TileType[][] = [
  // Rows 0-4: Empty Padding
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],

  // Row 5: Top Ring Edge (indices 3 to 13)
  [E, E, E, R(), R(), R(), R(), R(), R(), R(), R(), R(), R(), R(), E, E],

  // Row 6: Vertical connectors
  [E, E, E, R(), E, E, E, E, R(), E, E, E, E, R(), E, E],

  // Row 7: Vertical connectors
  [E, E, E, R(), E, E, E, E, R(), E, E, E, E, R(), E, E],

  // Row 8: Central Horizontal Boulevard (Crosses the verticals)
  [E, E, E, R(), E, E, E, E, R(), E, E, E, E, R(), E, E],

  // Row 9: Vertical connectors
  [E, E, E, R(), E, E, E, E, R(), E, E, E, E, R(), E, E],

  // Row 10: Vertical connectors
  [E, E, E, R(), E, E, E, E, R(), E, E, E, E, R(), E, E],

  // Row 11: Bottom Ring Edge
  [E, E, E, R(), R(), R(), R(), R(), R(), R(), R(), R(), R(), R(), E, E],

  // Rows 12-15: Empty Padding
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
];