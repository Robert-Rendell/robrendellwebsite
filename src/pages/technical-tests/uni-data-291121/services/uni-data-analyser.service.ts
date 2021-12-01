import { cloneDeep } from 'lodash';
import { BestUnisForSubject, BestUnisForSubjectObject } from '../models/best-unis-for-subject';
import { Graph } from '../models/graph';
import { Institution } from '../models/institution';
import { UniversitySubject } from '../models/subject';
import { Submission } from '../models/submission';

class UniDataAnalyserService {
  private institutions: Institution[];
  private submissions: Submission[];

  constructor(institutions: Institution[], submissions: Submission[]) {
    this.institutions = institutions;
    this.submissions = submissions;
  }

  public static getMeanUnisForSubjectsGraph(bestUnisForSubject: BestUnisForSubjectObject): Graph {
    const graph: Graph = {
      xAxis: [],
      series: [],
    };

    for (const [subject, bestUnisArrayForSubject] of Object.entries(bestUnisForSubject)) {
      const totals: { [key: string]: number } = {};
      console.log(subject);
      for (const item of bestUnisArrayForSubject) {
        if (!totals[item.institution_name]) totals[item.institution_name] = 0;
        totals[item.institution_name] += item.student_rating;
        console.log(item.institution_name, item.student_rating, totals[item.institution_name]);
      }

      let maxCount = 0;
      let institutionName = '';
      for (const [iName, count] of Object.entries(totals)) {
        if (count > maxCount) {
          maxCount = count;
          institutionName = iName;
        }
      }
      graph.series.push({
        name: institutionName,
        data: [maxCount],
      });
      graph.xAxis.push(subject);
    }
    return graph;
  }

  public bestUnisForSubject(): BestUnisForSubjectObject {
    const result: { [key: string]: any } = {};
    this.submissions.forEach((submission: Submission) => {
      submission.subjects.forEach((subject: UniversitySubject) => {
        if (!result[subject.name]) result[subject.name] = [];
        const subj: Partial<BestUnisForSubject> = cloneDeep(subject);
        const institution: Institution | undefined = this.getInstitution(submission.institution_id);
        subj.institution_name = institution?.name;
        subj.institution_id = submission.institution_id;
        result[subject.name].push(subj);
      });
    });
    return result;
  }

  private getInstitution(institutionId: string): Institution | undefined {
    return this.institutions.find(
      (value: Institution, index: number, obj: Institution[]) => value.id === institutionId,
    );
  }
}

export { UniDataAnalyserService as default };
