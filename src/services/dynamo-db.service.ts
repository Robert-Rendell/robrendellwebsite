import * as AWS from 'aws-sdk';
import { AttributeMap, GetItemInput } from 'aws-sdk/clients/dynamodb';

export default class DynamoDBService {
  static ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

  public static async save(tableName: string, item: AttributeMap) {
    const params = {
      TableName: tableName,
      Item: item,
    };

    DynamoDBService.ddb.putItem(params, (err, data) => {
      if (err) {
        console.error(`Failed! Could not save to DynamoDB table (${tableName}):`, err);
      } else {
        console.log(`Success! Saved to DynamoDB table (${tableName}):`, item);
      }
    });
  }

  public static async load(
    tableName: string,
    primaryKeyName: string,
    key: string,
  ): Promise<AttributeMap | undefined> {
    console.log(`LOADING FROM DYNAMODB: ${tableName}, ${primaryKeyName}, ${key}`);
    const params: GetItemInput = {
      TableName: tableName,
      Key: {
        [primaryKeyName]: { S: key },
      },
      // ProjectionExpression: 'ATTRIBUTE_NAME',
    };
    console.log(JSON.stringify(params));
    const response = await DynamoDBService.ddb.getItem(params).promise().catch((e) => {
      console.error(e);
    });
    console.log(response);
    if (!response) return undefined;
    return response.Item;
  }
}
