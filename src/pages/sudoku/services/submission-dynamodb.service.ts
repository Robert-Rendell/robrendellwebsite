import AWS from 'aws-sdk';
import ConfigService from '../../../services/config.service';
import DynamoDBService from '../../../services/dynamo-db.service';
import { Submission } from '../models/submission';

export default class SubmissionsDynamoDbService extends DynamoDBService {
  private static PartitionKey = 'submissionId';

  public static async saveSubmission(submission: Submission): Promise<void> {
    const marshalled = AWS.DynamoDB.Converter.marshall(submission);
    super.save(ConfigService.SudokuSubmissionsDynamoDbTable, marshalled);
  }
}
