import { UniversitySubject } from "./subject";

export interface BestUnisForSubject extends Omit<UniversitySubject, "name"> {
  institution_id: string;
  institution_name: string;
}

export interface BestUnisForSubjectObject {
  [key: string]: BestUnisForSubject[];
}
