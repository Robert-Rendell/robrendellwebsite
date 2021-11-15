import DynamoDBString from '../../../models/dynamo-db';

interface SudokuDynamoDB {
  problem: DynamoDBString,
  solution: DynamoDBString,
  sudokuId: DynamoDBString,
  generatedDate: DynamoDBString,
}

export { SudokuDynamoDB as default };
