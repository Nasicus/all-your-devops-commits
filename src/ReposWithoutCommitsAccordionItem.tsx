import { FC } from "react";
import { RepoLink } from "./RepoLink";
import { RepoResult } from "./models";
import { Accordion } from "@mantine/core";

export const ReposWithoutCommitsAccordionItem: FC<{ result: RepoResult[] }> = ({
  result,
}) => {
  const reposWithoutCommits = result.filter(
    (r) => r.commits.length <= 0 && r.errors.length <= 0
  );

  return (
    <Accordion.Item value="noCommits">
      <Accordion.Control>
        {reposWithoutCommits.length} repos without commits
      </Accordion.Control>
      <Accordion.Panel>
        <ul>
          {reposWithoutCommits.map((r) => (
            <li key={r.name}>
              <RepoLink repo={r} />
            </li>
          ))}
        </ul>
      </Accordion.Panel>
    </Accordion.Item>
  );
};
