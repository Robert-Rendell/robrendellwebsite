import AWS from 'aws-sdk';

AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_REGION || 'eu-west-1',
});

export default class ConfigService {
  static get SudokuSubmissionsDynamoDbTable(): string {
    return process.env.SUDOKU_SUBMISSIONS_DYNAMO_DB_TABLE || '';
  }

  static get SudokuSolversDynamoDbTable(): string {
    return process.env.SUDOKU_SOLVERS_DYNAMO_DB_TABLE || '';
  }

  static get SudokuDynamoDbTable(): string {
    return process.env.SUDOKU_DYNAMO_DB_TABLE || '';
  }

  static get HomePageDynamoDbTable(): string {
    return process.env.HOME_PAGE_DYNAMO_DB_TABLE || '';
  }

  static get HomePageImageBucket(): string {
    return process.env.IMAGE_BUCKET || '';
  }

  static get SudokuGenerateJsonBucket(): string {
    return process.env.SUDOKU_GEN_BUCKET_JSON || '';
  }
}
