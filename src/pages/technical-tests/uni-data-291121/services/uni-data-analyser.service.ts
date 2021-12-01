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
      const sumStudentRating: { [key: string]: number } = {};
      const totals: { [key: string]: number } = {};

      for (const item of bestUnisArrayForSubject) {
        if (!sumStudentRating[item.institution_name]) sumStudentRating[item.institution_name] = 0;
        if (!totals[item.institution_name]) totals[item.institution_name] = 0;
        sumStudentRating[item.institution_name] += item.student_rating;
        totals[item.institution_name] += 1;
      }

      let maxAverage = 0;
      let institutionName = '';
      for (const [iName, studentRatingTotals] of Object.entries(sumStudentRating)) {
        const totalNumberOfRatings = totals[iName];
        const average = studentRatingTotals / totalNumberOfRatings;
        if (average > maxAverage) {
          maxAverage = average;
          institutionName = iName;
        }
      }
      graph.series.push({
        name: `${subject} - ${institutionName}`,
        data: [maxAverage],
      });
      // graph.xAxis.push(subject);
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

  public listOfSubjectsAndWhereToStudy(): string[] {
    const permutations = new Set<string>();
    const result: string[] = [];
    this.submissions.forEach((submission: Submission) => {
      submission.subjects.forEach((subject: UniversitySubject) => {
        const instName = this.getInstitution(submission.institution_id)?.name;
        permutations.add(`${subject.name}: ${instName}`);
        const i = result.findIndex(
          (value: string, index: number, obj: string[]) => value.includes(subject.name),
        );
        if (i >= 0) {
          if (instName && !result[i].includes(instName)) {
            result[i] = `${result[i]}, ${instName}`;
          }
        } else {
          result.push(`${subject.name}: ${instName}`);
        }
      });
    });
    return [...result];
  }

  public submissionsPerYear(): Graph {
    const graph: Graph = {
      xAxis: [],
      series: [],
    };
    const years = [...new Set(this.submissions.map((sub: Submission) => sub.year))].sort();
    const yearCounts: number[] = [];
    graph.xAxis = years.map((y) => `${y}`);
    years.forEach((year, i) => {
      yearCounts.push(0);
      this.submissions.forEach((sub, j) => {
        if (sub.year === year) {
          yearCounts[i] += 1;
        }
      });
    });
    graph.series.push({
      data: yearCounts,
      name: 'Year',
    });
    return graph;
  }

  private getInstitution(institutionId: string): Institution | undefined {
    return this.institutions.find(
      (value: Institution, index: number, obj: Institution[]) => value.id === institutionId,
    );
  }
}

export { UniDataAnalyserService as default };
