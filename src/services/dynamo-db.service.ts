import * as AWS from 'aws-sdk';
import ConfigService from './config-service';

export default class DynamoDBService {
  private ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

  public async save() {
    const params = {
      TableName: ConfigService.HomePageDynamoDbTable,
      Item: {
        CUSTOMER_ID: { N: '001' },
        CUSTOMER_NAME: { S: 'Richard Roe' },
      },
    };

    // Call DynamoDB to add the item to the table
    this.ddb.putItem(params, (err, data) => {
      if (err) {
        console.log('Error', err);
      } else {
        console.log('Success', data);
      }
    });
  }

  public async load() {
    const params = {
      TableName: ConfigService.HomePageDynamoDbTable,
      Key: {
        KEY_NAME: { N: '001' },
      },
      ProjectionExpression: 'ATTRIBUTE_NAME',
    };

    // Call DynamoDB to read the item from the table
    this.ddb.getItem(params, (err, data) => {
      if (err) {
        console.log('Error', err);
      } else {
        console.log('Success', data.Item);
      }
    });
  }
}
