import { Request, Response } from "express";
import {
  BattleshipsErrorResponse,
  BattleshipsGame,
  BattleshipsGameNotFound,
  BattleshipsInternalServerError,
  BattleshipsStartConfiguration,
  BattleshipsUser,
  GetGameStateRequest,
  GetStartConfigurationRequest,
  GetUserRequest,
} from "robrendellwebsite-common";
import BattleshipsDynamoDbService from "./services/battleships-dynamodb.service";

export class BattleshipsAPI {
  static Routes = {
    /**
     * POST
     */
    MakeMove: "/battleships/game/:gameId/move",
    /**
     * GET
     */
    GameState: "/battleships/game/:gameId",
    /**
     * GET, POST
     */
    User: "/battleships/user/:username",
    /**
     * GET, POST
     */
    StartConfiguration: "/battleships/game/:gameId/start-configuration",
  };

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

  static async getStartConfiguration(
    req: Request<GetStartConfigurationRequest>,
    res: Response<BattleshipsStartConfiguration | BattleshipsErrorResponse>
  ): Promise<void> {
    try {
      const user = await BattleshipsDynamoDbService.loadStartConfiguration(
        req.params.gameId
      );
      if (!user) {
        res.status(404).send(BattleshipsGameNotFound(req.params.gameId));
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
}
