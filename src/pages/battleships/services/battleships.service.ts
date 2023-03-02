import {
  BattleshipsGame,
  BattleshipsStartConfiguration,
} from "robrendellwebsite-common";
import { BattleshipsMove } from "robrendellwebsite-common/src/models/battleships/battleships-move";

export class BattleshipsService {
  public static isValidMove(
    move: BattleshipsMove,
    game: BattleshipsGame
  ): boolean {
    return false;
  }

  public static makeMove(
    move: BattleshipsMove,
    game: BattleshipsGame
  ): BattleshipsGame {
    return game;
  }

  public static isStartConfigurationValid(
    startConfiguration: BattleshipsStartConfiguration
  ): boolean {
    return false;
  }
}
