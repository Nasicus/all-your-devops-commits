import { Textarea } from "@mantine/core";
import { FC } from "react";
import { FileChange, RepoResult } from "./models";

export const JsonCommitResult: FC<{
  fileChanges: FileChange;
  totalCommits: number;
  commits: RepoResult[];
}> = ({ fileChanges, totalCommits, commits }) => {
  return (
    <Textarea
      minRows={20}
      readOnly={true}
      onClick={(e) => e.currentTarget.select()}
      value={JSON.stringify(
        {
          fileChanges,
          totalCommits,
          repos: commits,
        },
        null,
        2
      )}
    ></Textarea>
  );
};
