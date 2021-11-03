import AWS from 'aws-sdk';

AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  // region: process.env.AWS_REGION, - not sure if I need this yet, eu-west-1
});

export default class ConfigService {
  static get HomePageDynamoDbTable(): string {
    return process.env.HOME_PAGE_DYNAMO_DB_TABLE || '';
  }

  static get HomePageImageBucket(): string {
    return process.env.IMAGE_BUCKET || '';
  }
}
