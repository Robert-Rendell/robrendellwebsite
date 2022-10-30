import AWS from 'aws-sdk';
import { ExpressionAttributeValueMap } from 'aws-sdk/clients/dynamodb';
import { SudokuPuzzle } from 'robrendellwebsite-common';
import { ListSudokuParams } from 'robrendellwebsite-common/src/models/sudoku/list-sudoku-params';
import { Sudoku } from 'robrendellwebsite-common/src/models/sudoku/sudoku';
import ConfigService from '../../../services/config.service';
import DynamoDBService from '../../../services/dynamo-db.service';
import { SudokuDynamoDB } from '../db-models/sudoku.dynamodb';

export default class SudokuDynamoDBService extends DynamoDBService {
  private static PartitionKey = 'sudokuId';

  public static async saveSudoku(sudoku: Sudoku): Promise<void> {
    const marshalled = AWS.DynamoDB.Converter.marshall(sudoku);
    await super.save(ConfigService.SudokuDynamoDbTable, marshalled);
  }

  /**
   * KeyConditionExpression: 'Season = :s and Episode > :e',
   * ProjectionExpression: 'Episode, Title, Subtitle',
   * FilterExpression: 'contains (Subtitle, :topic)',
   * {
   *   ':s': { N: '2' },
   *   ':e': { N: '09' },
   *   ':topic': { S: 'PHRASE' },
   * },
   */
  public static async listSudokus(params: ListSudokuParams): Promise<Sudoku[]> {
    const expMap: ExpressionAttributeValueMap = {};
    let filterExp = '';

    if (!params.generatorJobId && !params.dateGenerated) {
      console.log('Currently only supporting generatorJobId or dateGenerated listSudokus');
      return [];
    }

    if (params.generatorJobId) {
      console.log('Found GeneratorJobId in query filters, prioritising it.');
      filterExp = 'generationJobId = :jobId';
      expMap[':jobId'] = { S: params.generatorJobId };
    }

    if (params.dateGenerated) {
      filterExp = 'dateGenerated >= :dateFrom and dateGenerated <= :dateTo';
      expMap[':dateFrom'] = { S: params.dateGenerated.from.toISOString() };
      expMap[':dateTo'] = { S: params.dateGenerated.to.toISOString() };
    }

    const l = await super.list(
      ConfigService.SudokuDynamoDbTable,
      expMap,
      filterExp,
    );

    const sudokus = l?.map(
      (s) => SudokuDynamoDBService.convertAttributeMap(
        s as unknown as SudokuDynamoDB,
      ),
    );

    return sudokus || [];
  }

  public static async getSudoku(key: string): Promise<Sudoku | undefined> {
    const sudokuAttributeMap = await super.load(
      ConfigService.SudokuDynamoDbTable,
      SudokuDynamoDBService.PartitionKey,
      key,
    ) as unknown as SudokuDynamoDB;
    if (!sudokuAttributeMap) return undefined;
    return SudokuDynamoDBService.convertAttributeMap(sudokuAttributeMap);
  }

  private static convertAttributeMap(sudokuAttributeMap: SudokuDynamoDB): Sudoku {
    const puzzle: SudokuPuzzle = sudokuAttributeMap.puzzle
      ? sudokuAttributeMap.puzzle.S
      : sudokuAttributeMap.problem.S;

    const dateGenerated: string = sudokuAttributeMap.generatedDate
      ? sudokuAttributeMap.generatedDate.S
      : sudokuAttributeMap.dateGenerated.S;

    return {
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
  }
}
