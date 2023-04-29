import { FC } from "react";
import { RepoResult } from "./models";

export const RepoLink: FC<{ repo: RepoResult }> = ({ repo }) => {
  return (
    <a
      href={`https://dev.azure.com/${repo.org}/${repo.project}/_git/${repo.name}`}
      target="_blank"
    >
      {repo.name} ({repo.project})
    </a>
  );
};
