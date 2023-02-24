import AWS from "aws-sdk";
import { QueryInput } from "aws-sdk/clients/dynamodb";
import { ConfigService } from "../../../services/config.service";
import DynamoDBService from "../../../services/dynamo-db.service";
import { EmailService } from "../../../services/email.service";
import { Submission } from "../models/submission";
import { SudokuId } from "../models/sudoku";

export default class SubmissionsDynamoDbService extends DynamoDBService {
  private static PartitionKey = "submissionId";
  private static GSI = {
    SudokuId: "sudokuId-index",
  };

  private static isCompletedSubmission(submission: Submission): boolean {
    return Boolean(submission.timeTakenMs);
  }

  public static async saveSubmission(submission: Submission): Promise<void> {
    const marshalled = AWS.DynamoDB.Converter.marshall(submission);
    super.save(ConfigService.SudokuSubmissionsDynamoDbTable, marshalled);
    if (SubmissionsDynamoDbService.isCompletedSubmission(submission)) {
      EmailService.send({
        subject: "[robrendellwebsite] Sudoku completed!",
        text:
          `${submission.submitterName} - ${submission.ipAddress}` +
          ` - Sudoku Id: [${submission.sudokuId} - ` +
          `<a href="${ConfigService.AppHost}/sudoku/play/${submission.sudokuId}>Play now</a>]`,
      });
    }
  }

  public static async getSubmission(
    key: string
  ): Promise<Submission | undefined> {
    const attributeMap = await super.load(
      ConfigService.SudokuSubmissionsDynamoDbTable,
      SubmissionsDynamoDbService.PartitionKey,
      key
    );
    if (!attributeMap) return undefined;
    return AWS.DynamoDB.Converter.unmarshall(attributeMap) as Submission;
  }

  public static async getCompletedSubmissionsForSudoku(
    sudokuId: SudokuId
  ): Promise<Submission[] | undefined> {
    const params: QueryInput = {
      TableName: ConfigService.SudokuSubmissionsDynamoDbTable,
      IndexName: SubmissionsDynamoDbService.GSI.SudokuId,
      KeyConditionExpression: "sudokuId = :sudoku_id",
      ExpressionAttributeValues: {
        ":sudoku_id": { S: sudokuId },
        ":completedSubmissions": { BOOL: true },
      },
      FilterExpression: "complete = :completedSubmissions",
      ProjectionExpression: "timeTakenMs, dateSubmitted, submitterName",
      ScanIndexForward: false,
    };

    const result = await this.ddb.query(params).promise();
    return result.Items?.map(
      (item) => AWS.DynamoDB.Converter.unmarshall(item) as Submission
    );
  }
}
