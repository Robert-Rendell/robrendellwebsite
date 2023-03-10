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

    test("fleet is not sunk", () => {
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
              ["", "Carrier", "Carrier"],
              ["Carrier", "", "Carrier"],
              ["", "", "Carrier"],
            ],
            gameId: "",
            username: "",
          }
        )
      ).toBe(false);
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
