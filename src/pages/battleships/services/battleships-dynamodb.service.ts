import AWS from "aws-sdk";
import {
  BattleshipsGame,
  BattleshipsStartConfiguration,
  BattleshipsUser,
} from "robrendellwebsite-common";
import { ConfigService } from "../../../services/config.service";
import DynamoDBService from "../../../services/dynamo-db.service";

export default class BattleshipsDynamoDbService extends DynamoDBService {
  private static PartitionKey = "gameId";
  private static UserPartitionKey = "username";

  public static async saveStartConfiguration(
    startConfiguration: BattleshipsStartConfiguration
  ): Promise<void> {
    const marshalled = AWS.DynamoDB.Converter.marshall(startConfiguration);
    super.save(ConfigService.BattleshipsStartDynamoDbTable, marshalled);
  }

  public static async saveGame(game: BattleshipsGame): Promise<void> {
    const marshalled = AWS.DynamoDB.Converter.marshall(game);
    super.save(ConfigService.BattleshipsGameDynamoDbTable, marshalled);
  }

  public static async saveUser(user: BattleshipsUser): Promise<void> {
    const marshalled = AWS.DynamoDB.Converter.marshall(user);
    super.save(ConfigService.BattleshipsUserDynamoDbTable, marshalled);
  }

  public static async loadStartConfiguration(
    key: string
  ): Promise<BattleshipsGame | undefined> {
    const attributeMap = await super.load(
      ConfigService.BattleshipsStartDynamoDbTable,
      BattleshipsDynamoDbService.PartitionKey,
      key
    );
    if (!attributeMap) return undefined;
    return AWS.DynamoDB.Converter.unmarshall(attributeMap) as BattleshipsGame;
  }

  public static async loadGame(
    key: string
  ): Promise<BattleshipsStartConfiguration | undefined> {
    const attributeMap = await super.load(
      ConfigService.BattleshipsStartDynamoDbTable,
      BattleshipsDynamoDbService.PartitionKey,
      key
    );
    if (!attributeMap) return undefined;
    return AWS.DynamoDB.Converter.unmarshall(
      attributeMap
    ) as BattleshipsStartConfiguration;
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
