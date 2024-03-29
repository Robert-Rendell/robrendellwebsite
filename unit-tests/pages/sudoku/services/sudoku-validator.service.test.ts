import SudokuValidatorService from "../../../../src/pages/sudoku/services/sudoku-validator.service";

describe("SudokuValidatorService", () => {
  describe("getSudokuValidationIssues fn", () => {
    test("should return no validation issues", () => {
      const submission =
        "[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]";
      const solution =
        "[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]";
      expect(
        SudokuValidatorService.getSudokuValidationIssues(submission, solution)
      ).toEqual([]);
    });

    test("partial solutions can be correct and unfinished: example A", () => {
      const submission =
        "[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]";
      const solution =
        "[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]";
      expect(
        SudokuValidatorService.getSudokuValidationIssues(submission, solution)
      ).toEqual([]);
    });

    test("partial solutions can be incorrect and unfinished", () => {
      const submission =
        "[[1,5,0,0,5,3,7,8,9],[3,9,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,2],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,0,8]]";
      const solution =
        "[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]";
      expect(
        SudokuValidatorService.getSudokuValidationIssues(submission, solution)
      ).toEqual([
        { col: 1, row: 0 },
        { col: 1, row: 1 },
        { col: 8, row: 4 },
      ]);
    });
  });
  describe("isSudokuSubmissionValid fn", () => {
    test("puzzle, submission and solution should be valid", () => {
      const puzzle =
        "[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]";
      const submission =
        "[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]";
      const solution =
        "[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]";
      expect(
        SudokuValidatorService.isSudokuSubmissionValid(
          puzzle,
          submission,
          solution
        )
      ).toBe(true);
    });

    test("submission should be finished and incorrect but puzzle and solution should be valid: tampering", () => {
      const puzzle =
        "[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]";
      const submission =
        "[[3,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]";
      const solution =
        "[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]";

      const fn = () => {
        SudokuValidatorService.isSudokuSubmissionValid(
          puzzle,
          submission,
          solution
        );
      };

      expect(fn).toThrowError(
        "Tampering Detected: Original Sudoku puzzle has been changed"
      );
    });

    test("submission should be finished and incorrect but puzzle and solution should be valid", () => {
      const puzzle =
        "[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]";
      const submission =
        "[[1,7,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]";
      const solution =
        "[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]";
      expect(
        SudokuValidatorService.isSudokuSubmissionValid(
          puzzle,
          submission,
          solution
        )
      ).toBe(false);
    });

    test("partial solutions can be correct and unfinished: example A", () => {
      const puzzle =
        "[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]";
      const submission =
        "[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]";
      const solution =
        "[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]";
      expect(
        SudokuValidatorService.isSudokuSubmissionValid(
          puzzle,
          submission,
          solution
        )
      ).toBe(true);
    });

    test("partial solutions can be correct and unfinished: example B", () => {
      const puzzle =
        "[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]";
      const submission =
        "[[1,0,0,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,0,8]]";
      const solution =
        "[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]";
      expect(
        SudokuValidatorService.isSudokuSubmissionValid(
          puzzle,
          submission,
          solution
        )
      ).toBe(true);
    });

    test("if the submission shows tampering with the original puzzle, it should throw an error", () => {
      const puzzle =
        "[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]";
      const submission =
        "[[1,0,0,0,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,0,8]]";
      const solution =
        "[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]";

      const fn = () => {
        SudokuValidatorService.isSudokuSubmissionValid(
          puzzle,
          submission,
          solution
        );
      };

      expect(fn).toThrowError(
        "Tampering Detected: Original Sudoku puzzle has been changed"
      );
    });

    test("partial solutions can be incorrect and unfinished", () => {
      const puzzle =
        "[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]";
      const submission =
        "[[1,5,0,0,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,0,8]]";
      const solution =
        "[[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]]";
      expect(
        SudokuValidatorService.isSudokuSubmissionValid(
          puzzle,
          submission,
          solution
        )
      ).toBe(false);
    });

    test("solution and submission should both be trimmed", () => {
      const puzzle =
        "[[1,0,0,4,5,0,0,0,0],[0,0,5,9,0,0,0,6,0],[0,8,0,0,2,0,0,3,0],[0,3,0,0,8,0,0,0,5],[0,0,7,0,0,0,6,0,0],[5,0,0,0,3,0,0,7,0],[0,9,0,0,7,0,0,4,0],[0,1,0,0,0,9,2,0,0],[0,0,0,0,4,2,0,0,8]]";
      const submission =
        "    [[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,0,8]]  ";
      const solution =
        " [[1,6,2,4,5,3,7,8,9],[3,7,5,9,1,8,4,6,2],[9,8,4,6,2,7,5,3,1],[6,3,1,7,8,4,9,2,5],[8,4,7,2,9,5,6,1,3],[5,2,9,1,3,6,8,7,4],[2,9,8,5,7,1,3,4,6],[4,1,3,8,6,9,2,5,7],[7,5,6,3,4,2,1,9,8]] ";
      expect(
        SudokuValidatorService.isSudokuSubmissionValid(
          puzzle,
          submission,
          solution
        )
      ).toBe(true);
    });

    test("solution should have spaces removed", () => {
      const puzzle =
        "[[0, 8, 1, 9, 2, 3, 0, 0, 0], [7, 9, 0, 6, 5, 1, 8, 2, 3], [2, 5, 0, 4, 8, 7, 0, 0, 0], [3, 6, 5, 2, 7, 8, 9, 4, 0], [0, 7, 9, 1, 0, 4, 5, 0, 2], [1, 4, 2, 5, 6, 9, 3, 7, 8], [0, 2, 8, 7, 0, 5, 1, 3, 6], [0, 3, 0, 8, 0, 0, 0, 0, 7], [9, 1, 0, 3, 0, 0, 0, 8, 5]]";
      const submission =
        "[[6,8,1,9,2,3,7,5,4],[7,9,4,6,5,1,8,2,3],[2,5,3,4,8,7,6,1,9],[3,6,5,2,7,8,9,4,1],[8,7,9,1,3,4,5,6,2],[1,4,2,5,6,9,3,7,8],[4,2,8,7,9,5,1,3,6],[5,3,6,8,1,2,4,9,7],[9,1,7,3,4,6,2,8,5]]";
      const solution =
        "[[6, 8, 1, 9, 2, 3, 7, 5, 4], [7, 9, 4, 6, 5, 1, 8, 2, 3], [2, 5, 3, 4, 8, 7, 6, 1, 9], [3, 6, 5, 2, 7, 8, 9, 4, 1], [8, 7, 9, 1, 3, 4, 5, 6, 2], [1, 4, 2, 5, 6, 9, 3, 7, 8], [4, 2, 8, 7, 9, 5, 1, 3, 6], [5, 3, 6, 8, 1, 2, 4, 9, 7], [9, 1, 7, 3, 4, 6, 2, 8, 5]]";
      expect(
        SudokuValidatorService.isSudokuSubmissionValid(
          puzzle,
          submission,
          solution
        )
      ).toBe(true);
    });
  });
});
