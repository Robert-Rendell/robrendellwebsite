import { Submission } from "./submission";

export type LeaderboardEntry = Pick<
  Submission,
  "timeTakenMs" | "dateSubmitted" | "submitterName"
>;
