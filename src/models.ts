export interface RepoResult {
  name: string;
  org: string;
  project: string;
  defaultBranch?: string;
  commits: Commit[];
  errors: string[];
}

export interface Commit {
  date: Date;
  message: string;
  id: string;
  fileChange: FileChange;
}

export interface FileChange {
  add: number;
  delete: number;
  edit: number;
}
