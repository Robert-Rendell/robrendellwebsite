/* eslint-disable import/no-cycle */
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  OneToMany,
} from "typeorm";
import { Sudoku as SudokuModel } from "robrendellwebsite-common";
import { Submission } from "./submission.entity";

@Entity()
export class Sudoku implements Omit<SudokuModel, "sudokuId"> {
  @PrimaryColumn()
  id!: string;
  @Column()
  puzzle!: string;
  @Column()
  solution!: string;
  @CreateDateColumn()
  dateGenerated!: string;
  @Column()
  clues!: number;
  @Column()
  difficulty!: string;
  @Column()
  generatorIPAddress!: string;
  @Column()
  generatorUserName!: string;
  @Column()
  generationJobId!: string;
  @OneToMany(() => Submission, (submission) => submission.sudoku)
  submissions!: Submission[];
}
