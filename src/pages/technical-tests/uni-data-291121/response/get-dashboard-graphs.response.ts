import { BestUnisForSubjectObject } from '../models/best-unis-for-subject';
import { Graph } from '../models/graph';
import { Institution } from '../models/institution';
import { Submission } from '../models/submission';

export interface GetDashboardGraphsResponse {
  /**
   * Expose the raw data as well for ease of debugging
   * but this could be removed later to reduce payload size
   * which would mean the graphs load quicker on the front end
   */
  rawData: {
    submissions: Submission[];
    institutions: Institution[];
  };

  /**
   * Produce a list of the best institutions to study a particular subject
   */
  bestUnisForSubject: Graph;
  bestUnisForSubjectRaw: BestUnisForSubjectObject;

  /**
   * Display some submission data per institution for each year in either a table or chart
   */
  submissionsPerYear: string[],

  /**
   * Show a list of subjects and which institutions you can study them at
   */
  listOfSubjectsAndWhereToStudy: string[];

  /**
   * Enhance the data by adding some new data
   * e.g. adding how many Covid-19 cases there have been per country/institution
   * (N.B. as our dataset names are made up, feel free to amend them to show it working)
   */
  covid19CasesPerInstitution: string[];
}
