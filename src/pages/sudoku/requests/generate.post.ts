interface PostGenerateSudokuRequest {
  /**
   * Temporary while I decide how the UI should interface with this.
   * Must have value 'testing'
   */
  roberto: string;

  difficulty: string;

  generatorUserName: string;
}

export { PostGenerateSudokuRequest as default };
