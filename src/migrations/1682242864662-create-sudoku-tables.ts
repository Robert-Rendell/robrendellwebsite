import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSudokuTables1682242864662 implements MigrationInterface {
  name = "CreateSudokuTables1682242864662";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sudoku" ("id" character varying NOT NULL, "puzzle" character varying NOT NULL, "solution" character varying NOT NULL, "dateGenerated" TIMESTAMP NOT NULL DEFAULT now(), "clues" integer NOT NULL, "difficulty" character varying NOT NULL, "generatorIPAddress" character varying NOT NULL, "generatorUserName" character varying NOT NULL, "generationJobId" character varying NOT NULL, CONSTRAINT "PK_1324e8d33f340048b942523331d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "submission" ("id" character varying NOT NULL, "sudokuSubmission" character varying NOT NULL, "timesValidated" integer NOT NULL, "timeTakenMs" integer NOT NULL, "dateCompleted" character varying NOT NULL, "dateStarted" character varying NOT NULL, "ipAddress" character varying NOT NULL, "submitterName" character varying NOT NULL, "sudokuId" character varying, CONSTRAINT "PK_7faa571d0e4a7076e85890c9bd0" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD CONSTRAINT "FK_75ddf521232124298046e024e3a" FOREIGN KEY ("sudokuId") REFERENCES "sudoku"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "submission" DROP CONSTRAINT "FK_75ddf521232124298046e024e3a"`
    );
    await queryRunner.query(`DROP TABLE "submission"`);
    await queryRunner.query(`DROP TABLE "sudoku"`);
  }
}
