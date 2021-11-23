import AWS from 'aws-sdk';
import ConfigService from '../../../services/config.service';
import DynamoDBService from '../../../services/dynamo-db.service';
import { Sudoku } from '../models/sudoku';
import SudokuPuzzle from '../models/sudoku-puzzle';
import SudokuDynamoDB from '../models/sudoku.dynamodb';

export default class SudokuDynamoDBService extends DynamoDBService {
  private static PartitionKey = 'sudokuId';

  public static async saveSudoku(sudoku: Sudoku): Promise<void> {
    const marshalled = AWS.DynamoDB.Converter.marshall(sudoku);
    await super.save(ConfigService.SudokuDynamoDbTable, marshalled);
  }

  public static async getSudoku(key: string): Promise<Sudoku | undefined> {
    const sudokuAttributeMap = await super.load(
      ConfigService.SudokuDynamoDbTable,
      SudokuDynamoDBService.PartitionKey,
      key,
    ) as unknown as SudokuDynamoDB;

    if (!sudokuAttributeMap) return undefined;

    const puzzle: SudokuPuzzle = sudokuAttributeMap.puzzle
      ? sudokuAttributeMap.puzzle.S
      : sudokuAttributeMap.problem.S;

    const dateGenerated: string = sudokuAttributeMap.generatedDate
      ? sudokuAttributeMap.generatedDate.S
      : sudokuAttributeMap.dateGenerated.S;

    const sudoku: Sudoku = {
      dateGenerated,
      puzzle,
      solution: sudokuAttributeMap.solution.S,
      sudokuId: sudokuAttributeMap.sudokuId.S,
      clues: sudokuAttributeMap.clues?.N,
      difficulty: sudokuAttributeMap.difficulty?.S,
      generatorIPAddress: sudokuAttributeMap.generatorIPAddress?.S,
      generatorUserName: sudokuAttributeMap.generatorUserName?.S,
      generationJobId: sudokuAttributeMap.generatorJobId?.S,
    };

    return sudoku;
  }
}
