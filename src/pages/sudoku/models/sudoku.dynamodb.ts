import DynamoDBString from '../../../models/dynamo-db';

interface SudokuDynamoDB {
  /**
   * 'puzzle' is interchangeable with 'problem'.
   */
  puzzle: DynamoDBString,
  /**
   * 'problem' is interchangeable with 'puzzle'.
   */
  problem: DynamoDBString,
  solution: DynamoDBString,
  sudokuId: DynamoDBString,

  /**
   * 'dateGenerated' is interchangeable with 'generatedDate'
   */
  dateGenerated: DynamoDBString,
  /**
   * 'generatedDate' is interchangeable with 'dateGenerated'
   */
  generatedDate: DynamoDBString,
}

export { SudokuDynamoDB as default };
