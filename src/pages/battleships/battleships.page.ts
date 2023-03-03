import { Request, Response } from "express";
import {
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
  BattleshipsStartConfigurationNotFound,
} from "./errors";
import BattleshipsDynamoDbService from "./services/battleships-dynamodb.service";
import { BattleshipsService } from "./services/battleships.service";

export class BattleshipsAPI {
  static Routes = {
    POST: {
      MakeMove: "/battleships/game/:gameId/move",
      User: "/battleships/user/:username",
      StartConfiguration: "/battleships/game/:gameId/start-configuration",
    },
    GET: {
      GameState: "/battleships/game/:gameId",
      User: "/battleships/user/:username",
      StartConfiguration: "/battleships/game/:gameId/start-configuration",
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
      if (
        !BattleshipsService.isValidMove(
          req.body.move,
          req.body.username,
          gameState
        )
      ) {
        res.status(400).send(BattleshipsGameNotFound(req.params.gameId));
        return;
      }

      const newGameState = BattleshipsService.makeMove(
        req.body.move,
        gameState
      );

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

  static async getUser(
    req: Request<GetUserRequest>,
    res: Response<BattleshipsUser | BattleshipsErrorResponse>
  ): Promise<void> {
    try {
      const user = await BattleshipsDynamoDbService.loadUser(
        req.params.username
      );
      if (!user) {
        res.status(404).send(BattleshipsGameNotFound(req.params.username));
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
      const startConfiguration =
        await BattleshipsDynamoDbService.loadStartConfiguration(
          req.params.gameId
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
    res: Response<BattleshipsStartConfiguration | BattleshipsErrorResponse>
  ): Promise<void> {
    try {
      await BattleshipsDynamoDbService.saveStartConfiguration(req.body);
      res.status(200).send(req.body);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .send(BattleshipsInternalServerError((e as Error).message));
    }
  }
}
