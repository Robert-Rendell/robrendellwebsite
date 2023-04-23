/* eslint-disable import/no-cycle, object-curly-newline */
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Submission as SubmissionModel } from "robrendellwebsite-common";
import { Sudoku } from "./sudoku.entity";

type ISubmissionModel = Omit<SubmissionModel, "sudokuId" | "submissionId">;
@Entity()
export class Submission implements ISubmissionModel {
  @PrimaryColumn()
  id!: string;
  @ManyToOne(() => Sudoku, (sudoku) => sudoku.submissions)
  @JoinColumn()
  sudoku!: Sudoku;
  @Column()
  sudokuSubmission!: string;
  @Column()
  timesValidated!: number;
  @Column()
  timeTakenMs!: number;
  @Column()
  dateCompleted!: string;
  @Column()
  dateStarted!: string;
  @Column()
  ipAddress!: string;
  @Column()
  submitterName!: string;
}
