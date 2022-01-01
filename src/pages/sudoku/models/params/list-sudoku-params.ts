export interface ListSudokuParams {
  dateGenerated?: {
    to: Date,
    from: Date,
    days?: number,
  };
  solved?: {
    timesSolved: number
  }
  difficulty?: string;
  generatorJobId?: string;
}
