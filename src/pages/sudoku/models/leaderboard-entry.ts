import { Submission } from "robrendellwebsite-common";

export type LeaderboardEntry = Pick<
  Submission,
  "timeTakenMs" | "dateSubmitted" | "submitterName"
>;
