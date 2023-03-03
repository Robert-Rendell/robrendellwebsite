import { Request, Response } from "express";
import {
  BattleshipsBoard,
  BattleshipsErrorResponse,
  BattleshipsGame,
  BattleshipsStartConfiguration,
  BattleshipsUser,
  GetGameStateRequest,
  GetStartConfigurationRequest,
  GetUserRequest,
  PostBattleshipsMakeMoveRequest,
  PostBattleshipsMakeMoveResponse,
  PostBattleshipsUserRequest,
  PostStartConfigurationRequest,
} from "robrendellwebsite-common";
import {
  BattleshipsGameNotFound,
  BattleshipsInternalServerError,
  BattleshipsInvalidMove,
  BattleshipsInvalidRequest,
  BattleshipsMissingArgsRequest,
  BattleshipsStartConfigurationNotFound,
  BattleshipsUserNotFound,
} from "./errors";
import BattleshipsDynamoDbService from "./services/battleships-dynamodb.service";
import { BattleshipsService } from "./services/battleships.service";

export class BattleshipsAPI {
  static Routes = {
    POST: {
      Create: "/battleships/game/new",
      MakeMove: "/battleships/game/:gameId/move",
      User: "/battleships/user/:username",
      StartConfiguration:
        "/battleships/game/:gameId/start-configuration/:username",
    },
    GET: {
      GameState: "/battleships/game/:gameId",
      User: "/battleships/user/:username",
      StartConfiguration:
        "/battleships/game/:gameId/start-configuration/:username",
    },
  };

  static async postMakeMove(
    req: Request<
      Pick<BattleshipsGame, "gameId">,
      unknown,
      PostBattleshipsMakeMoveRequest
    >,
    res: Response<PostBattleshipsMakeMoveResponse>
  ): Promise<void> {
    try {
      const gameState = await BattleshipsDynamoDbService.loadGame(
        req.params.gameId
      );

      if (!gameState) {
        res.status(404).send(BattleshipsGameNotFound(req.params.gameId));
        return;
      }
      if (!req.body.username) {
        res.status(400).send(BattleshipsMissingArgsRequest("username"));
        return;
      }
      if (!req.body.move?.coords || !req.body.move?.datetime) {
        res.status(400).send(BattleshipsMissingArgsRequest("move"));
        return;
      }
      const invalidReason = BattleshipsService.isInvalidMove(
        req.body.move,
        req.body.username,
        gameState
      );
      if (invalidReason) {
        res
          .status(400)
          .send(BattleshipsInvalidMove(req.body.move, invalidReason));
        return;
      }

      const newGameState = BattleshipsService.makeMove(
        req.body.move,
        gameState
      );

      await BattleshipsDynamoDbService.saveGame(newGameState);

      res.status(200).send(newGameState);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .send(BattleshipsInternalServerError((e as Error).message));
    }
  }

  static async getGameState(
    req: Request<GetGameStateRequest>,
    res: Response<BattleshipsGame | BattleshipsErrorResponse>
  ): Promise<void> {
    try {
      const gameState = await BattleshipsDynamoDbService.loadGame(
        req.params.gameId
      );
      await BattleshipsDynamoDbService.loadStartConfiguration(
        req.params.gameId,
        req.params.username
      );
      if (!gameState) {
        res.status(404).send(BattleshipsGameNotFound(req.params.gameId));
        return;
      }
      res.status(200).send(gameState);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .send(BattleshipsInternalServerError((e as Error).message));
    }
  }

  static async postCreateGame(
    req: Request<
      unknown,
      unknown,
      Pick<BattleshipsGame, "gameId" | "boardDimensions"> &
        Pick<BattleshipsUser, "username">
    >,
    res: Response<BattleshipsGame | BattleshipsErrorResponse>
  ): Promise<void> {
    try {
      if (req.body.gameId) {
        res.status(400).send(BattleshipsInvalidRequest());
      }
      const newGame = await BattleshipsDynamoDbService.saveGame({
        boardDimensions: req.body.boardDimensions || [10, 10],
        playerBoards: [[], []],
        playerUsernames: [req.body.username, ""],
        playerMoves: [[], []],
        state: "created",
        turn: 0,
        gameId: "",
      });
      res.status(200).send(newGame);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .send(BattleshipsInternalServerError((e as Error).message));
    }
  }

  static async getUser(
    req: Request<GetUserRequest>,
    res: Response<BattleshipsUser | BattleshipsErrorResponse>
  ): Promise<void> {
    try {
      const user = await BattleshipsDynamoDbService.loadUser(
        req.params.username
      );
      if (!user) {
        res.status(404).send(BattleshipsUserNotFound(req.params.username));
        return;
      }
      res.status(200).send(user);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .send(BattleshipsInternalServerError((e as Error).message));
    }
  }

  static async postUser(
    req: Request<
      Pick<BattleshipsUser, "username">,
      unknown,
      PostBattleshipsUserRequest
    >,
    res: Response<BattleshipsUser | BattleshipsErrorResponse>
  ): Promise<void> {
    try {
      await BattleshipsDynamoDbService.saveUser(req.body);
      res.status(200).send(req.body);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .send(BattleshipsInternalServerError((e as Error).message));
    }
  }

  static async getStartConfiguration(
    req: Request<GetStartConfigurationRequest>,
    res: Response<BattleshipsStartConfiguration | BattleshipsErrorResponse>
  ): Promise<void> {
    try {
      if (!req.params.gameId) {
        res.status(400).send(BattleshipsMissingArgsRequest("gameId"));
        return;
      }
      if (!req.params.username) {
        res.status(400).send(BattleshipsMissingArgsRequest("username"));
        return;
      }
      const startConfiguration =
        await BattleshipsDynamoDbService.loadStartConfiguration(
          req.params.gameId,
          req.params.username
        );
      if (!startConfiguration) {
        res
          .status(404)
          .send(BattleshipsStartConfigurationNotFound(req.params.gameId));
        return;
      }
      res.status(200).send(startConfiguration);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .send(BattleshipsInternalServerError((e as Error).message));
    }
  }

  static async postStartConfiguration(
    req: Request<
      Pick<BattleshipsGame, "gameId">,
      unknown,
      PostStartConfigurationRequest
    >,
    res: Response<BattleshipsBoard | BattleshipsErrorResponse>
  ): Promise<void> {
    try {
      if (!req.body.configuration) {
        res.status(400).send(BattleshipsMissingArgsRequest("configuration"));
        return;
      }
      if (!req.body.gameId) {
        res.status(400).send(BattleshipsMissingArgsRequest("gameId"));
        return;
      }
      if (!req.body.username) {
        res.status(400).send(BattleshipsMissingArgsRequest("username"));
        return;
      }
      await BattleshipsDynamoDbService.saveStartConfiguration(req.body);
      res.status(200).send(req.body.configuration);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .send(BattleshipsInternalServerError((e as Error).message));
    }
  }
}
