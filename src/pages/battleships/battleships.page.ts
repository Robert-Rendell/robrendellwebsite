import { Request, Response } from "express";
import {
  BattleshipsAPIRoutes,
  BattleshipsGame,
  BattleshipsGameId,
  BattleshipsUsername,
  GetBattleshipsGameResponse,
  GetBattleshipsStartConfigurationResponse,
  GetBattleshipsUserResponse,
  GetGameStateRequest,
  GetStartConfigurationRequest,
  GetUserRequest,
  PostBattleshipsCreateGameResponse,
  PostBattleshipsJoinGameRequest,
  PostBattleshipsJoinGameResponse,
  PostBattleshipsMakeMoveRequest,
  PostBattleshipsMakeMoveResponse,
  PostBattleshipsStartConfigurationResponse,
  PostBattleshipsUserRequest,
  PostBattleshipsUserResponse,
  PostStartConfigurationRequest,
  PostBattleshipsCreateGameRequest
} from "robrendellwebsite-common";
import {
  BattleshipsGameNotFound,
  BattleshipsInternalServerError,
  BattleshipsInvalidGameStateRequest,
  BattleshipsInvalidMove,
  BattleshipsInvalidRequest,
  BattleshipsMissingArgsRequest,
  BattleshipsStartConfigurationNotFound,
  BattleshipsUserNotFound,
} from "./errors";
import BattleshipsDynamoDbService from "./services/battleships-dynamodb.service";
import { BattleshipsService } from "./services/battleships.service";

export class BattleshipsAPI {
  static Routes: BattleshipsAPIRoutes = {
    POST: {
      Join: "/battleships/game/:gameId/join",
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
    req: Request<unknown, unknown, PostBattleshipsMakeMoveRequest>,
    res: Response<PostBattleshipsMakeMoveResponse>
  ): Promise<void> {
    try {
      const gameState = await BattleshipsDynamoDbService.loadGame(
        req.body.gameId
      );

      if (!gameState) {
        res.status(404).send(BattleshipsGameNotFound(req.body.gameId));
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
      if (
        gameState.state === "created" ||
        gameState.state === "configuring" ||
        gameState.state === "finished"
      ) {
        res
          .status(400)
          .send(BattleshipsInvalidGameStateRequest(gameState.state));
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
    res: Response<GetBattleshipsGameResponse>
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

  static async postCreateGame(
    req: Request<
      unknown,
      unknown,
      PostBattleshipsCreateGameRequest
    >,
    res: Response<PostBattleshipsCreateGameResponse>
  ): Promise<void> {
    try {
      if (req.body.gameId) {
        res.status(400).send(BattleshipsInvalidRequest());
        return;
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

  static async postJoinGame(
    req: Request<
      unknown,
      unknown,
      PostBattleshipsJoinGameRequest
    >,
    res: Response<PostBattleshipsJoinGameResponse>
  ): Promise<void> {
    try {
      if (!req.body.gameId) {
        res.status(400).send(BattleshipsMissingArgsRequest("gameId"));
        return;
      }
      if (!req.body.username) {
        res.status(400).send(BattleshipsMissingArgsRequest("username"));
        return;
      }
      const gameState = await BattleshipsDynamoDbService.loadGame(
        req.body.gameId
      );
      if (!gameState) {
        res.status(404).send(BattleshipsGameNotFound(req.body.gameId));
        return;
      }
      const joinable = BattleshipsService.canJoinGame(
        gameState,
        req.body.username
      );
      if (joinable !== true) {
        res.status(400).send(BattleshipsInvalidRequest(joinable));
        return;
      }
      const newState = BattleshipsService.joinGame(
        gameState,
        req.body.username
      );
      await BattleshipsDynamoDbService.saveGame(newState);
      res.status(200).send(newState);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .send(BattleshipsInternalServerError((e as Error).message));
    }
  }

  static async getUser(
    req: Request<GetUserRequest>,
    res: Response<GetBattleshipsUserResponse>
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
    req: Request<unknown, unknown, PostBattleshipsUserRequest>,
    res: Response<PostBattleshipsUserResponse>
  ): Promise<void> {
    try {
      if (!req.body.username) {
        res.status(400).send(BattleshipsMissingArgsRequest("username"));
        return;
      }
      const user = await BattleshipsDynamoDbService.loadUser(req.body.username);
      if (user) {
        res.status(401).send(BattleshipsInvalidRequest());
        return;
      }
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
    res: Response<GetBattleshipsStartConfigurationResponse>
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
    req: Request<unknown, unknown, PostStartConfigurationRequest>,
    res: Response<PostBattleshipsStartConfigurationResponse>
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
      const gameState = await BattleshipsDynamoDbService.loadGame(
        req.body.gameId
      );
      if (!gameState) {
        res.status(404).send(BattleshipsGameNotFound(req.body.gameId));
        return;
      }
      if (gameState.state !== "configuring") {
        res
          .status(400)
          .send(BattleshipsInvalidGameStateRequest(gameState.state));
        return;
      }
      const invalidReason = BattleshipsService.isStartConfigurationInvalid(
        req.body.configuration,
        gameState,
        req.body.username
      );
      if (invalidReason) {
        res
          .status(400)
          .send(
            BattleshipsInvalidRequest(
              `Start configuration isn't valid. ${invalidReason}`
            )
          );
        return;
      }
      await BattleshipsDynamoDbService.saveStartConfiguration(req.body);
      BattleshipsAPI.processStartConfiguration(
        gameState,
        req.body.gameId,
        req.body.username
      );
      res.status(200).send(req.body);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .send(BattleshipsInternalServerError((e as Error).message));
    }
  }

  private static processStartConfiguration(
    gameState: BattleshipsGame,
    gameId: BattleshipsGameId,
    username: BattleshipsUsername
  ) {
    BattleshipsDynamoDbService.loadStartConfiguration(
      gameId,
      BattleshipsService.getOpponentUsername(gameState, username)
    ).then((opponentConfiguration) => {
      if (opponentConfiguration) {
        const newState =
          BattleshipsService.setPlayersConfigurationComplete(gameState);
        BattleshipsDynamoDbService.saveGame(newState);
      }
    });
  }
}
