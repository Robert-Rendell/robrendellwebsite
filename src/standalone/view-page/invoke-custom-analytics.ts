import AWS from "aws-sdk";
import { ConfigService } from "../../services/config.service";

type CustomAnalyticsArgs = {
  pageRoute: string;
  browserAgent: string;
  ipAddress: string;
  dateTime: string;
};

export function invokeCustomAnalyticsLambda(args: CustomAnalyticsArgs) {
  const lambda = new AWS.Lambda();
  const params = {
    FunctionName: ConfigService.CustomAnalyticsARN,
    Payload: JSON.stringify(args),
  };
  lambda.invoke(params, (err, data) => {
    if (err) {
      console.error("Error invoking Lambda function:", err);
    } else {
      console.log("Lambda function invoked successfully:", data);
    }
  });
}
