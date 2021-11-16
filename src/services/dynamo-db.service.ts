import * as AWS from 'aws-sdk';
import { AttributeMap, GetItemInput } from 'aws-sdk/clients/dynamodb';
import ConfigService from './config.service';

export default class DynamoDBService {
  static ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

  public static async save() {
    const params = {
      TableName: ConfigService.HomePageDynamoDbTable,
      Item: {
        CUSTOMER_ID: { N: '001' },
        CUSTOMER_NAME: { S: 'Richard Roe' },
      },
    };

    // Call DynamoDB to add the item to the table
    DynamoDBService.ddb.putItem(params, (err, data) => {
      if (err) {
        console.log('Error', err);
      } else {
        console.log('Success', data);
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
