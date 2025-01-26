import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  ErrorResponse,
  PostGenerateSudokuCallbackRequest,
  Submission,
  ExtendedSubmission,
  SudokuLeaderboardResponse,
} from "robrendellwebsite-common";
import { IPAddressService } from "../../services/ip-address.service";
import S3BucketService from "../../services/s3-bucket.service";
import SudokuDynamoDBService from "./services/sudoku-dynamodb.service";
import SudokuValidatorService from "./services/sudoku-validator.service";
import SubmissionsDynamoDbService from "./services/submission-dynamodb.service";
import { ConfigService } from "../../services/config.service";
import { Sudoku } from "./models/sudoku";
import PostSubmissionRequest from "./requests/submission.post";
import {
  SudokuResponse,
  SudokuNotFoundResponse,
  SudokuInternalServerError,
} from "./response/sudoku.response";
import {
  ExtendedSubmitSudokuResponse,
  SubmitSudokuInternalServerError,
  SubmitSudokuNotFoundError,
} from "./response/submit-sudoku.response";
import GetSudokuRequest from "./requests/sudoku.get";
import SudokuPuzzle from "./models/sudoku-puzzle";
import SudokuValidation from "./models/sudoku-validation";
import SudokuDifficulty from "./enums/sudoku-difficulty";
import PostGenerateSudokuRequest from "./requests/generate.post";
import GenerateSudokuResponse from "./response/generate.response";
import GenerateSudokuJson from "./models/generate-sudoku-json";
import { PostSudokuListRequest } from "./requests/sudoku-list.post";
import { SudokuListResponse } from "./response/sudoku-list.response";
import { ListSudokuParams } from "./models/params/list-sudoku-params";
import GetSudokuLeaderboardRequest from "./requests/sudoku-leaderboard.get";
import { SudokuDto } from "./models/sudoku.dto";

class SudokuAPI {
  static Routes = {
    getSudoku: "/sudoku/play/:sudokuId",
    getSudokuLeaderboard: "/sudoku/leaderboard/:sudokuId",
    postSudokuList: "/sudoku/list",
    postSubmission: "/sudoku/submit",
    postGenerateSudoku: "/sudoku/add",
    postGenerateSudokuCallback: "/sudoku/add/callback",
  };

  /**
   * Use DynamoDB Service to create a sudoku submission in DynamoDB
   */
  private static createSubmission(
    req: Request,
    sudoku: Sudoku,
    opts?: {
      submissionPuzzle?: SudokuPuzzle;
      validation?: SudokuValidation;
      submitterName?: string;
      timeTakenMs?: number;
    }
  ): Submission {
    const submission: ExtendedSubmission = {
      submissionId: uuidv4(),
      sudokuId: sudoku.sudokuId,
      sudokuSubmission: opts?.submissionPuzzle,
      timeTakenMs: opts?.timeTakenMs || 0,
      dateStarted: `${new Date().toISOString()}`,
      dateCompleted: "",
      ipAddress: `${IPAddressService.getIPAddress(req)}`,
      timesValidated: 0,
      invalidSubmissionCount: 0,
      valid: opts?.validation?.valid,
      complete: opts?.validation?.complete,
      submitterName: opts?.submitterName || "",
    };
    SubmissionsDynamoDbService.saveSubmission(submission);
    return submission;
  }

  private static updateSubmission(
    req: Request,
    partial: Partial<ExtendedSubmission>
  ): Submission {
    const submission: ExtendedSubmission = {
      submissionId: partial.submissionId || uuidv4(),
      sudokuId: partial.sudokuId || "",
      sudokuSubmission: partial.sudokuSubmission,
      timeTakenMs: partial.timeTakenMs || 0,
      dateCompleted: partial.dateCompleted || `${new Date().toISOString()}`,
      dateStarted: partial.dateStarted || `${new Date().toISOString()}`,
      ipAddress: `${IPAddressService.getIPAddress(req)}`,
      timesValidated:
        typeof partial.timesValidated !== "undefined"
          ? partial.timesValidated
          : 0,
      invalidSubmissionCount:
        typeof partial.invalidSubmissionCount !== "undefined"
          ? partial.invalidSubmissionCount
          : 0,
      valid: partial.valid,
      complete: partial.complete,
      submitterName: partial.submitterName || "",
    };
    SubmissionsDynamoDbService.saveSubmission(submission);
    return submission;
  }

  /**
   * POST a list of sudokus using filters
   */
  static async postSudokuList(req: Request, res: Response): Promise<void> {
    try {
      console.log("POST postSudokuList");
      console.log(req.body);
      const request = req.body as PostSudokuListRequest;

      const params: ListSudokuParams = {
        generatorJobId: request.filters?.generatorJobId,
      };

      if (request.filters?.dateGenerated) {
        const fromDate = new Date();
        fromDate.setDate(
          new Date().getDate() - (request.filters.dateGenerated.days || 5)
        );
        params.dateGenerated = {
          to: new Date(),
          from: fromDate,
        };
      }

      let sudokus: Sudoku[] = await SudokuDynamoDBService.listSudokus(params);

      if (request.pagination) {
        sudokus = sudokus
          .sort(
            (a, b) => +new Date(b.dateGenerated) - +new Date(a.dateGenerated)
          )
          .splice(0, request.pagination.limit || 5);
      }

      const listedSudokus: SudokuListResponse = sudokus.map((s: Sudoku) => {
        const listedSudoku: SudokuDto = {
          sudokuId: s.sudokuId,
          puzzle: s.puzzle,
          solution: s.solution,
          dateGenerated: s.dateGenerated,
          clues: s.clues,
          difficulty: s.difficulty,
          generationJobId: s.generationJobId,
        };
        return listedSudoku;
      });

      res.status(200).send(listedSudokus);
    } catch (e) {
      console.error(e);
      res.status(500).send(SudokuInternalServerError((e as Error).message));
    }
  }

  /**
   * GET a single sudoku using sudokuId
   */
  static async getSudoku(req: Request, res: Response): Promise<void> {
    try {
      console.log("GET getSudoku");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request: GetSudokuRequest = req.params as any;

      const sudoku: Sudoku | undefined | void =
        await SudokuDynamoDBService.getSudoku(request.sudokuId).catch((e) => {
          console.error(e);
        });

      if (!sudoku) {
        res.status(404).send(SudokuNotFoundResponse(request.sudokuId));
        return;
      }

      const submission = SudokuAPI.createSubmission(req, sudoku);

      const response: SudokuResponse = {
        sudokuId: sudoku.sudokuId,
        puzzle: JSON.parse(sudoku.puzzle),
        submissionId: submission.submissionId,
      };

      res.status(200).send(response);
    } catch (e) {
      console.error(e);
      res.status(500).send(SudokuInternalServerError((e as Error).message));
    }
  }

  /**
   * GET a sudoku leaderboard using sudokuId
   */
  public static async getSudokuLeaderboard(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log("GET getSudokuLeaderboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request: GetSudokuLeaderboardRequest = req.params as any;

      const leaderboard =
        await SubmissionsDynamoDbService.getCompletedSubmissionsForSudoku(
          request.sudokuId
        );

      const response: SudokuLeaderboardResponse = {
        leaderboard:
          leaderboard
            ?.filter((item) => item.timeTakenMs)
            .sort((a, b) => a.timeTakenMs - b.timeTakenMs) || [],
      };

      res.status(200).send(response);
    } catch (e) {
      console.error(e);
      res.status(500).send(SudokuInternalServerError((e as Error).message));
    }
  }

  /**
   * POST Submit a partial or complete solution to a sudoku puzzle
   */
  static async postSubmission(req: Request, res: Response): Promise<void> {
    try {
      console.log("POST postSubmission");
      console.log(req.body);
      const submissionRequest: PostSubmissionRequest = req.body;

      const sudoku: Sudoku | undefined | void =
        await SudokuDynamoDBService.getSudoku(submissionRequest.sudokuId).catch(
          (e) => {
            console.error(e);
          }
        );

      if (!sudoku) {
        res
          .status(404)
          .send(SubmitSudokuNotFoundError(submissionRequest.sudokuId));
        return;
      }

      const startSubmission = await SubmissionsDynamoDbService.getSubmission(
        submissionRequest.sudokuSubmissionId
      );

      if (typeof startSubmission === "undefined") {
        throw Error("start submission is missing");
      }

      const response: ExtendedSubmitSudokuResponse = {
        complete:
          sudoku?.solution.replace(/ /g, "") ===
          submissionRequest.sudokuSubmission,
        valid: SudokuValidatorService.isSudokuSubmissionValid(
          sudoku?.puzzle || "",
          submissionRequest.sudokuSubmission,
          sudoku?.solution || ""
        ),
        validationIssues: [],
        timesValidated: startSubmission?.timesValidated
          ? startSubmission.timesValidated + 1
          : 1,
      };

      if (!response.valid) {
        response.validationIssues =
          SudokuValidatorService.getSudokuValidationIssues(
            submissionRequest.sudokuSubmission,
            sudoku?.solution || ""
          );
        response.invalidSubmissionCount =
          startSubmission?.invalidSubmissionCount
            ? startSubmission.invalidSubmissionCount + 1
            : 1;
      }

      const completedDate = new Date();
      if (response.complete) {
        if (startSubmission.dateStarted) {
          response.timeTakenMs =
            +completedDate - +new Date(startSubmission?.dateStarted);
          startSubmission.dateCompleted = completedDate.toISOString();
        }
      }

      SudokuAPI.updateSubmission(req, {
        ...startSubmission,
        sudokuSubmission: submissionRequest.sudokuSubmission,
        complete: response.complete,
        valid: response.valid,
        timeTakenMs: response.timeTakenMs,
        timesValidated: response.timesValidated,
        invalidSubmissionCount: response.invalidSubmissionCount,
        submitterName: submissionRequest.submitterName,
      });

      res.status(200).send(response);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .send(SubmitSudokuInternalServerError((e as Error).message));
    }
  }

  /**
   * POST Endpoint to trigger the Python Lambda for sudoku generation
   */
  static async generateSudoku(req: Request, res: Response): Promise<void> {
    console.log("POST generateSudoku");
    console.log(req.params, req.body);
    const request = req.body as PostGenerateSudokuRequest;

    if (request.roberto !== "testing") {
      const msg =
        // eslint-disable-next-line quotes
        'Error: Testing flag not set in message body: { "roberto": "testing" }';
      SudokuAPI.badRequest(msg, res);
      return;
    }

    const difficulty = request.difficulty || "not specified";
    if (!Object.values<string>(SudokuDifficulty).includes(difficulty)) {
      SudokuAPI.badRequest(
        `Error: Sudoku generation difficulty not recognised: '${difficulty}'`,
        res
      );
      return;
    }

    if (!ConfigService.FeatureFlags.sudokuGenerationEnabled) {
      const info =
        "Sudoku Generation feature disabled, so lambda was not invoked.";
      console.log(info);
      res.status(200).send({ info });
      return;
    }

    const generationJobId = uuidv4();
    const generateSudokuJson: GenerateSudokuJson = {
      difficulty,
      generatorIPAddress: `${IPAddressService.getIPAddress(req)}`,
      generatorUserName: request.generatorUserName || "anonymous",
      generationJobId,
    };
    console.log(
      `Triggering sudoku generation lambda (Difficulty: ${difficulty})`
    );
    S3BucketService.s3
      .putObject({
        Bucket: ConfigService.SudokuGenerateJsonBucket,
        Key: `${generationJobId}.json`,
        Body: JSON.stringify(generateSudokuJson),
      })
      .promise();
    const response: GenerateSudokuResponse = { generationJobId };
    res.status(200).send(response);
  }

  static async generateSudokuCallback(
    req: Request<unknown, unknown, PostGenerateSudokuCallbackRequest>,
    res: Response
  ): Promise<void> {
    console.log("POST generateSudokuCallback");
    console.log(req.params, req.body);
    const request = req.body;

    if (
      request.sudokuInsertionSecurityKey !== ConfigService.SudokuGenSecurityKey
    ) {
      SudokuAPI.unauthorised(
        "Error: SUDOKU_GEN_SECURITY_KEY env var not matching for 'sudokuInsertionSecurityKey' in body",
        res
      );
      return;
    }
    if (!(request.puzzle && request.solution && request.difficulty)) {
      SudokuAPI.badRequest(
        "Error: Need to specify 'puzzle', 'solution' and 'difficulty'",
        res
      );
      return;
    }

    if (!ConfigService.FeatureFlags.sudokuGenerationEnabled) {
      const info =
        "Sudoku Generation feature disabled, so sudoku was not created.";
      console.log(info);
      res.status(200).send({ info });
      return;
    }

    try {
      // Could do this whole step before the lambda executes and just update it.
      const sudokuId = uuidv4();
      console.log(`Inserting sudoku into db: ${sudokuId}`);
      SudokuDynamoDBService.saveSudoku({
        sudokuId,
        puzzle: request.puzzle,
        solution: request.solution,
        dateGenerated: `${new Date().toISOString()}`,
        clues: request.clues,
        difficulty: request.difficulty,
        generatorIPAddress: request.generatorIPAddress,
        generatorUserName: request.generatorUserName,
        generationJobId: request.generationJobId,
      });
      // Don't really care what is sent back to the lambda
      res.status(200).send({});
    } catch (e) {
      console.error(e);
      res.status(500).send({ errorMessage: e } as ErrorResponse);
    }
  }

  static badRequest(errorMessage: string, res: Response): void {
    console.error(errorMessage);
    res.status(400).send({ errorMessage } as ErrorResponse);
  }

  static unauthorised(errorMessage: string, res: Response): void {
    console.error(errorMessage);
    res.status(401).send({ errorMessage } as ErrorResponse);
  }
}

export default SudokuAPI;
