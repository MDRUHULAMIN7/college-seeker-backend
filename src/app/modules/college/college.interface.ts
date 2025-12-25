export interface IResearchPaper {
  title: string;
  link: string;
}
export interface IGraduate {
  name?: string;
  photo: string;
}

export interface ICollege {
  name: string;
  image: string;

  shortDescription: string;
  admissionDate: string;

  rating?: number;
  researchCount?: number;

  researchHistory?: string;

  events: string[];
  sports: string[];

  gallery?: string[];
  researchPapers?: IResearchPaper[];
  graduates?: IGraduate[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
