import { BattleshipsService } from "../../../../src/pages/battleships/services/battleships.service";

describe("BattleshipsService", () => {
  describe("isFleetSunk fn", () => {
    test("fleet is sunk returns true", () => {
      expect(
        BattleshipsService.isFleetSunk(
          {
            gameId: "",
            boardDimensions: [1, 3],
            playerUsernames: ["Rob", "Yin"],
            playerBoards: [[[-1, -1, -1]], [[-1, -1, -1]]],
            playerMoves: [[], []],
            state: "playing",
            turn: 0
          }, {
            configuration: [["", "Ship", "Ship"]] as any,
            gameId: "",
            username: ""
          },
        ),
      ).toBe(false);
    });
  });
});
