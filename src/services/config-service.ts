export default class ConfigService {
  static getHomePageImageBucket(): string {
    return process.env.IMAGE_BUCKET || '';
  }
}
