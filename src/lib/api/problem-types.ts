export interface Problem {
  id: string;
  title: string;
  difficulty?: number | null;
  categories?: string[] | null;
  description?: string;
  inputDescription?: string;
  outputDescription?: string;
  sampleTestcase?: string;
  timeLimit?: number;
  memoryLimit?: number;
  allowedLanguage?: string[];
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  title: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ProblemListParams {
  title?: string;
  category?: string;
  difficulty?: number;
  page?: number;
  size?: number;
}
