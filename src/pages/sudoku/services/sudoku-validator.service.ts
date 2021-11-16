import SudokuPuzzle from '../models/sudoku-puzzle';

class SudokuValidatorService {
  public static isSudokuSubmissionValid(
    originalPuzzle: SudokuPuzzle,
    submission: SudokuPuzzle,
    solution: SudokuPuzzle,
  ): boolean {
    let valid = true;
    const trOriginalPuzzle = originalPuzzle.trim();
    const trSubmission = submission.trim();
    const trSolution = solution.trim();
    valid = (trSubmission.length === trSolution.length);
    for (let i = 0; i < trSubmission.length; i += 1) {
      console.log(i, trOriginalPuzzle[i], trSubmission[i], trSolution[i]);
      if (trOriginalPuzzle[i] === '0' && trSubmission[i] !== '0') {
        if (trSubmission[i] !== trSolution[i]) {
          valid = false;
          break;
        }
      }
    }
    return valid;
  }
}

export { SudokuValidatorService as default };
