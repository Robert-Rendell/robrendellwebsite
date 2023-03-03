import {
  BattleshipsGame,
  BattleshipsUsername,
  BattleshipsMove,
  BattleshipsBoard,
} from "robrendellwebsite-common";

export class BattleshipsService {
  public static isInvalidMove(
    move: BattleshipsMove,
    username: BattleshipsUsername,
    game: BattleshipsGame
  ): string | false {
    if (BattleshipsService.getPlayerTurn(game) === username) {
      return "Not your turn";
    }
    if (
      !game.playerMoves[game.turn].find(
        (previousMove) =>
          previousMove.coords.x === move.coords.x &&
          previousMove.coords.y === move.coords.y
      )
    ) {
      return "You have already taken that move";
    }

    if (!username) {
      return "User can't be empty";
    }

    if (!game.playerUsernames.includes(username)) {
      return `User '${username}' not currently playing this game`;
    }
    return false;
  }

  public static makeMove(
    move: BattleshipsMove,
    game: BattleshipsGame
  ): BattleshipsGame {
    const changedGame = JSON.parse(JSON.stringify(game));
    changedGame.playerMoves[game.turn].push(move);
    if (!BattleshipsService.isHit(move)) {
      changedGame.turn = this.getOpponent(game);
    }
    return changedGame;
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
    startConfiguration: BattleshipsBoard,
    game: BattleshipsGame,
  ): boolean {
    return true;
  }
}
