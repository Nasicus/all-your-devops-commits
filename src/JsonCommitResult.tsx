import { Textarea } from "@mantine/core";
import { FC } from "react";
import { RepoResult } from "./models";

export const JsonCommitResult: FC<{
  totalCommits: number;
  commits: RepoResult[];
}> = ({ totalCommits, commits }) => {
  return (
    <Textarea
      minRows={20}
      readOnly={true}
      onClick={(e) => e.currentTarget.select()}
      value={JSON.stringify(
        {
          totalCommits,
          repos: commits,
        },
        null,
        2
      )}
    ></Textarea>
  );
};
