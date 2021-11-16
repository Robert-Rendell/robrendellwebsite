import SudokuPuzzle from '../models/sudoku-puzzle';

class SudokuValidatorService {
  public static isSudokuSubmissionCorrect(
    originalPuzzle: SudokuPuzzle,
    submission: SudokuPuzzle,
    solution: SudokuPuzzle,
  ): boolean {
    let correct = true;
    const trOriginalPuzzle = originalPuzzle.trim();
    const trSubmission = submission.trim();
    const trSolution = solution.trim();
    correct = (trSubmission.length === trSolution.length);
    for (let i = 0; i < trSubmission.length; i += 1) {
      if (trOriginalPuzzle[i] !== '0' && trSubmission[i] !== trSolution[i]) {
        correct = false;
      }
    }
    return correct;
  }
}

export { SudokuValidatorService as default };
