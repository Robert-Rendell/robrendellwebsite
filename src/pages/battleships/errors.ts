import {
  BattleshipsErrorResponse,
  BattleshipsGameState,
  BattleshipsMove,
  BattleshipsUsername,
} from "robrendellwebsite-common";

/*
 Can't move these to robrendellwebsite-common because
 it breaks cjs loader (unexpected token 'export')
*/

export const BattleshipsInvalidMove = (
  move: BattleshipsMove,
  invalidReason: string
): BattleshipsErrorResponse => ({
  errorMessage: `Invalid Battleships move: ${invalidReason}.`,
  meta: move,
});

export const BattleshipsGameNotFound = (
  gameId: string
): BattleshipsErrorResponse => ({
  errorMessage: `Battleships game not found: ${gameId}`,
});

export const BattleshipsInvalidRequest = (
  msg?: string
): BattleshipsErrorResponse => ({
  errorMessage: msg || "You aren't allowed to do that.",
});

export const BattleshipsInvalidGameStateRequest = (
  gameState: BattleshipsGameState
): BattleshipsErrorResponse => ({
  errorMessage: `You aren't allowed to do that in the current game state (${gameState}).`,
});

export const BattleshipsMissingArgsRequest = (
  prop?: string
): BattleshipsErrorResponse => ({
  errorMessage: `Missing or invalid '${prop}' in request body`,
});

export const BattleshipsUserNotFound = (
  username: BattleshipsUsername
): BattleshipsErrorResponse => ({
  errorMessage: `Battleships user not found: ${username}`,
});

/**
 * Simple function to handle unexpected errors and spit out error message
 */
export const BattleshipsInternalServerError = (
  errorMessage: string
): BattleshipsErrorResponse => ({
  errorMessage,
});

export const BattleshipsStartConfigurationNotFound = (
  gameId: string
): BattleshipsErrorResponse => ({
  errorMessage: `Battleships start configuration not found: ${gameId}`,
});
