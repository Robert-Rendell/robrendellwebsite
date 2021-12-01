import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { Request, Response } from 'express';
import ConfigService from '../../../services/config.service';
import S3BucketService from '../../../services/s3-bucket.service';
import { Institution } from './models/institution';
import { Submission } from './models/submission';
import { GetDashboardGraphsResponse } from './response/get-dashboard-graphs.response';

class TechTestUniDataAPI {
  static Routes = {
    getDashboardGraphs: '/tech-tests/291121/getDashboardGraphs',
  }

  private static async grabLatestS3Files(): Promise<any> {
    const institutionsFilePromise = S3BucketService.s3.getObject({
      Key: ConfigService.TechnicalTestUniDataConfig.institutionsFile,
      Bucket: ConfigService.TechnicalTestUniDataConfig.bucket,
    }).promise();

    const submissionsFilePromise = S3BucketService.s3.getObject({
      Key: ConfigService.TechnicalTestUniDataConfig.submissionsFile,
      Bucket: ConfigService.TechnicalTestUniDataConfig.bucket,
    }).promise();

    return Promise.all([
      institutionsFilePromise,
      submissionsFilePromise,
    ]);
  }

  /**
   * GET the dashboard of graphs
   */
  public static async getDashboardGraphs(req: Request, res: Response): Promise<void> {
    try {
      const s3Files: GetObjectOutput[] = await TechTestUniDataAPI.grabLatestS3Files();
      const institutionFile: GetObjectOutput = s3Files[0];
      const submissionsFile: GetObjectOutput = s3Files[1];

      const response: GetDashboardGraphsResponse = {
        rawData: {
          submissions: JSON.parse(submissionsFile.Body?.toString() || '') as Submission[],
          institutions: JSON.parse(institutionFile.Body?.toString() || '') as Institution[],
        },
        bestUnisForSubject: [],
        submissionsPerYear: [],
        listOfSubjectsAndWhereToStudy: [],
        covid19CasesPerInstitution: [],
      };

      res.status(200).send(response);
    } catch (e) {
      console.error(e);
      res.status(500).send(`GET getDashboardGraphs error: ${e}`);
    }
  }
}

export { TechTestUniDataAPI as default };
