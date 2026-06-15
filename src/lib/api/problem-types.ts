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
  isShareSubmission?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProblemRequestPayload {
  title: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  sampleTestcase?: string;
  isPublic: boolean;
  isShareSubmission: boolean;
  timeLimit: number;
  memoryLimit: number;
  allowedLanguage: string[];
  categories?: string[];
  difficulty?: number;
}

export interface Category {
  id: string;
  title: string;
}

export interface SpringPage<T> {
  content: T[];
  page: {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export function getSpringPageMeta<T>(data: SpringPage<T>) {
  return {
    totalElements: data.page.totalElements ?? 0,
    totalPages: Math.max(1, data.page.totalPages ?? 1),
    size: data.page.size ?? 10,
    number: data.page.number ?? 0,
  };
}

export interface ProblemListParams {
  title?: string;
  category?: string;
  difficulty?: number;
  isPublic?: boolean;
  page?: number;
  size?: number;
}
