import { FC } from "react";
import { RepoLink } from "./RepoLink";
import { RepoResult } from "./models";

export const CommitList: FC<{ commits: RepoResult[] }> = ({ commits }) => {
  return (
    <ul>
      {commits.map((r) => (
        <li key={r.name}>
          <RepoLink repo={r} /> ({r.defaultBranch})
          <ul>
            {r.commits.values.map((c) => (
              <li key={c.id}>
                {c.date.toISOString()}: {c.message} (
                <a
                  href={`https://dev.azure.com/${r.org}/${r.project}/_git/${r.name}/commit/${c.id}`}
                  target="_blank"
                >
                  {c.id}
                </a>
                )
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};
