import { AppDataSource } from "../../../data-source";
import { Submission } from "../entities/submission.entity";

export const SubmissionRepository = AppDataSource.getRepository(Submission);
