import { AppDataSource } from "../../../data-source";
import { Sudoku } from "../entities/sudoku.entity";

export const SudokuRepository = AppDataSource.getRepository(Sudoku);
