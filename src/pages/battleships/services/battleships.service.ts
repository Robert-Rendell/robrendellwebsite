import {
  BattleshipsGame,
  BattleshipsUsername,
  BattleshipsMove,
  BattleshipsBoard,
  BattleshipsStartConfiguration,
  BattleshipsConfigurationBoard,
  BattleshipType,
} from "robrendellwebsite-common";

// Need these two here, otherwise jest fails for non standard JavaScript
export type BattleshipsBoardType = 1 | 0 | -1;
export const BattleshipsBoardState: Record<
  "Hit" | "Miss" | "Empty",
  BattleshipsBoardType
> = {
  Hit: 1,
  Miss: 0,
  Empty: -1,
};
export class BattleshipsService {
  public static setWinner(
    game: BattleshipsGame,
    username: BattleshipsUsername
  ) {
    const newGame = BattleshipsService.cloneGame(game);
    newGame.finishedAt = new Date().toUTCString();
    newGame.state = "finished";
    newGame.winner = username;
    return newGame;
  }
  public static isFleetSunk(
    game: BattleshipsGame,
    opponentShips: BattleshipsStartConfiguration
  ): boolean {
    for (let x = 0; x < opponentShips.configuration.length; x += 1) {
      for (let y = 0; y < opponentShips.configuration[x].length; y += 1) {
        const cell = opponentShips.configuration[x][y];
        if (cell) {
          const isShipCellNotSunk =
            game.playerBoards[BattleshipsService.getOpponent(game)][x][y] !==
            BattleshipsBoardState.Hit;
          if (isShipCellNotSunk) {
            return false;
          }
        }
      }
    }
    return true;
  }
  public static isShipSunk(
    ship: BattleshipType,
    game: BattleshipsGame,
    opponentShips: BattleshipsStartConfiguration
  ): boolean {
    for (let x = 0; x < opponentShips.configuration.length; x += 1) {
      for (let y = 0; y < opponentShips.configuration[x].length; y += 1) {
        const cell = opponentShips.configuration[x][y];
        if (cell === ship) {
          const isShipCellNotSunk =
            game.playerBoards[BattleshipsService.getOpponent(game)][x][y] !==
            BattleshipsBoardState.Hit;
          if (isShipCellNotSunk) {
            return false;
          }
        }
      }
    }
    return true;
  }
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
    game: BattleshipsGame,
    opponentShips: BattleshipsStartConfiguration
  ): BattleshipsGame {
    const [x, y] = move.coords;
    const opponentIndex = this.getOpponent(game);
    const changedGame = BattleshipsService.cloneGame(game);
    changedGame.playerMoves[game.turn].push(move);
    if (BattleshipsService.isHit(move, opponentShips)) {
      changedGame.playerBoards[opponentIndex][x][y] = BattleshipsBoardState.Hit;
      const ship = opponentShips.configuration[x][y];
      if (ship) {
        if (BattleshipsService.isShipSunk(ship, changedGame, opponentShips)) {
          changedGame.playerShips[opponentIndex][ship] = "sunk";
        }
      }
    } else {
      changedGame.playerBoards[this.getOpponent(game)][x][y] =
        BattleshipsBoardState.Miss;
      changedGame.turn = this.getOpponent(game);
    }
    return changedGame;
  }

  public static setPlayersConfigurationComplete(game: BattleshipsGame) {
    const changedGame = BattleshipsService.cloneGame(game);
    changedGame.startedPlayingAt = new Date().toUTCString();
    changedGame.state = "playing";
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

  public static getOpponentUsername(
    game: BattleshipsGame,
    username: BattleshipsUsername
  ) {
    return game.playerUsernames.filter((n) => n !== username)[0];
  }

  private static isHit(
    move: BattleshipsMove,
    opponentShips: BattleshipsStartConfiguration
  ): boolean {
    const [x, y] = move.coords;
    return Boolean(opponentShips.configuration[x][y]);
  }

  public static canJoinGame(
    game: BattleshipsGame,
    username: BattleshipsUsername
  ): true | string {
    if (!username) {
      return "No username was given";
    }
    if (
      username &&
      (game.playerUsernames[0] === username ||
        game.playerUsernames[1] === username)
    ) {
      return true;
    }
    if (game.playerUsernames[0] === game.playerUsernames[1]) {
      return true;
    }
    if (game.playerUsernames[0] === username) {
      return "You cannot play against yourself.";
    }
    if (game.playerUsernames[1]) {
      return "The game is full.";
    }
    return true;
  }

  public static joinGame(game: BattleshipsGame, username: BattleshipsUsername) {
    const changed = BattleshipsService.cloneGame(game);
    if (changed.playerUsernames[0] !== username) {
      changed.playerUsernames[1] = username;
    }
    if (game.state === "created" && changed.playerUsernames[1]) {
      changed.state = "configuring";
    }
    return changed;
  }

  public static isStartConfigurationInvalid(
    startConfiguration: BattleshipsConfigurationBoard,
    game: BattleshipsGame,
    username: BattleshipsUsername
  ): string | false {
    if (
      startConfiguration.length !== game.boardDimensions[0] ||
      startConfiguration.every((col) => col.length !== game.boardDimensions[1])
    ) {
      return `Board dimensions don't match the game (${game.boardDimensions})`;
    }
    if (!game.playerUsernames.includes(username)) {
      return `User '${username}' not currently playing this game`;
    }
    return false;
  }

  public static createEmpty2DBoard(
    width: number,
    height: number
  ): BattleshipsBoard {
    return BattleshipsService.create1DArray(width).map(() =>
      BattleshipsService.create1DArray(height, BattleshipsBoardState.Empty)
    );
  }

  private static create1DArray(
    x: number,
    defaultVal?: BattleshipsBoardType
  ): BattleshipsBoardType[] {
    const array1d = Array.from(Array(x));
    if (typeof defaultVal !== "undefined") {
      return array1d.map(() => defaultVal);
    }
    return array1d;
  }
}
