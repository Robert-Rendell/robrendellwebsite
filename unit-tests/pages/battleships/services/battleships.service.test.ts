import { BattleshipsService } from "../../../../src/pages/battleships/services/battleships.service";

describe("BattleshipsService", () => {
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
            configuration: [
            ],
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
            configuration: [
            ],
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
