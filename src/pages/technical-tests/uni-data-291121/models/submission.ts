import { UniversitySubject } from './subject';

export interface Submission {
  'academic_papers': number;
  id: string;
  'institution_id': string;
  'institution_income': number;
  'postgraduates_total': number;
  'staff_total': number;
  'students_total': number;
  subjects: UniversitySubject[];
  'undergraduates_total': number;
  year: number;
}
