import SudokuValidatorService from '../../../../src/pages/sudoku/services/sudoku-validator.service';

describe('SudokuValidatorService', () => {
  describe('isSudokuSubmissionCorrect fn', () => {
    test('partial solutions can be correct and unfinished', () => {
      /**
       * {
          "hello": 1,
          "sudokuId": "0",
          "sudokuSubmission": "[[1,6,2,4,5,3,7,8,9],
          [3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],
          [6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],
          [5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,0,8]]",
          "timeTaken": 0
       */
      const puzzle = '[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]';
      const submission = '[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,0,8]]';
      const solution = '[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]';
      expect(
        SudokuValidatorService.isSudokuSubmissionCorrect(
          puzzle, submission, solution,
        ),
      ).toBe(true);
    });

    test('partial solutions can be incorrect and unfinished: example A', () => {
      const puzzle = '[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]';
      const submission = '[[1,6,2,4,1,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,0,8]]';
      const solution = '[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]';
      expect(
        SudokuValidatorService.isSudokuSubmissionCorrect(
          puzzle, submission, solution,
        ),
      ).toBe(false);
    });

    test('partial solutions can be incorrect and unfinished: example B', () => {
      const puzzle = '[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]';
      const submission = '[[1,0,0,0,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,0,8]]';
      const solution = '[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]';
      expect(
        SudokuValidatorService.isSudokuSubmissionCorrect(
          puzzle, submission, solution,
        ),
      ).toBe(false);
    });

    test('partial solutions can be correct and unfinished: example A', () => {
      const puzzle = '[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]';
      const submission = '[[1,0,0,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,0,8]]';
      const solution = '[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]';
      expect(
        SudokuValidatorService.isSudokuSubmissionCorrect(
          puzzle, submission, solution,
        ),
      ).toBe(true);
    });

    test('solution and submission should both be trimmed', () => {
      const puzzle = '[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]';
      const submission = '    [[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,0,8]]  ';
      const solution = ' [[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]] ';
      expect(
        SudokuValidatorService.isSudokuSubmissionCorrect(
          puzzle, submission, solution,
        ),
      ).toBe(true);
    });
  });
});
