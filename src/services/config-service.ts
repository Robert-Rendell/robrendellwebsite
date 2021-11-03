import AWS from 'aws-sdk';

AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export default class ConfigService {
  static getHomePageImageBucket(): string {
    return process.env.IMAGE_BUCKET || '';
  }
}
