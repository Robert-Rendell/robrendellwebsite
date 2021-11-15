import ConfigService from '../../../services/config-service';
import DynamoDBService from '../../../services/dynamo-db.service';
import { Sudoku } from '../models/sudoku';
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

    const sudoku: Sudoku = {
      dateGenerated: sudokuAttributeMap.generatedDate.S,
      puzzle: sudokuAttributeMap.problem.S,
      solution: sudokuAttributeMap.solution.S,
      id: sudokuAttributeMap.sudokuId.S,
    };
    return sudoku;
  }
}
