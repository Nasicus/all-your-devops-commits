import { Accordion, TextInput, Tabs } from "@mantine/core";
import { FC, useState } from "react";
import { CommitList } from "./CommitList";
import { CommitsPerMonthChart } from "./CommitsPerMonthChart";
import { JsonCommitResult } from "./JsonCommitResult";
import { Commit, RepoResult } from "./models";

export const ReposWithCommitsAccordionItem: FC<{ result: RepoResult[] }> = ({
  result,
}) => {
  const [filter, setFilterValue] = useState("");

  const reposWithCommits = result
    .filter((r) => r.commits.values.length > 0)
    .map(applyFilter)
    .filter((r) => !!r);

  const allCommits = reposWithCommits.reduce<Commit[]>(
    (commits, r) => [...commits, ...r.commits.values],
    []
  );

  return (
    <Accordion.Item value="withCommits">
      <Accordion.Control>
        {reposWithCommits.length} repos with {allCommits.length} commits
      </Accordion.Control>
      <Accordion.Panel>
        <TextInput
          label="Filter"
          placeholder="Repo name, commit message or commitId"
          value={filter}
          onChange={(e) => setFilterValue(e.target.value)}
        />
        <br />
        <CommitsPerMonthChart commits={allCommits} />
        <Tabs defaultValue="HTML">
          <Tabs.List>
            <Tabs.Tab value="HTML">Html</Tabs.Tab>
            <Tabs.Tab value="JSON">Json</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="HTML" pt="xs">
            <CommitList commits={reposWithCommits} />
          </Tabs.Panel>
          <Tabs.Panel value="JSON" pt="xs">
            <JsonCommitResult
              totalCommits={allCommits.length}
              commits={reposWithCommits}
            />
          </Tabs.Panel>
        </Tabs>
      </Accordion.Panel>
    </Accordion.Item>
  );

  function applyFilter(repo: RepoResult): RepoResult {
    if (!filter) {
      return repo;
    }

    const lowerFilter = filter.toLowerCase();

    if (repo.name.toLowerCase().includes(lowerFilter)) {
      return repo;
    }

    const filteredCommits = repo.commits.values.filter(
      (c) =>
        c.id.includes(lowerFilter) ||
        c.message.toLowerCase().includes(lowerFilter)
    );

    if (!filteredCommits.length) {
      return null;
    }

    return {
      ...repo,
      commits: {
        ...repo.commits,
        values: filteredCommits,
      },
    };
  }
};
