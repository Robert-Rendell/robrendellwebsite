import ConfigService from '../../../services/config-service';
import DynamoDBService from '../../../services/dynamo-db.service';
import { Sudoku } from '../models/sudoku';
import SudokuPuzzle from '../models/sudoku-puzzle';
import SudokuDynamoDB from '../models/sudoku.dynamodb';

export default class SudokuDynamoDBService extends DynamoDBService {
  private static PartitionKey = 'sudokuId';

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
      id: sudokuAttributeMap.sudokuId.S,
    };

    return sudoku;
  }
}
