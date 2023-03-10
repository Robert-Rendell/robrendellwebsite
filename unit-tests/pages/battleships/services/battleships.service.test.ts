import {
  BattleshipsConfigurationBoard,
  BattleshipsGame,
  BattleshipsMove,
  BattleshipsStartConfiguration,
} from "robrendellwebsite-common";
import { BattleshipsService } from "../../../../src/pages/battleships/services/battleships.service";

describe("BattleshipsService", () => {
  describe("makeMove fn", () => {
    test("player 1 hit", () => {
      const move: BattleshipsMove = {
        coords: [0, 1],
        datetime: "today",
      };
      const game: BattleshipsGame = {
        gameId: "",
        boardDimensions: [1, 3],
        playerUsernames: ["Rob", "Yin"],
        playerBoards: [[[-1, -1, -1]], [[-1, -1, -1]]],
        playerMoves: [[], []],
        state: "playing",
        turn: 0,
      };
      const opponentShips: BattleshipsStartConfiguration = {
        configuration: [["", "Submarine", "Submarine"]],
        gameId: "",
        username: "",
      };
      const changedGame = BattleshipsService.makeMove(
        move,
        game,
        opponentShips
      );

      expect(changedGame).toEqual({
        gameId: "",
        boardDimensions: [1, 3],
        playerUsernames: ["Rob", "Yin"],
        playerBoards: [[[-1, -1, -1]], [[-1, 1, -1]]],
        playerMoves: [
          [
            {
              coords: [0, 1],
              datetime: "today",
            },
          ],
          [],
        ],
        state: "playing",
        turn: 0,
      });
    });

    test("player 2 hit", () => {
      const move: BattleshipsMove = {
        coords: [0, 1],
        datetime: "today",
      };
      const game: BattleshipsGame = {
        gameId: "",
        boardDimensions: [1, 3],
        playerUsernames: ["Rob", "Yin"],
        playerBoards: [[[-1, -1, -1]], [[-1, -1, -1]]],
        playerMoves: [[], []],
        state: "playing",
        turn: 1,
      };
      const opponentShips: BattleshipsStartConfiguration = {
        configuration: [["", "Submarine", "Submarine"]],
        gameId: "",
        username: "",
      };
      const changedGame = BattleshipsService.makeMove(
        move,
        game,
        opponentShips
      );

      expect(changedGame).toEqual({
        gameId: "",
        boardDimensions: [1, 3],
        playerUsernames: ["Rob", "Yin"],
        playerBoards: [[[-1, 1, -1]], [[-1, -1, -1]]],
        playerMoves: [
          [],
          [
            {
              coords: [0, 1],
              datetime: "today",
            },
          ],
        ],
        state: "playing",
        turn: 1,
      });
    });
  });

  describe("isStartConfigurationInvalid fn", () => {
    test("valid configuration", () => {
      const username = "Roberto";
      const game: BattleshipsGame = {
        gameId: "",
        boardDimensions: [3, 3],
        playerUsernames: [username, "Yin"],
        playerBoards: [[], []],
        playerMoves: [[], []],
        state: "playing",
        turn: 0,
      };
      const configuration: BattleshipsConfigurationBoard = [
        ["", "Submarine", "Submarine"],
        ["Submarine", "", "Submarine"],
        ["", "", "Submarine"],
      ];

      const invalid = BattleshipsService.isStartConfigurationInvalid(
        configuration,
        game,
        username
      );

      expect(invalid).toBe(false);
    });

    test("invalid configuration: user not playing", () => {
      const username = "Roberto";
      const game: BattleshipsGame = {
        gameId: "",
        boardDimensions: [3, 3],
        playerUsernames: [username, "Yin"],
        playerBoards: [[], []],
        playerMoves: [[], []],
        state: "playing",
        turn: 0,
      };
      const configuration: BattleshipsConfigurationBoard = [
        ["", "Submarine", "Submarine"],
        ["Submarine", "", "Submarine"],
        ["", "", "Submarine"],
      ];

      const invalid = BattleshipsService.isStartConfigurationInvalid(
        configuration,
        game,
        "Bob"
      );

      expect(invalid).toBe("User 'Bob' not currently playing this game");
    });

    test("invalid configuration: board dimensions", () => {
      const username = "Roberto";
      const game: BattleshipsGame = {
        gameId: "",
        boardDimensions: [1, 3],
        playerUsernames: [username, "Yin"],
        playerBoards: [[], []],
        playerMoves: [[], []],
        state: "playing",
        turn: 0,
      };
      const configuration: BattleshipsConfigurationBoard = [
        ["", "Submarine", "Submarine"],
        ["Submarine", "", "Submarine"],
        ["", "", "Submarine"],
      ];

      const invalid = BattleshipsService.isStartConfigurationInvalid(
        configuration,
        game,
        "Bob"
      );

      expect(invalid).toBe("Board dimensions don't match the game (1,3)");
    });
  });
  describe("setWinner fn", () => {
    test("sets game.winner and state finished", () => {
      const game: BattleshipsGame = {
        gameId: "",
        boardDimensions: [1, 3],
        playerUsernames: ["Rob", "Yin"],
        playerBoards: [[[-1, -1, -1]], [[-1, -1, -1]]],
        playerMoves: [[], []],
        state: "playing",
        turn: 0,
      };

      const changedGame = BattleshipsService.setWinner(game, "Rob");

      expect(changedGame).toEqual({
        gameId: "",
        boardDimensions: [1, 3],
        playerUsernames: ["Rob", "Yin"],
        playerBoards: [[[-1, -1, -1]], [[-1, -1, -1]]],
        playerMoves: [[], []],
        state: "finished",
        winner: "Rob",
        turn: 0,
      });
    });
  });
  describe("isFleetSunk fn", () => {
    test("fleet is not sunk 1d grid", () => {
      expect(
        BattleshipsService.isFleetSunk(
          {
            gameId: "",
            boardDimensions: [1, 3],
            playerUsernames: ["Rob", "Yin"],
            playerBoards: [[[-1, -1, -1]], [[-1, -1, -1]]],
            playerMoves: [[], []],
            state: "playing",
            turn: 0,
          },
          {
            configuration: [["", "Submarine", "Submarine"]],
            gameId: "",
            username: "",
          }
        )
      ).toBe(false);
    });
    test("fleet is sunk 1d grid", () => {
      expect(
        BattleshipsService.isFleetSunk(
          {
            gameId: "",
            boardDimensions: [1, 3],
            playerUsernames: ["Rob", "Yin"],
            playerBoards: [[[-1, -1, -1]], [[-1, 1, 1]]],
            playerMoves: [[], []],
            state: "playing",
            turn: 0,
          },
          {
            configuration: [["", "Submarine", "Submarine"]],
            gameId: "",
            username: "",
          }
        )
      ).toBe(true);
    });

    test("fleet is sunk when there are no ships", () => {
      expect(
        BattleshipsService.isFleetSunk(
          {
            gameId: "",
            boardDimensions: [1, 3],
            playerUsernames: ["Rob", "Yin"],
            playerBoards: [
              [
                [-1, -1, -1],
                [-1, 0, 0],
                [-1, 0, 0],
              ],
              [
                [0, 0, 0],
                [0, 0, 0],
                [-1, -1, -1],
              ],
            ],
            playerMoves: [[], []],
            state: "playing",
            turn: 0,
          },
          {
            configuration: [
              ["", "", ""],
              ["", "", ""],
              ["", "", ""],
            ],
            gameId: "",
            username: "",
          }
        )
      ).toBe(true);
    });

    test("fleet is sunk when there is no configuration", () => {
      expect(
        BattleshipsService.isFleetSunk(
          {
            gameId: "",
            boardDimensions: [1, 3],
            playerUsernames: ["Rob", "Yin"],
            playerBoards: [
              [
                [-1, -1, -1],
                [-1, 0, 0],
                [-1, 0, 0],
              ],
              [
                [0, 0, 0],
                [0, 0, 0],
                [-1, -1, -1],
              ],
            ],
            playerMoves: [[], []],
            state: "playing",
            turn: 0,
          },
          {
            configuration: [],
            gameId: "",
            username: "",
          }
        )
      ).toBe(true);
    });

    test("fleet is sunk when there are no player boards", () => {
      expect(
        BattleshipsService.isFleetSunk(
          {
            gameId: "",
            boardDimensions: [1, 3],
            playerUsernames: ["Rob", "Yin"],
            playerBoards: [[], []],
            playerMoves: [[], []],
            state: "playing",
            turn: 0,
          },
          {
            configuration: [],
            gameId: "",
            username: "",
          }
        )
      ).toBe(true);
    });

    test("fleet is not sunk 2d grid", () => {
      expect(
        BattleshipsService.isFleetSunk(
          {
            gameId: "",
            boardDimensions: [1, 3],
            playerUsernames: ["Rob", "Yin"],
            playerBoards: [
              [
                [-1, -1, -1],
                [-1, 0, 0],
                [-1, 0, 0],
              ],
              [
                [0, 1, 1],
                [1, 0, 1],
                [-1, -1, -1],
              ],
            ],
            playerMoves: [[], []],
            state: "playing",
            turn: 0,
          },
          {
            configuration: [
              ["", "Submarine", "Submarine"],
              ["Submarine", "", "Submarine"],
              ["", "", "Submarine"],
            ],
            gameId: "",
            username: "",
          }
        )
      ).toBe(false);
    });

    test("fleet is sunk 2d grid", () => {
      expect(
        BattleshipsService.isFleetSunk(
          {
            gameId: "",
            boardDimensions: [1, 3],
            playerUsernames: ["Rob", "Yin"],
            playerBoards: [
              [
                [-1, -1, -1],
                [-1, 0, 0],
              ],
              [
                [0, 1, 1],
                [1, 0, 1],
                [-1, -1, 1],
              ],
            ],
            playerMoves: [[], []],
            state: "playing",
            turn: 0,
          },
          {
            configuration: [
              ["", "Submarine", "Submarine"],
              ["Submarine", "", "Submarine"],
              ["", "", "Submarine"],
            ],
            gameId: "",
            username: "",
          }
        )
      ).toBe(true);
    });
  });
});
