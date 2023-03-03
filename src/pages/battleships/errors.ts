import {
  BattleshipsErrorResponse,
  BattleshipsMove,
} from "robrendellwebsite-common";

/*
 Can't move these to robrendellwebsite-common because
 it breaks cjs loader (unexpected token 'export')
*/

export const BattleshipsInvalidMove = (
  move: BattleshipsMove,
  invalidReason: string
): BattleshipsErrorResponse => ({
  errorMessage: `Invalid Battleships move: ${invalidReason}; ${JSON.stringify(
    move,
    null,
    2
  )}`,
});

export const BattleshipsGameNotFound = (
  gameId: string
): BattleshipsErrorResponse => ({
  errorMessage: `Battleships game not found: ${gameId}`,
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
