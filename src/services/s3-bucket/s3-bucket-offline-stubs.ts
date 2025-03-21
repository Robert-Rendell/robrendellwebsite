import {
  DOG_WALKING_CALENDAR_JSON,
  ROBS_FREE_DOG_WALKS_FOLDER_KEY,
} from "../../standalone/robs-free-dog-walks/const";

export const S3BucketOfflineStubs: Record<string, any> = {
  "robrendellwebsite-public/robs-free-dog-walks/dog-breeds.json": {
    dogs: ["Stub dog", "Stubbier dog"],
  },
  [`robrendellwebsite-public/${ROBS_FREE_DOG_WALKS_FOLDER_KEY}${DOG_WALKING_CALENDAR_JSON}`]:
    {
      dogs: ["Stub dog", "Stubbier dog"],
    },
};
