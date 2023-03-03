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
    if (!game.playerUsernames.includes(username)) {
      return `User '${username}' not currently playing this game`;
    }
    if (BattleshipsService.getPlayerTurn(game) === username) {
      return "Not your turn";
    }
    if (
      game.playerMoves[game.turn].find(
        (previousMove) =>
          previousMove.coords[0] === move.coords[0] &&
          previousMove.coords[1] === move.coords[1]
      )
    ) {
      return "You have already taken that move";
    }
    return false;
  }

  public static makeMove(
    move: BattleshipsMove,
    game: BattleshipsGame
  ): BattleshipsGame {
    const changedGame = BattleshipsService.cloneGame(game);
    changedGame.playerMoves[game.turn].push(move);
    if (!BattleshipsService.isHit(move)) {
      changedGame.turn = this.getOpponent(game);
    }
    return changedGame;
  }

  private static cloneGame(game: BattleshipsGame): BattleshipsGame {
    return JSON.parse(JSON.stringify(game));
  }

  private static getPlayerTurn(game: BattleshipsGame): BattleshipsUsername {
    return game.playerUsernames[game.turn];
  }

  private static getOpponent(game: BattleshipsGame): 0 | 1 {
    return game.turn === 1 ? 0 : 1;
  }

  private static isHit(move: BattleshipsMove): boolean {
    return false;
  }

  public static canJoinGame(
    game: BattleshipsGame,
    username: BattleshipsUsername
  ): true | string {
    if (game.playerUsernames[1]) {
      return "The game is full";
    }
    if (game.playerUsernames[0] === username) {
      return "You cannot play against yourself";
    }
    return true;
  }

  public static joinGame(game: BattleshipsGame, username: BattleshipsUsername) {
    const changed = BattleshipsService.cloneGame(game);
    changed.playerUsernames[1] = username;
    return changed;
  }

  public static isStartConfigurationInvalid(
    startConfiguration: BattleshipsBoard,
    game: BattleshipsGame
  ): string | false {
    if (
      startConfiguration.length !== game.boardDimensions[0] ||
      startConfiguration.every((col) => col.length !== game.boardDimensions[1])
    ) {
      return `Board dimensions don't match the game (${game.boardDimensions})`;
    }
    return false;
  }
}
