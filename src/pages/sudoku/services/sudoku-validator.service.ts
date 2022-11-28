import TamperingError from "../errors/tampering.error";
import SudokuPuzzle from "../models/sudoku-puzzle";

class SudokuValidatorService {
  public static isSudokuSubmissionValid(
    originalPuzzle: SudokuPuzzle,
    submission: SudokuPuzzle,
    solution: SudokuPuzzle
  ): boolean {
    let valid = true;
    const trOriginalPuzzle = SudokuValidatorService.strip(originalPuzzle);
    const trSubmission = SudokuValidatorService.strip(submission);
    const trSolution = SudokuValidatorService.strip(solution);
    valid = trSubmission.length === trSolution.length;
    for (let i = 0; i < trSubmission.length; i += 1) {
      if (trOriginalPuzzle[i] === "0" && trSubmission[i] !== "0") {
        if (trSubmission[i] !== trSolution[i]) {
          valid = false;
          break;
        }
      } else if (
        trOriginalPuzzle[i] !== "0" &&
        (trSubmission[i] === "0" || trSubmission[i] !== trOriginalPuzzle[i])
      ) {
        throw new TamperingError("Original Sudoku puzzle has been changed");
      }
    }
    return valid;
  }

  private static strip(s: string): string {
    return s.trim().replace(/ /g, "");
  }
}

export { SudokuValidatorService as default };
