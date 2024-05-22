import { Sudoku } from "./sudoku";

export type SudokuDto = Omit<Sudoku, "generatorIPAddress" | "generatorUserName">