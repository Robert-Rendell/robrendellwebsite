import { DynamoDBString, DynamoDBNumber } from '../../../models/dynamo-db';

/**
 * Used for reading from DynamoDB and mapping to the model.
 * Supports interchangeable attributes for maximum flexibility on schemaless objects
 */
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

  /**
   * Number of numbers filled in, in the puzzle; before you begin solving.
   */
  clues: DynamoDBNumber,

  /**
   * The difficulty decided by the user who generated it
   */
  difficulty: DynamoDBString,

  /**
   * IP Address of client who triggered the sudoku generation
   */
  generatorIPAddress: DynamoDBString,

  /**
   * Name of user who triggered the sudoku generation
   */
  generatorUserName: DynamoDBString,

  /**
   * Job id of lambda task running. Not sure if this will be useful yet
   */
  generatorJobId: DynamoDBString,
}

export { SudokuDynamoDB as default };
