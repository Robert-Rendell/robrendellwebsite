import AWS from 'aws-sdk';
import FeatureFlags from '../models/feature-flags';
import { UniDataEnvVars } from '../pages/technical-tests/uni-data-291121/models/uni-data-env-vars';

AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_REGION || 'eu-west-1',
});

export default class ConfigService {
  static get FeatureFlags(): FeatureFlags {
    return {
      sudokuGenerationEnabled: (process.env.SUDOKU_GEN_FEATURE_ENABLED === 'true') || false,
    };
  }

  static get TechnicalTestUniDataConfig(): UniDataEnvVars {
    return {
      bucket: process.env.S3_BUCKET_TT_291121 || '',
      submissionsFile: process.env.S3_BUCKET_FILE_TT_291121_SUBMISSIONS || '',
      institutionsFile: process.env.S3_BUCKET_FILE_TT_291121_INSTITUTIONS || '',
    };
  }

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
