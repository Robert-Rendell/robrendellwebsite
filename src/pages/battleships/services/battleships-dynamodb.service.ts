import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import {
  BattleshipsGame,
  BattleshipsUser,
  BattleshipsStartConfiguration,
} from "robrendellwebsite-common";
import { ConfigService } from "../../../services/config.service";
import DynamoDBService from "../../../services/dynamo-db.service";

export default class BattleshipsDynamoDbService extends DynamoDBService {
  private static PartitionKey = "gameId";
  private static UserPartitionKey = "username";
  private static SortKey = "username";

  public static async saveStartConfiguration(
    startConfiguration: BattleshipsStartConfiguration
  ): Promise<void> {
    const marshalled = AWS.DynamoDB.Converter.marshall(startConfiguration);
    await super.save(ConfigService.BattleshipsStartDynamoDbTable, marshalled);
  }

  public static async saveGame(game: BattleshipsGame) {
    const newGame: BattleshipsGame = {
      ...game,
      gameId: game.gameId || uuidv4(),
    };
    const marshalled = AWS.DynamoDB.Converter.marshall(newGame);
    await super.save(ConfigService.BattleshipsGameDynamoDbTable, marshalled);
    return newGame;
  }

  public static async saveUser(user: BattleshipsUser): Promise<void> {
    const marshalled = AWS.DynamoDB.Converter.marshall(user);
    await super.save(ConfigService.BattleshipsUserDynamoDbTable, marshalled);
  }

  public static async loadStartConfiguration(
    gameId: string,
    username: string
  ): Promise<BattleshipsStartConfiguration | undefined> {
    const attributeMap = await super.load(
      ConfigService.BattleshipsStartDynamoDbTable,
      BattleshipsDynamoDbService.PartitionKey,
      gameId,
      BattleshipsDynamoDbService.SortKey,
      username
    );
    if (!attributeMap) return undefined;
    return AWS.DynamoDB.Converter.unmarshall(
      attributeMap
    ) as BattleshipsStartConfiguration;
  }

  public static async loadGame(
    key: string
  ): Promise<BattleshipsGame | undefined> {
    const attributeMap = await super.load(
      ConfigService.BattleshipsGameDynamoDbTable,
      BattleshipsDynamoDbService.PartitionKey,
      key
    );
    if (!attributeMap) return undefined;
    return AWS.DynamoDB.Converter.unmarshall(attributeMap) as BattleshipsGame;
  }

  public static async loadUser(
    key: string
  ): Promise<BattleshipsUser | undefined> {
    const attributeMap = await super.load(
      ConfigService.BattleshipsUserDynamoDbTable,
      BattleshipsDynamoDbService.UserPartitionKey,
      key
    );
    if (!attributeMap) return undefined;
    return AWS.DynamoDB.Converter.unmarshall(attributeMap) as BattleshipsUser;
  }
}
