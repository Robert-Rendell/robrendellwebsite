import {
  BattleshipsGame,
  BattleshipsStartConfiguration,
  BattleshipsUsername,
} from "robrendellwebsite-common";
import { BattleshipsMove } from "robrendellwebsite-common/src/models/battleships/battleships-move";

export class BattleshipsService {
  public static isValidMove(
    _move: BattleshipsMove,
    username: BattleshipsUsername,
    game: BattleshipsGame
  ): boolean {
    return BattleshipsService.getPlayerTurn(game) === username;
  }

  public static makeMove(
    move: BattleshipsMove,
    game: BattleshipsGame
  ): BattleshipsGame {
    game.playerMoves[game.turn].push(move);
    if (!BattleshipsService.isHit(move)) {
      game.turn = this.getOpponent(game);
    }
    return game;
  }

  private static getPlayerTurn(game: BattleshipsGame): BattleshipsUsername {
    return game.playerUsernames[game.turn];
  }

  private static getOpponent(game: BattleshipsGame): 0 | 1 {
    return game.turn === 1 ? 0 : 1;
  }

  private static isHit(move: BattleshipsMove): boolean {
    return true;
  }

  public static isStartConfigurationValid(
    startConfiguration: BattleshipsStartConfiguration
  ): boolean {
    return true;
  }
}
