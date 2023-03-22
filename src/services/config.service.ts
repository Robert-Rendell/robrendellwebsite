import AWS from "aws-sdk";
import { EnvVar } from "../enums/env-vars.enum";
import FeatureFlags from "../models/feature-flags";
import { UniDataEnvVars } from "../pages/technical-tests/uni-data-291121/models/uni-data-env-vars";

AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_REGION || "eu-west-1",
});
export class ConfigService {
  static get FeatureFlags(): FeatureFlags {
    return {
      sudokuGenerationEnabled:
        process.env.SUDOKU_GEN_FEATURE_ENABLED === "true" || false,
    };
  }

  private static GetEnvVar(envVar: EnvVar) {
    const envVarName = EnvVar[envVar];
    const envVarValue = process.env[envVarName];
    if (typeof envVarValue !== "undefined") return envVarValue;
    console.error("--------------------------------------");
    console.error("[ERROR] Missing env var:", envVarName);
    console.error("--------------------------------------");
    console.error("Stopped the server... press [Ctrl] + [C] to exit.");
    return process.exit(1);
  }

  static get TechnicalTestUniDataConfig(): UniDataEnvVars {
    return {
      bucket: ConfigService.GetEnvVar(EnvVar.S3_BUCKET_TT_291121),
      submissionsFile: ConfigService.GetEnvVar(
        EnvVar.S3_BUCKET_FILE_TT_291121_SUBMISSIONS
      ),
      institutionsFile: ConfigService.GetEnvVar(
        EnvVar.S3_BUCKET_FILE_TT_291121_INSTITUTIONS
      ),
    };
  }

  static get Port(): string {
    return ConfigService.GetEnvVar(EnvVar.PORT);
  }

  static get ApiHost(): string {
    return ConfigService.GetEnvVar(EnvVar.API_HOST);
  }

  static get AppHost(): string {
    return ConfigService.GetEnvVar(EnvVar.APP_HOST);
  }

  static get MyPublicIpAddress(): string {
    return ConfigService.GetEnvVar(EnvVar.MY_PUBLIC_IP_ADDRESS);
  }

  static get BlockedIpAddresses(): string {
    return ConfigService.GetEnvVar(EnvVar.BLOCKED_IPS);
  }

  static get SudokuGenSecurityKey(): string {
    return ConfigService.GetEnvVar(EnvVar.SUDOKU_GEN_SECURITY_KEY);
  }

  static get SudokuSubmissionsDynamoDbTable(): string {
    return ConfigService.GetEnvVar(EnvVar.SUDOKU_SUBMISSIONS_DYNAMO_DB_TABLE);
  }

  static get SudokuSolversDynamoDbTable(): string {
    return ConfigService.GetEnvVar(EnvVar.SUDOKU_SOLVERS_DYNAMO_DB_TABLE);
  }

  static get SudokuDynamoDbTable(): string {
    return ConfigService.GetEnvVar(EnvVar.SUDOKU_DYNAMO_DB_TABLE);
  }

  static get BattleshipsGameDynamoDbTable(): string {
    return ConfigService.GetEnvVar(EnvVar.BATTLESHIPS_GAME_DYNAMO_DB_TABLE);
  }

  static get BattleshipsStartDynamoDbTable(): string {
    return ConfigService.GetEnvVar(EnvVar.BATTLESHIPS_START_DYNAMO_DB_TABLE);
  }

  static get BattleshipsUserDynamoDbTable(): string {
    return ConfigService.GetEnvVar(EnvVar.BATTLESHIPS_USER_DYNAMO_DB_TABLE);
  }

  static get HomePageDynamoDbTable(): string {
    return ConfigService.GetEnvVar(EnvVar.HOME_PAGE_DYNAMO_DB_TABLE);
  }

  static get HomePageImageBucket(): string {
    return ConfigService.GetEnvVar(EnvVar.IMAGE_BUCKET);
  }

  static get PageViewsDynamoDbTable(): string {
    return ConfigService.GetEnvVar(EnvVar.PAGE_VIEWS_DYNAMO_DB_TABLE);
  }

  static get PhotosIveTakenImageBucket(): string {
    return ConfigService.GetEnvVar(EnvVar.PHOTOS_TAKEN_IMAGE_BUCKET);
  }

  static get SudokuGenerateJsonBucket(): string {
    return ConfigService.GetEnvVar(EnvVar.SUDOKU_GEN_BUCKET_JSON);
  }

  static get PublicBucket(): string {
    return ConfigService.GetEnvVar(EnvVar.PUBLIC_BUCKET);
  }

  static get KnockKnockSecurityKey(): string {
    return ConfigService.GetEnvVar(EnvVar.KNOCK_KNOCK_SECURITY_KEY);
  }

  static get EmailServiceEmail(): string {
    return ConfigService.GetEnvVar(EnvVar.EMAIL_SERVICE_EMAIL);
  }

  static get EmailServicePass(): string {
    return ConfigService.GetEnvVar(EnvVar.EMAIL_SERVICE_PASS);
  }

  static get EmailServiceEmailTarget(): string {
    return ConfigService.GetEnvVar(EnvVar.EMAIL_SERVICE_EMAIL_TARGET);
  }
}
