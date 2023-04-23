export interface RepoResult {
  name: string;
  org: string;
  project: string;
  defaultBranch: string;
  commits: CommitsResult;
}

export interface CommitsResult {
  errors: string[];
  values: Commit[];
}

export interface Commit {
  date: Date;
  message: string;
  id: string;
}
